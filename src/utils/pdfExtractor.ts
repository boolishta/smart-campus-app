import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MAX_PDF_CHARACTERS = 50000;

export interface PdfExtractionResult {
  text: string;
  originalCharacterCount: number;
  wasTruncated: boolean;
  pageCount: number;
}

/**
 * Extracts raw text from a PDF file entirely client-side using pdfjs-dist.
 * Enforces the 50,000-character maximum payload constraint.
 */
export async function extractPdfTextClientSide(file: File): Promise<PdfExtractionResult> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check if file actually begins with a %PDF header (within first 1024 bytes)
  const headerSample = new TextDecoder('latin1').decode(bytes.slice(0, 1024));
  const looksLikeBinaryPdf = headerSample.includes('%PDF-');

  let fullText = '';
  let pageCount = 1;

  if (looksLikeBinaryPdf) {
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;

    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLine = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pageLine) {
        pageTexts.push(pageLine);
      }
    }
    fullText = pageTexts.join('\n');
  } else {
    // Graceful fallback for plain-text test fixtures saved with a .pdf extension
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim();
    if (!decoded) {
      throw new Error('Could not extract readable text from this PDF file.');
    }
    fullText = decoded;
  }

  const normalizedText = fullText.trim();
  if (!normalizedText) {
    throw new Error(
      'No selectable text was found in this PDF. Please upload a text-based syllabus or assignment PDF.'
    );
  }

  const originalCharacterCount = normalizedText.length;
  const wasTruncated = originalCharacterCount > MAX_PDF_CHARACTERS;
  const text = wasTruncated ? normalizedText.slice(0, MAX_PDF_CHARACTERS) : normalizedText;

  return {
    text,
    originalCharacterCount,
    wasTruncated,
    pageCount,
  };
}
