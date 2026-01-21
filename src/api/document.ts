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
 * Analyze document request payload
 */
export interface AnalyzeDocumentRequest {
  documentContent: string;
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
 * @returns List of suitable journals for publication
 */
export const analyzeDocument = async (
  documentContent: string,
): Promise<AnalyzeDocumentResponse> => {
  const response = await api.post<AnalyzeDocumentResponse>(
    '/documents/analyze',
    {
      documentContent,
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
 * @returns Formatted document content
 */
export const generateDocumentByTemplate = async (
  documentContent: string,
  templateId: string,
): Promise<GenerateByTemplateResponse> => {
  const response = await api.post<GenerateByTemplateResponse>(
    '/documents/generate-by-template',
    {
      documentContent,
      templateId,
    },
  );
  return response.data;
};

/**
 * Generate a DOCX file by template (binary response)
 */
export const generateDocumentByTemplateDocx = async (
  documentContent: string,
  templateId: string,
): Promise<Blob> => {
  const response = await api.post(
    '/documents/generate-by-template-docx',
    { documentContent, templateId },
    { responseType: 'blob' },
  );
  return response.data as Blob;
};
