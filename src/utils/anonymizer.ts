import { AnonymizationAuditEntry } from '../types';

/**
 * Strips personal identifiers from academic course documents
 * before sending text blocks to cloud Generative AI APIs.
 * Ensures strict GDPR stateless processing (RF06 / Screen E07).
 */
export function anonymizeDocumentText(
  rawText: string,
  docName: string
): {
  anonymizedText: string;
  auditEntries: AnonymizationAuditEntry[];
  redactionsCount: number;
} {
  const auditEntries: AnonymizationAuditEntry[] = [];
  let result = rawText;
  let counter = 1;

  // 1. Redact Student IDs / Numbers (e.g., up202305812, 202305812, nmec 98412)
  const studentIdRegex = /\b(?:up|nmec|aluno|n[ºo]?\s*)?([0-9]{7,9})\b/gi;
  result = result.replace(studentIdRegex, (match, idGroup) => {
    auditEntries.push({
      id: `audit-${Date.now()}-${counter++}`,
      field: 'Student ID',
      redactedToken: '[REDACTED_STUDENT_ID]',
      snippet: `Match found: "${match.trim()}" in ${docName}`,
      timestamp: new Date().toLocaleTimeString(),
    });
    return '[REDACTED_STUDENT_ID]';
  });

  // 2. Redact Institutional & Personal Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@(campus\.[A-Za-z.]+|[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/gi;
  result = result.replace(emailRegex, (match) => {
    auditEntries.push({
      id: `audit-${Date.now()}-${counter++}`,
      field: 'Institutional Email',
      redactedToken: '[REDACTED_EMAIL]',
      snippet: `Email detected: "${match.trim()}"`,
      timestamp: new Date().toLocaleTimeString(),
    });
    return '[REDACTED_EMAIL]';
  });

  // 3. Redact Phone numbers
  const phoneRegex = /\b(?:\+351[\s-]?)?(?:9[1236][0-9]{7}|2[1-9][0-9]{7})\b/g;
  result = result.replace(phoneRegex, (match) => {
    auditEntries.push({
      id: `audit-${Date.now()}-${counter++}`,
      field: 'Phone',
      redactedToken: '[REDACTED_PHONE]',
      snippet: `Phone detected: "${match.trim()}"`,
      timestamp: new Date().toLocaleTimeString(),
    });
    return '[REDACTED_PHONE]';
  });

  // 4. Redact Student Names (common prefixes: Estudante: ..., Autor: ..., Aluno: ...)
  const studentNameRegex = /(?:Estudante|Aluno|Autores?|Submetido por)[:\s]+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+){1,3})/g;
  result = result.replace(studentNameRegex, (fullMatch, nameGroup) => {
    auditEntries.push({
      id: `audit-${Date.now()}-${counter++}`,
      field: 'Full Name',
      redactedToken: '[REDACTED_NAME]',
      snippet: `Student author name: "${nameGroup.trim()}"`,
      timestamp: new Date().toLocaleTimeString(),
    });
    return fullMatch.replace(nameGroup, '[REDACTED_NAME]');
  });

  return {
    anonymizedText: result,
    auditEntries,
    redactionsCount: auditEntries.length,
  };
}
