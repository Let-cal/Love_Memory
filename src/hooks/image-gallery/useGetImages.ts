// hooks/useGetImages.ts
import { IImage } from "@/../../models/Image";
import { IImageGroup } from "@/../../models/ImageGroup";
import {
  GetImagesQuery,
  GetImagesResponse,
} from "@/app/api/images/get-images/route";
import { useCallback, useEffect, useState } from "react";

export interface UseGetImagesParams
  extends Omit<GetImagesQuery, "page" | "limit"> {
  enabled?: boolean;
  limit?: number;
  webLinkId?: string | null;
}

export interface UseGetImagesReturn {
  images: IImage[];
  groups: IImageGroup[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalImages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
}

export function useGetImages(
  params: UseGetImagesParams = {}
): UseGetImagesReturn {
  const {
    enabled = true,
    limit = 12,
    sortBy,
    sortOrder,
    group,
    search,
    favoritesOnly,
    tags,
    startDate,
    endDate,
    webLinkId = null,
  } = params;

  const [images, setImages] = useState<IImage[]>([]);
  const [groups, setGroups] = useState<IImageGroup[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalImages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const buildQueryString = useCallback(
    (page: number = 1) => {
      const queryParams = new URLSearchParams();

      queryParams.set("page", page.toString());
      queryParams.set("limit", limit.toString());

      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortOrder) queryParams.set("sortOrder", sortOrder);
      if (group) queryParams.set("group", group);
      if (search) queryParams.set("search", search);
      if (favoritesOnly !== undefined)
        queryParams.set("favoritesOnly", favoritesOnly.toString());
      if (tags) queryParams.set("tags", tags);
      if (startDate) queryParams.set("startDate", startDate);
      if (endDate) queryParams.set("endDate", endDate);
      if (webLinkId === null) queryParams.set("webLinkId", "null");

      return queryParams.toString();
    },
    [
      limit,
      sortBy,
      sortOrder,
      group,
      search,
      favoritesOnly,
      tags,
      startDate,
      endDate,
      webLinkId,
    ]
  );

  const fetchImages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!enabled) return;

      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(page);
        const response = await fetch(`/api/images/get-images?${queryString}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GetImagesResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch images");
        }

        if (data.data) {
          if (append) {
            setImages((prev) => [...prev, ...data.data!.images]);
          } else {
            setImages(data.data.images);
          }
          setGroups(data.data.groups);
          setPagination(data.data.pagination);
          setCurrentPage(page);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching images:", err);
      } finally {
        setLoading(false);
      }
    },
    [enabled, buildQueryString]
  );

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchImages(1, false);
  }, [fetchImages]);

  const loadMore = useCallback(async () => {
    if (pagination.hasNext && !loading) {
      await fetchImages(currentPage + 1, true);
    }
  }, [fetchImages, currentPage, pagination.hasNext, loading]);

  const refresh = useCallback(async () => {
    await fetchImages(currentPage, false);
  }, [fetchImages, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (enabled) {
      setCurrentPage(1);
      fetchImages(1, false);
    }
  }, [
    sortBy,
    sortOrder,
    group,
    search,
    favoritesOnly,
    tags,
    startDate,
    endDate,
    webLinkId,
    enabled,
    fetchImages,
  ]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchImages(1, false);
    }
  }, [enabled, fetchImages]);

  return {
    images,
    groups,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: pagination.hasNext,
    refresh,
  };
}
