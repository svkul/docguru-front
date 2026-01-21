/**
 * Converts text content to a File object that can be used with DocumentPreview
 * Note: This creates a simple text-based representation. For full docx conversion,
 * you would need a library like docx or mammoth in reverse mode.
 * 
 * @param textContent - The text content to convert
 * @param fileName - The name for the file
 * @returns A File object (currently returns a text file, not actual docx)
 */
export const textToFile = (textContent: string, fileName: string = 'document.txt'): File => {
  const blob = new Blob([textContent], { type: 'text/plain' });
  return new File([blob], fileName, { type: 'text/plain' });
};

/**
 * Creates a simple docx-like structure from text
 * This is a simplified version - for production, use a proper docx library
 */
export const createDocxFromText = async (textContent: string, fileName: string = 'document.docx'): Promise<File> => {
  // For now, we'll create a text file that can be displayed
  // In production, you would use a library like 'docx' to create actual .docx files
  const blob = new Blob([textContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  return new File([blob], fileName, { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
};
