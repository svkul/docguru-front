import { api } from './client';

/**
 * Journal interface matching backend response
 */
export interface Journal {
  id: string;
  name: string;
  description?: string;
  reason?: string;
  templateId: string;
}

/**
 * AI Provider type
 */
export type AIProvider = 'openai' | 'claude' | 'gemini';

/**
 * Analyze document request payload
 */
export interface AnalyzeDocumentRequest {
  documentContent: string;
  aiProvider?: AIProvider;
}

/**
 * Analyze document response
 */
export interface AnalyzeDocumentResponse {
  journals: Journal[];
}

/**
 * Analyze document API call
 * @param documentContent - The text content of the document to analyze
 * @param aiProvider - Optional AI provider to use (openai, claude, gemini)
 * @returns List of suitable journals for publication
 */
export const analyzeDocument = async (
  documentContent: string,
  aiProvider?: AIProvider,
): Promise<AnalyzeDocumentResponse> => {
  const response = await api.post<AnalyzeDocumentResponse>(
    '/documents/analyze',
    {
      documentContent,
      ...(aiProvider && { aiProvider }),
    },
  );
  return response.data;
};

/**
 * Generate document by template request payload
 */
export interface GenerateByTemplateRequest {
  documentContent: string;
  templateId: string;
  aiProvider?: AIProvider;
}

/**
 * Generate document by template response
 */
export interface GenerateByTemplateResponse {
  formattedDocument: string;
}

/**
 * Generate document by template API call
 * @param documentContent - The original document content
 * @param templateId - The ID of the template to apply
 * @param aiProvider - Optional AI provider to use (openai, claude, gemini)
 * @returns Formatted document content
 */
export const generateDocumentByTemplate = async (
  documentContent: string,
  templateId: string,
  aiProvider?: AIProvider,
): Promise<GenerateByTemplateResponse> => {
  const response = await api.post<GenerateByTemplateResponse>(
    '/documents/generate-by-template',
    {
      documentContent,
      templateId,
      ...(aiProvider && { aiProvider }),
    },
  );
  return response.data;
};

/**
 * Generate a DOCX file by template (binary response)
 * @param documentContent - The original document content
 * @param templateId - The ID of the template to apply
 * @param aiProvider - Optional AI provider to use (openai, claude, gemini)
 */
export const generateDocumentByTemplateDocx = async (
  documentContent: string,
  templateId: string,
  aiProvider?: AIProvider,
): Promise<Blob> => {
  const response = await api.post(
    '/documents/generate-by-template-docx',
    {
      documentContent,
      templateId,
      ...(aiProvider && { aiProvider }),
    },
    { responseType: 'blob' },
  );
  return response.data as Blob;
};
