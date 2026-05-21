<?php

namespace App\Models\Concerns;

trait HasProfilePhoto
{
    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo) {
            return null;
        }

        $version = $this->updated_at?->timestamp ?? time();

        return '/storage/'.$this->photo.'?v='.$version;
    }
}
