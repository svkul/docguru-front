import { useEffect, useRef, useState } from "react"
import { renderAsync } from "docx-preview"
import { Loader2 } from "lucide-react"

interface DocumentPreviewProps {
  file: File
}

export function DocumentPreview({ file }: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !file) return

    let isMounted = true
    const container = containerRef.current

    const loadDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()

        if (!isMounted || !container) return

        // Clear previous content
        container.innerHTML = ""

        if (!isMounted) return

        // Render document
        await renderAsync(arrayBuffer, container, undefined, {
          className: "docx-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: false,
        })

        if (!isMounted) return

        // Wait a bit for DOM to update
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (isMounted) {
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error rendering document:", err)
        if (isMounted) {
          setError("Failed to load document preview")
          setIsLoading(false)
        }
      }
    }

    // Use setTimeout to ensure container is ready
    const timeoutId = setTimeout(() => {
      loadDocument()
    }, 0)

    // Cleanup function
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      // Don't try to clean up - let React handle it naturally
    }
  }, [file])


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden bg-gray-50 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="h-full overflow-auto p-8"
          suppressHydrationWarning
          style={{ visibility: isLoading ? "hidden" : "visible" }}
        />
      </div>
    </div>
  )
}
