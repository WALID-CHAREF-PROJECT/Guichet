<?php

namespace App\Support;

use Illuminate\Support\Str;

class SlugNormalizer
{
    public static function ascii(?string $value): string
    {
        $value = trim((string) $value);
        if ($value === '') {
            return '';
        }

        $value = str_replace(
            ['œ', 'Œ', 'æ', 'Æ', 'ß', 'đ', 'Đ', 'ħ', 'Ħ'],
            ['oe', 'oe', 'ae', 'ae', 'ss', 'd', 'd', 'h', 'h'],
            $value
        );

        return Str::slug($value) ?: Str::lower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value) ?: $value, '-'));
    }

    /** @return array<int, string> */
    public static function candidates(string $value): array
    {
        $decoded = rawurldecode($value);

        return array_values(array_unique(array_filter([
            $value,
            $decoded,
            self::ascii($value),
            self::ascii($decoded),
        ], fn (?string $candidate): bool => is_string($candidate) && trim($candidate) !== '')));
    }

    /** @param array<int, string> $candidates */
    public static function matches(?string $stored, array $candidates): bool
    {
        $stored = trim((string) $stored);
        if ($stored === '') {
            return false;
        }

        $normalizedCandidates = array_values(array_unique(array_merge(
            $candidates,
            array_map(fn (string $candidate): string => self::ascii($candidate), $candidates)
        )));

        return in_array($stored, $normalizedCandidates, true)
            || in_array(self::ascii($stored), $normalizedCandidates, true);
    }
}
