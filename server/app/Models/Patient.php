<?php

namespace App\Models;

use App\Models\Concerns\HasProfilePhoto;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasProfilePhoto, SoftDeletes;

    protected $fillable = [
        'user_id',
        'username',
        'password',
        'api_token',
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'gender_id',
        'birth_date',
        'photo',
    ];

    protected $hidden = [
        'password',
        'api_token',
    ];

    protected $appends = ['full_name', 'age', 'initials', 'photo_url'];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'password' => 'hashed',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
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

    public function getAgeAttribute(): ?int
    {
        if (! $this->birth_date) {
            return null;
        }

        return $this->birth_date->age;
    }

    public function getInitialsAttribute(): string
    {
        $first = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $last = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';

        return $first.$last ?: '—';
    }
}
