import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRef, useState } from "react"
import { Upload, FileText, X, Eye, Loader2 } from "lucide-react"
import { Field, FieldDescription, FieldError, FieldGroup, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentPreviewDialog } from "@/components/document/DocumentPreviewDialog"
import { cn } from "@/lib/utils"

const uploadSchema = z.object({
  file: z.instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine((files) => {
      const file = files[0]
      return file?.name.endsWith('.docx') || 
             file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }, "Only .docx files are allowed")
    .refine((files) => files[0]?.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
})

type UploadFormValues = z.infer<typeof uploadSchema>

interface UploadStepProps {
  onAnalyze: (file: File) => Promise<void>
  isAnalyzing: boolean
  error?: string | null
}

/**
 * Step 1: Document upload and analysis
 */
export function UploadStep({ onAnalyze, isAnalyzing, error }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      file: undefined,
    },
  })

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(files[0])
      form.setValue("file", dataTransfer.files, { shouldValidate: true })
      setSelectedFileName(files[0].name)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    form.resetField("file")
    setSelectedFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (values: UploadFormValues) => {
    const file = values.file[0]
    if (!file) return
    await onAnalyze(file)
  }

  const selectedFile = selectedFileName ? form.getValues("file")?.[0] : undefined

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet className="mb-4">
        <FieldGroup>
          <Field>
            <Controller
              name="file"
              control={form.control}
              render={({ field: { onChange, onBlur, name } }) => (
                <>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    name={name}
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onBlur={onBlur}
                    onChange={(e) => {
                      handleFileChange(e)
                      onChange(e.target.files)
                    }}
                  />

                  <div
                    onClick={selectedFile ? undefined : handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
                      selectedFile ? "cursor-default" : "cursor-pointer",
                      !selectedFile && "hover:bg-accent/50 hover:border-primary/50",
                      isDragging && "bg-accent border-primary",
                      form.formState.errors.file && "border-destructive"
                    )}
                  >
                    {selectedFile ? (
                      <div 
                        className="flex items-center gap-3 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="size-8 text-primary" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFileName}</p>

                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <DocumentPreviewDialog
                            file={selectedFile}
                            fileName={selectedFileName || undefined}
                            trigger={
                              <Button
                                type="button"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <Eye className="size-4" />
                              </Button>
                            }
                          />

                          <Button
                            type="button"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="size-10 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">
                            Drag and drop your file here, or click to browse
                          </p>

                          <p className="text-xs text-muted-foreground mt-1">
                            Only .docx files are accepted (max 10MB)
                          </p>
                        </div>

                        <Button type="button" onClick={(e) => {
                          e.stopPropagation()
                          handleClick()
                        }}>
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            />

            <FieldDescription>
              Upload a .docx document (max 10MB)
            </FieldDescription>

            <FieldError errors={form.formState.errors.file ? [form.formState.errors.file] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button 
        type="submit" 
        disabled={!selectedFile || isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Document'
        )}
      </Button>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </form>
  )
}
