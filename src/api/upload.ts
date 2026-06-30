import { apiClient } from "./client"
import type { PresignedUrlResponse } from "@/types/s3"

export const getPresignedUrl = async (
  folder: string,
  filename: string,
  contentType: string
): Promise<PresignedUrlResponse> => {
  const res = await apiClient.get<PresignedUrlResponse>("/upload/presigned-url", {
    params: { folder, filename, contentType },
  })
  return res.data
}

export const uploadToS3 = async (uploadUrl: string, file: File) => {
  // We use native fetch here instead of apiClient because we are sending 
  // directly to AWS S3, so we don't want to attach our JWT Authorization header.
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })
  
  if (!res.ok) {
    throw new Error("Failed to upload file to S3")
  }
}