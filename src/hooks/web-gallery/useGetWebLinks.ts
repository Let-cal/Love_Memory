// hooks/useGetWebLinks.ts
import { WebLinkDataProps, WebLinksResponse } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface WebLinksFilters {
  category?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "visitCount" | "lastVisited" | "title";
  sortOrder?: "asc" | "desc";
  includeInactive?: boolean;
}

interface UseGetWebLinksReturn {
  data: WebLinksResponse | null;
  webLinks: WebLinkDataProps[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: WebLinksFilters) => void;
  visitWebLink: (webLinkId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  statistics: WebLinksResponse["statistics"] | null;
}

export function useGetWebLinks(
  initialFilters: WebLinksFilters = {}
): UseGetWebLinksReturn {
  const [data, setData] = useState<WebLinksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WebLinksFilters>(initialFilters);

  const buildQueryString = useCallback((filters: WebLinksFilters) => {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.tags && filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
    }
    if (filters.search) params.append("search", filters.search);
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.offset) params.append("offset", filters.offset.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.includeInactive) params.append("includeInactive", "true");

    return params.toString();
  }, []);

  const fetchWebLinks = useCallback(
    async (currentFilters: WebLinksFilters, append: boolean = false) => {
      try {
        if (!append) {
          setIsLoading(true);
        }
        setError(null);

        const queryString = buildQueryString(currentFilters);
        const response = await fetch(`/api/web-link?${queryString}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch web links");
        }

        setData((prevData: WebLinksResponse | null) => {
          const newData = result.data as WebLinksResponse;

          // Transform the data to ensure proper types
          const transformedWebLinks = newData.webLinks.map(
            (webLink: WebLinkDataProps) => ({
              ...webLink,
              // Ensure firstImage is properly typed
              firstImage: webLink.firstImage || null,
              // Ensure recentImages is properly typed
              recentImages: webLink.recentImages || [],
              // Ensure imageCount is a number
              imageCount: webLink.imageCount || 0,
            })
          );

          if (append && prevData) {
            return {
              ...newData,
              webLinks: [...prevData.webLinks, ...transformedWebLinks],
              pagination: newData.pagination,
              statistics: newData.statistics,
            };
          }

          return {
            ...newData,
            webLinks: transformedWebLinks,
          };
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast.error("Failed to load web links 😢", {
          description: errorMessage,
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryString]
  );

  const refetch = useCallback(async () => {
    await fetchWebLinks(filters, false);
  }, [fetchWebLinks, filters]);

  const updateFilters = useCallback((newFilters: WebLinksFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      offset: 0, // Reset offset when filters change
    }));
  }, []);

  const loadMore = useCallback(async () => {
    if (!data || !data.pagination.hasMore) return;

    const newFilters = {
      ...filters,
      offset: data.pagination.offset + data.pagination.limit,
    };

    await fetchWebLinks(newFilters, true);
  }, [data, filters, fetchWebLinks]);

  const visitWebLink = useCallback(async (webLinkId: string) => {
    try {
      const response = await fetch(
        `/api/web-link?id=${webLinkId}&action=visit`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update visit count");
      }

      // Update local state optimistically
      setData((prevData: WebLinksResponse | null) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          webLinks: prevData.webLinks.map((webLink: WebLinkDataProps) =>
            webLink._id === webLinkId
              ? {
                  ...webLink,
                  visitCount: result.data.visitCount as number,
                  lastVisited: result.data.lastVisited,
                }
              : webLink
          ),
        };
      });
    } catch (err) {
      console.error("Error updating visit count:", err);
      // Silently fail for visit count updates
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWebLinks(filters, false);
  }, [filters, fetchWebLinks]);

  return {
    data,
    webLinks: data?.webLinks || [],
    isLoading,
    error,
    refetch,
    updateFilters,
    visitWebLink,
    loadMore,
    hasMore: data?.pagination.hasMore || false,
    statistics: data?.statistics || null,
  };
}

// Simplified hook for basic usage
export function useWebLinks(category?: string) {
  const { webLinks, isLoading, error, refetch, visitWebLink, statistics } =
    useGetWebLinks({
      category,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  return {
    webLinks,
    isLoading,
    error,
    refetch,
    visitWebLink,
    statistics,
  };
}
