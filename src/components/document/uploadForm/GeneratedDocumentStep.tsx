import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldDescription } from "@/components/ui/field"
import { DocumentPreviewDialog } from "@/components/document/DocumentPreviewDialog"
import type { Journal, AIProvider } from "@/api/document"

interface GeneratedDocumentStepProps {
  generatedDocumentFile: File
  selectedJournal: Journal | null
  fileName?: string | null
  onBackToJournals: () => void
  onReset: () => void
  selectedAIProvider?: AIProvider
  onAIProviderChange?: (provider: AIProvider) => void
}

/**
 * Step 3: Display generated document with preview option
 */
export function GeneratedDocumentStep({
  generatedDocumentFile,
  selectedJournal,
  fileName,
  onBackToJournals,
  onReset,
  selectedAIProvider,
  onAIProviderChange,
}: GeneratedDocumentStepProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(generatedDocumentFile)
    const a = document.createElement('a')
    a.href = url
    a.download = generatedDocumentFile.name || `${fileName || 'document'}_formatted.docx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Generated Document</h2>
        <p className="text-muted-foreground">
          {selectedJournal && `Document formatted for: ${selectedJournal.name}`}
        </p>
      </div>

      <div className="mb-4 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Formatted Document</h3>
            <p className="text-sm text-muted-foreground">
              Preview the generated document below
            </p>
          </div>
          <DocumentPreviewDialog
            file={generatedDocumentFile}
            fileName={fileName || undefined}
          />
        </div>
      </div>

      <div className="mb-4">
        <Field>
          <Label htmlFor="aiProvider">AI Provider</Label>
          <Select
            value={selectedAIProvider || 'gemini'}
            onValueChange={(value) => onAIProviderChange?.(value as AIProvider)}
          >
            <SelectTrigger id="aiProvider" className="w-full">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            AI model used for document generation
          </FieldDescription>
        </Field>
      </div>

      <div className="flex gap-3">
        <Button 
          type="button"
          onClick={onBackToJournals}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to template selection
        </Button>

        <Button
          type="button"
          onClick={handleDownload}
        >
          Download .docx
        </Button>

        <Button 
          type="button"
          onClick={onReset}
        >
          Upload another document
        </Button>
      </div>
    </div>
  )
}
