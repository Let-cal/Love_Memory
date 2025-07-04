// hooks/useImageUpload.ts
import { useCallback, useState } from "react";

export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
  cloudinaryPublicId: string;
  caption: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    originalFilename?: string;
  };
  createdAt: string;
}

export interface UploadOptions {
  caption?: string;
  groupId?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
  onSuccess?: (images: UploadedImage[]) => void;
  onError?: (error: string) => void;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FileUploadResponse {
  images: UploadedImage[];
  count: number;
}

type UrlUploadResponse = UploadedImage;

export const useImageUpload = () => {
  const [status, setStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  // Helper function to update status
  const updateStatus = useCallback((updates: Partial<UploadStatus>) => {
    setStatus((prev) => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle upload start
  const startUpload = useCallback(() => {
    updateStatus({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
    });
  }, [updateStatus]);

  // Helper function to handle upload success
  const handleUploadSuccess = useCallback(
    (images: UploadedImage[], options: UploadOptions) => {
      updateStatus({
        isUploading: false,
        progress: 100,
        error: null,
        success: true,
      });

      options.onSuccess?.(images);
    },
    [updateStatus]
  );

  // Helper function to handle upload error
  const handleUploadError = useCallback(
    (error: unknown, options: UploadOptions) => {
      let errorMessage =
        error instanceof Error ? error.message : "Upload không thành công";
      if (
        errorMessage.includes("Body exceeded") ||
        errorMessage.includes("Kích thước file")
      ) {
        errorMessage = "File too large. Maximum size is 10MB.";
      } else if (errorMessage.includes("File type not supported")) {
        errorMessage =
          "File format not supported. Please select JPEG, PNG, WEBP or GIF.";
      }

      updateStatus({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        success: false,
      });

      options.onError?.(errorMessage);
      return new Error(errorMessage);
    },
    [updateStatus]
  );

  // Helper function to create FormData
  const createFormData = useCallback(
    (files: FileList, options: UploadOptions): FormData => {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      if (options.caption) formData.append("caption", options.caption);
      if (options.groupId) formData.append("groupId", options.groupId);
      if (options.tags) formData.append("tags", options.tags.join(","));

      return formData;
    },
    []
  );

  // Helper function to make API request
  const makeApiRequest = useCallback(
    async (url: string, options: RequestInit): Promise<Response> => {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      return response;
    },
    []
  );

  // Helper function to process file upload response
  const processFileUploadResponse = useCallback(
    async (
      response: Response,
      options: UploadOptions
    ): Promise<UploadedImage[]> => {
      const result: ApiResponse<FileUploadResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }

      handleUploadSuccess(result.data.images, options);
      return result.data.images;
    },
    [handleUploadSuccess]
  );

  // Helper function to process URL upload response
  const processUrlUploadResponse = useCallback(
    async (
      response: Response,
      options: UploadOptions
    ): Promise<UploadedImage> => {
      const result: ApiResponse<UrlUploadResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload failed");
      }

      handleUploadSuccess([result.data], options);
      return result.data;
    },
    [handleUploadSuccess]
  );

  // Main upload files function
  const uploadFiles = useCallback(
    async (
      files: FileList,
      options: UploadOptions = {}
    ): Promise<UploadedImage[]> => {
      if (!files || files.length === 0) {
        updateStatus({ error: "No files selected" });
        return [];
      }

      startUpload();

      try {
        const formData = createFormData(files, options);

        const response = await makeApiRequest("/api/images/upload-image", {
          method: "POST",
          body: formData,
        });

        return await processFileUploadResponse(response, options);
      } catch (error) {
        const uploadError = handleUploadError(error, options);
        throw uploadError;
      }
    },
    [
      updateStatus,
      startUpload,
      createFormData,
      makeApiRequest,
      processFileUploadResponse,
      handleUploadError,
    ]
  );

  // Main upload from URL function
  const uploadFromUrl = useCallback(
    async (
      imageUrl: string,
      options: UploadOptions = {}
    ): Promise<UploadedImage> => {
      if (!imageUrl) {
        updateStatus({ error: "No URL provided" });
        throw new Error("No URL provided");
      }

      startUpload();

      try {
        const response = await makeApiRequest("/api/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl,
            caption: options.caption,
            groupId: options.groupId,
            tags: options.tags,
          }),
        });

        return await processUrlUploadResponse(response, options);
      } catch (error) {
        const uploadError = handleUploadError(error, options);
        throw uploadError;
      }
    },
    [
      updateStatus,
      startUpload,
      makeApiRequest,
      processUrlUploadResponse,
      handleUploadError,
    ]
  );

  // Reset status function
  const resetStatus = useCallback(() => {
    updateStatus({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
    });
  }, [updateStatus]);

  return {
    status,
    uploadFiles,
    uploadFromUrl,
    resetStatus,
  };
};
