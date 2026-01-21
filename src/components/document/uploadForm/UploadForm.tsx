import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { analyzeDocument, generateDocumentByTemplateDocx } from "@/api/document"
import type { Journal } from "@/api/document"
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

  const analyzeMutation = useMutation({
    mutationFn: async (documentContent: string) => {
      return await analyzeDocument(documentContent)
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
    mutationFn: async ({ documentContent, templateId }: { documentContent: string; templateId: string }) => {
      return await generateDocumentByTemplateDocx(documentContent, templateId)
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

  const handleAnalyze = async (file: File) => {
    try {
      setSelectedFileName(file.name)
      // Extract text content from docx file
      const documentContent = await extractTextFromDocx(file)
      
      // Store original content for later use in generation
      setOriginalDocumentContent(documentContent)
      
      // Analyze document
      analyzeMutation.mutate(documentContent)
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
    })
  }

  const handleResetForm = () => {
    setAnalysisResult(null)
    setOriginalDocumentContent(null)
    setGeneratedDocumentFile(null)
    setSelectedJournal(null)
    setSelectedFileName(null)
    setCurrentStep('upload')
    analyzeMutation.reset()
    generateMutation.reset()
  }

  const handleBackToJournals = () => {
    setGeneratedDocumentFile(null)
    setSelectedJournal(null)
    setCurrentStep('journals')
    generateMutation.reset()
  }

  const analyzeError = analyzeMutation.isError 
    ? (analyzeMutation.error instanceof Error 
        ? analyzeMutation.error.message 
        : 'Failed to analyze document. Please try again.')
    : null

  const generateError = generateMutation.isError
    ? (generateMutation.error instanceof Error 
        ? generateMutation.error.message 
        : 'Failed to generate document. Please try again.')
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
      />
    )
  }

  // Step 1: Upload document
  return (
    <UploadStep
      onAnalyze={handleAnalyze}
      isAnalyzing={analyzeMutation.isPending}
      error={analyzeError}
    />
  )
}
