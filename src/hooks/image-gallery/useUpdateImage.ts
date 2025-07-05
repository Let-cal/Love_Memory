// hooks/image-gallery/useUpdateImage.ts
import { ImageDataProps } from "@/types/types";
import { useState } from "react";

interface UpdateImageData {
  caption?: string;
  groupId?: string;
  tags?: string[];
}

export function useUpdateImage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateImage = async (
    imageId: string,
    data: UpdateImageData
  ): Promise<ImageDataProps | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update image");
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update image";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateImage,
    isUpdating,
    error,
    clearError: () => setError(null),
  };
}
