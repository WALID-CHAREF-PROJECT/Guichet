const SPECIAL_ASCII: Record<string, string> = {
  œ: 'oe', Œ: 'oe', æ: 'ae', Æ: 'ae', ß: 'ss', đ: 'd', Đ: 'd', ħ: 'h', Ħ: 'h'
};

export function decodeSlugSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function asciiSlug(value: string): string {
  const decoded = decodeSlugSegment(value);
  return decoded
    .replace(/[œŒæÆßđĐħĦ]/g, (char) => SPECIAL_ASCII[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function publicProfileSlug(value: string | null | undefined, fallback = ''): string {
  return asciiSlug(value && value.trim() ? value : fallback);
}

export function encodeSlugSegment(value: string): string {
  return encodeURIComponent(publicProfileSlug(value) || decodeSlugSegment(value));
}
