import mammoth from 'mammoth';

/**
 * Extracts text content from a .docx file
 * @param file - The .docx file to read
 * @returns Promise that resolves to the text content of the document
 */
export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from docx:', error);
    throw new Error('Failed to read document content');
  }
};
