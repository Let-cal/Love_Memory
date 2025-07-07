// hooks/image-gallery/useDeleteImage.ts
import { useCallback, useState } from "react";

interface DeleteImageResponse {
  success: boolean;
  data?: {
    id: string;
    deletedFrom: {
      database: boolean;
      cloudinary: boolean;
    };
    message: string;
  };
  error?: string;
}

interface UseDeleteImageOptions {
  onSuccess?: (deletedImageId: string) => void;
  onError?: (error: string, imageId: string) => void;
}

export function useDeleteImage(options?: UseDeleteImageOptions) {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const deleteImage = useCallback(
    async (imageId: string): Promise<boolean> => {
      if (isDeleting[imageId]) {
        return false; // Already deleting this image
      }

      setIsDeleting((prev) => ({ ...prev, [imageId]: true }));
      setError(null);

      try {
        const response = await fetch(`/api/images/${imageId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: DeleteImageResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to delete image");
        }

        // Call success callback if provided
        if (options?.onSuccess) {
          options.onSuccess(imageId);
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete image";
        setError(errorMessage);

        console.error("Delete image error:", err);

        // Call error callback if provided
        if (options?.onError) {
          options.onError(errorMessage, imageId);
        }

        return false;
      } finally {
        setIsDeleting((prev) => ({ ...prev, [imageId]: false }));
      }
    },
    [isDeleting, options]
  );

  const isDeletingImage = useCallback(
    (imageId: string): boolean => {
      return isDeleting[imageId] || false;
    },
    [isDeleting]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteImage,
    isDeletingImage,
    error,
    clearError,
    isDeleting: Object.values(isDeleting).some(Boolean), // True if any image is being deleted
  };
}
