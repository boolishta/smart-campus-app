export interface ScrubResult {
  sanitizedText: string;
  redactionCount: number;
}

/**
 * Strips basic PII (emails, student IDs, phone numbers) client-side
 * before transmitting anonymized text to the Gemini extraction API.
 */
export function scrubBasicPii(rawText: string): ScrubResult {
  let sanitized = rawText;
  let redactionCount = 0;

  const patterns: Array<{ regex: RegExp; replacement: string }> = [
    // Email addresses
    {
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      replacement: '[REDACTED_EMAIL]',
    },
    // Labeled Student IDs / Matriculation numbers
    {
      regex: /\b(?:Student\s*ID|Matriculation\s*No\.?|ID\s*Number|Student\s*No\.?)\s*[:#-]?\s*[A-Za-z0-9-]{4,14}\b/gi,
      replacement: '[REDACTED_STUDENT_ID]',
    },
    // Common university student ID formats (e.g. up202405123, s1234567, a98765)
    {
      regex: /\b(?:up|st|id)\d{6,10}\b/gi,
      replacement: '[REDACTED_STUDENT_ID]',
    },
    // International or local phone numbers
    {
      regex: /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?|\d{3}[\s.-])\d{3}[\s.-]\d{3,4}\b/g,
      replacement: '[REDACTED_PHONE]',
    },
  ];

  for (const { regex, replacement } of patterns) {
    sanitized = sanitized.replace(regex, () => {
      redactionCount += 1;
      return replacement;
    });
  }

  return {
    sanitizedText: sanitized,
    redactionCount,
  };
}
