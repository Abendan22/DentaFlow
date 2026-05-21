<?php

namespace App\Models;

use App\Models\Concerns\HasProfilePhoto;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use HasProfilePhoto, SoftDeletes;

    protected $table = 'dental_doctors';

    protected $fillable = [
        'title',
        'first_name',
        'last_name',
        'phone',
        'photo',
    ];

    protected $appends = ['full_name', 'initials', 'photo_url'];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function getFullNameAttribute(): string
    {
        $title = trim($this->title ?? 'Dr.');
        if ($title && ! str_ends_with($title, '.')) {
            $title .= '.';
        }

        $first = trim($this->first_name ?? '');
        $lastRaw = trim($this->last_name ?? '');
        $suffix = '';

        if (preg_match('/\s+(DDS|DMD)$/i', $lastRaw, $matches)) {
            $suffix = ', '.$matches[1];
            $lastRaw = trim(preg_replace('/\s+(DDS|DMD)$/i', '', $lastRaw));
        }

        if ($lastRaw && $first) {
            return "{$lastRaw}, {$title} {$first}{$suffix}";
        }

        return trim("{$title} {$first} {$lastRaw}{$suffix}") ?: '—';
    }

    public function getInitialsAttribute(): string
    {
        $first = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $last = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';

        return $first.$last ?: '—';
    }
}
