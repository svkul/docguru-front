import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { DocumentPreview } from "@/components/document/DocumentPreview"

interface DocumentPreviewDialogProps {
  file: File
  fileName?: string
  trigger?: React.ReactNode
}

/**
 * Reusable component for document preview in a dialog
 */
export function DocumentPreviewDialog({ 
  file, 
  fileName,
  trigger 
}: DocumentPreviewDialogProps) {
  return (
    <Dialog>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button type="button">
            <Eye className="mr-2 size-4" />
            Preview
          </Button>
        </DialogTrigger>
      )}
      <DialogContent 
        className="max-w-6xl! w-[95vw] sm:max-w-6xl! h-[90vh] p-0 flex flex-col overflow-hidden gap-0" 
        showCloseButton={false}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b shrink-0">
          <div>
            <DialogTitle>
              Document Preview: {fileName || 'Document'}
            </DialogTitle>

            <DialogDescription className="mt-1">
              Preview of the document. Scroll to view the content.
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button type="button">
              X
            </Button>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-hidden">
          <DocumentPreview file={file} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
