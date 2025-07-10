// hooks/useCreateWebLink.ts
import { WebLinkDataProps } from "@/types/types";
import { useState } from "react";
import { toast } from "sonner";

export interface CreateWebLinkData {
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: "memories" | "gifts" | "letters" | "moments" | "other";
  backgroundColor?: string;
  textColor?: string;
  metadata?: {
    siteName?: string;
    siteDescription?: string;
    favicon?: string;
    previewImage?: string;
  };
}

interface UseCreateWebLinkReturn {
  createWebLink: (data: CreateWebLinkData) => Promise<WebLinkDataProps | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateWebLink(
  onSuccess?: (webLink: WebLinkDataProps) => void
): UseCreateWebLinkReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWebLink = async (
    data: CreateWebLinkData
  ): Promise<WebLinkDataProps | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/web-link/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create web link");
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to create web link");
      }

      // Show success toast
      toast.success("Web link created successfully! 💕", {
        description: `"${data.title}" has been added to your love gallery`,
        duration: 4000,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result.data);
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createWebLink,
    isLoading,
    error,
  };
}
