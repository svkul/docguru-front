import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Journal } from "@/api/document"

interface JournalsStepProps {
  journals: Journal[]
  onGenerate: (journal: Journal) => void
  isGenerating: boolean
  selectedJournalId?: string | null
  onReset: () => void
  error?: string | null
}

/**
 * Step 2: Display suitable journals and allow document generation
 */
export function JournalsStep({
  journals,
  onGenerate,
  isGenerating,
  selectedJournalId,
  onReset,
  error,
}: JournalsStepProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Suitable Journals</h2>
        
        <p className="text-muted-foreground">
          Based on your document analysis, here are the journals where you can publish:
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {journals.map((journal) => (
          <div key={journal.id} className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{journal.name}</h3>
                {journal.reason && (
                  <p className="text-sm font-medium text-primary mb-1">
                    {journal.reason}
                  </p>
                )}

                {journal.description && (
                  <p className="text-sm text-muted-foreground">
                    {journal.description}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={() => onGenerate(journal)}
                disabled={isGenerating}
                className="ml-4"
              >
                {isGenerating && selectedJournalId === journal.id ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Згенерувати документ'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button 
        type="button"
        onClick={onReset}
      >
        Завантажити інший документ
      </Button>
    </div>
  )
}
