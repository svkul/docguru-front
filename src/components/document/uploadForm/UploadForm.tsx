import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { analyzeDocument, generateDocumentByTemplateDocx } from "@/api/document"
import type { Journal, AIProvider } from "@/api/document"
import { extractTextFromDocx } from "@/utils/docxReader"
import { UploadStep } from "./UploadStep"
import { JournalsStep } from "./JournalsStep"
import { GeneratedDocumentStep } from "./GeneratedDocumentStep"

type Step = 'upload' | 'journals' | 'generated'

/**
 * Main component for document upload, analysis, and generation workflow
 */
export function UploadForm() {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<Journal[] | null>(null)
  const [originalDocumentContent, setOriginalDocumentContent] = useState<string | null>(null)
  const [generatedDocumentFile, setGeneratedDocumentFile] = useState<File | null>(null)
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [selectedAIProvider, setSelectedAIProvider] = useState<AIProvider>('gemini')

  const analyzeMutation = useMutation({
    mutationFn: async ({ documentContent, aiProvider }: { documentContent: string; aiProvider?: AIProvider }) => {
      return await analyzeDocument(documentContent, aiProvider)
    },
    onSuccess: (data) => {
      setAnalysisResult(data.journals)
      setCurrentStep('journals')
    },
    onError: (error: unknown) => {
      console.error('Error analyzing document:', error)
    },
  })

  const generateMutation = useMutation({
    mutationFn: async ({ documentContent, templateId, aiProvider }: { documentContent: string; templateId: string; aiProvider?: AIProvider }) => {
      return await generateDocumentByTemplateDocx(documentContent, templateId, aiProvider)
    },
    onSuccess: async (docxBlob) => {
      const fileName = `${selectedFileName || 'document'}_formatted.docx`
      const file = new File([docxBlob], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      setGeneratedDocumentFile(file)
      setCurrentStep('generated')
    },
    onError: (error: unknown) => {
      console.error('Error generating document:', error)
    },
  })

  const handleAnalyze = async (file: File, aiProvider?: AIProvider) => {
    try {
      setSelectedFileName(file.name)
      // Extract text content from docx file
      const documentContent = await extractTextFromDocx(file)
      
      // Store original content for later use in generation
      setOriginalDocumentContent(documentContent)
      
      // Use provided aiProvider or fallback to selectedAIProvider
      const providerToUse = aiProvider || selectedAIProvider
      
      // Analyze document
      analyzeMutation.mutate({ documentContent, aiProvider: providerToUse })
    } catch (error) {
      console.error('Error processing document:', error)
    }
  }

  const handleGenerateDocument = async (journal: Journal) => {
    if (!originalDocumentContent) return
    setSelectedJournal(journal)
    generateMutation.mutate({
      documentContent: originalDocumentContent,
      templateId: journal.templateId,
      aiProvider: selectedAIProvider,
    })
  }

  const handleResetForm = () => {
    setAnalysisResult(null)
    setOriginalDocumentContent(null)
    setGeneratedDocumentFile(null)
    setSelectedJournal(null)
    setSelectedFileName(null)
    setCurrentStep('upload')
    // Keep AI provider selection on reset
    analyzeMutation.reset()
    generateMutation.reset()
  }

  const handleBackToJournals = () => {
    setGeneratedDocumentFile(null)
    setSelectedJournal(null)
    setCurrentStep('journals')
    generateMutation.reset()
  }

  // Extract error message from mutation error
  const extractErrorMessage = (error: unknown): string | null => {
    if (!error) return null;
    
    // Handle AxiosError (from api client)
    if (typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    
    // Handle Error instance
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  const analyzeError = analyzeMutation.isError 
    ? extractErrorMessage(analyzeMutation.error)
    : null

  const generateError = generateMutation.isError
    ? extractErrorMessage(generateMutation.error)
    : null

  // Step 3: Show generated document
  if (currentStep === 'generated' && generatedDocumentFile) {
    return (
      <GeneratedDocumentStep
        generatedDocumentFile={generatedDocumentFile}
        selectedJournal={selectedJournal}
        fileName={selectedFileName}
        onBackToJournals={handleBackToJournals}
        onReset={handleResetForm}
        selectedAIProvider={selectedAIProvider}
        onAIProviderChange={setSelectedAIProvider}
      />
    )
  }

  // Step 2: Show journals list
  if (currentStep === 'journals' && analysisResult && analysisResult.length > 0) {
    return (
      <JournalsStep
        journals={analysisResult}
        onGenerate={handleGenerateDocument}
        isGenerating={generateMutation.isPending}
        selectedJournalId={selectedJournal?.id || null}
        onReset={handleResetForm}
        error={generateError}
        selectedAIProvider={selectedAIProvider}
        onAIProviderChange={setSelectedAIProvider}
      />
    )
  }

  // Step 1: Upload document
  return (
    <UploadStep
      onAnalyze={handleAnalyze}
      isAnalyzing={analyzeMutation.isPending}
      error={analyzeError}
      selectedAIProvider={selectedAIProvider}
      onAIProviderChange={setSelectedAIProvider}
    />
  )
}
