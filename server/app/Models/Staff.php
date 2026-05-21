<?php

namespace App\Models;

use App\Models\Concerns\HasProfilePhoto;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasProfilePhoto, SoftDeletes;

    protected $table = 'staff';

    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'gender_id',
        'photo',
    ];

    protected $appends = ['full_name', 'initials', 'photo_url'];

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class);
    }

    public function getFullNameAttribute(): string
    {
        $last = $this->last_name ?? '';
        $first = $this->first_name ?? '';
        $middle = $this->middle_name ? ' '.substr($this->middle_name, 0, 1).'.' : '';

        if ($last && $first) {
            return "{$last}, {$first}{$middle}";
        }

        return trim("{$first} {$last}") ?: '—';
    }

    public function getInitialsAttribute(): string
    {
        $first = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $last = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';

        return $first.$last ?: '—';
    }
}
