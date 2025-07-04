import { useCallback, useState } from "react";

interface ToggleFavoriteResponse {
  success: boolean;
  data?: {
    id: string;
    isFavorite: boolean;
    updatedAt: string;
  };
  error?: string;
}

interface UseToggleFavoriteReturn {
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (imageId: string) => Promise<boolean>;
  isToggling: (imageId: string) => boolean;
}

export function useToggleFavorite(
  onSuccess?: (imageId: string, newFavoriteStatus: boolean) => void,
  onError?: (imageId: string, error: string) => void
): UseToggleFavoriteReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = useCallback(
    async (imageId: string): Promise<boolean> => {
      // Set loading state for this specific image
      setLoadingStates((prev) => ({ ...prev, [imageId]: true }));
      setError(null);

      try {
        const response = await fetch(`/api/images/${imageId}/toggle-favorite`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const result: ToggleFavoriteResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to toggle favorite");
        }

        const newFavoriteStatus = result.data!.isFavorite;

        // Call success callback if provided
        onSuccess?.(imageId, newFavoriteStatus);

        return newFavoriteStatus;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        // Call error callback if provided
        onError?.(imageId, errorMessage);

        throw err;
      } finally {
        // Clear loading state for this image
        setLoadingStates((prev) => {
          const newState = { ...prev };
          delete newState[imageId];
          return newState;
        });
      }
    },
    [onSuccess, onError]
  );

  const isToggling = useCallback(
    (imageId: string): boolean => {
      return loadingStates[imageId] || false;
    },
    [loadingStates]
  );

  return {
    isLoading: Object.keys(loadingStates).length > 0,
    error,
    toggleFavorite,
    isToggling,
  };
}

// Alternative hook with SWR integration for automatic revalidation
export function useToggleFavoriteWithSWR(
  mutate: (key?: string) => void, // SWR mutate function
  cacheKey?: string // SWR cache key to revalidate
): UseToggleFavoriteReturn {
  const baseHook = useToggleFavorite(() => {
    // Revalidate SWR cache after successful toggle
    if (cacheKey) {
      mutate(cacheKey);
    } else {
      mutate(); // Revalidate all cache keys
    }
  });

  return baseHook;
}
