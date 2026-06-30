import { useState, useRef } from "react"
import { X, UploadCloud } from "lucide-react"
import { getPresignedUrl, uploadToS3 } from "@/api/upload"
import { toast } from "sonner"

interface Props {
  folder: string
  value: string | null
  onChange: (url: string) => void
  onRemove: () => void
}

export default function ImageUpload({ folder, value, onChange, onRemove }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      
      // 1. Get presigned URL from our backend
      const { uploadUrl, publicUrl } = await getPresignedUrl(folder, file.name, file.type)
      
      // 2. Upload file directly to AWS S3
      await uploadToS3(uploadUrl, file)
      
      // 3. Pass the public URL back up to the form
      onChange(publicUrl)
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
      console.error(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input
      }
    }
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded"
            className="h-32 w-32 rounded-md object-cover border"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-dashed p-6 transition-colors hover:bg-muted/50">
          <div className="text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
              <label
                htmlFor={`file-upload-${folder}`}
                className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
              >
                <span>Upload a file</span>
                <input
                  id={`file-upload-${folder}`}
                  ref={fileInputRef}
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}
      
      {isUploading && <p className="text-sm font-medium animate-pulse">Uploading to secure server...</p>}
    </div>
  )
}