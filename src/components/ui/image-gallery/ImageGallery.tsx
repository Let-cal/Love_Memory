"use client";

import { useGetImages } from "@/hooks/image-gallery/useGetImages";
import {
  ImageDataProps,
  ImageGroupProps,
  SortBy,
  ViewMode,
} from "@/types/types";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import GalleryControls from "./GalleryControls";
import CarouselView from "./view-ui/CarouselView";
import GridView from "./view-ui/GridView";
import TimelineView from "./view-ui/TimelineView";

export default function ImageGallery() {
  // UI state
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Fetch images using the hook
  const {
    images: fetchedImages,
    groups: fetchedGroups,
    loading,
    error,
    pagination,
    loadMore,
    hasMore,
    refetch,
  } = useGetImages({
    enabled: true,
    limit: 50,
    sortBy: sortBy,
    sortOrder: "desc",
    group: selectedGroup === "all" ? undefined : selectedGroup,
    search: searchQuery || undefined,
    favoritesOnly: showFavoritesOnly || undefined,
  });

  // Convert MongoDB data to component-expected format
  const images: ImageDataProps[] = useMemo(() => {
    return fetchedImages.map((image) => ({
      ...image,
      _id: image._id?.toString(),
      id: image._id?.toString() || image.id,
      takenAt: new Date(image.takenAt || image.createdAt),
      group:
        typeof image.group === "object" && image.group?._id
          ? image.group._id.toString()
          : image.group?.toString() || "ungrouped",
    }));
  }, [fetchedImages]);

  const groups: ImageGroupProps[] = useMemo(() => {
    return fetchedGroups.map((group) => ({
      ...group,
      _id: group._id?.toString(),
      id: group._id?.toString() || group.id,
      dateRange: group.dateRange || { start: new Date(), end: new Date() },
    }));
  }, [fetchedGroups]);

  // Filter and sort images (client-side filtering for additional criteria)
  const filteredAndSortedImages = useMemo(() => {
    let filtered = [...images];

    if (selectedGroup !== "all") {
      filtered = filtered.filter((img) => {
        if (selectedGroup === "ungrouped") {
          return !img.group || img.group === "ungrouped";
        }
        return img.group === selectedGroup;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.caption?.toLowerCase().includes(query) ||
          img.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((img) => img.isFavorite);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.takenAt.getTime() - a.takenAt.getTime();
        case "name":
          return (a.caption || "").localeCompare(b.caption || "");
        case "favorites":
          return b.isFavorite === a.isFavorite ? 0 : b.isFavorite ? 1 : -1;
        case "group":
          return (a.group || "").localeCompare(b.group || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, selectedGroup, searchQuery, showFavoritesOnly, sortBy]);

  // Group images by date for timeline view
  const groupedByDate = useMemo(() => {
    const grouped: { [key: string]: ImageDataProps[] } = {};
    filteredAndSortedImages.forEach((img) => {
      const dateKey = img.takenAt.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(img);
    });
    return grouped;
  }, [filteredAndSortedImages]);

  // Handlers
  const toggleFavorite = async (imageId: number | string) => {
    try {
      console.log("Toggle favorite:", imageId);
      await refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleEdit = (imageId: number | string) => {
    console.log("Edit image:", imageId);
  };

  const handleDelete = async (imageId: number | string) => {
    try {
      console.log("Delete image:", imageId);
      await refetch();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleCreateGroup = () => {
    console.log("Create new group");
  };

  const handleImageUpdated = async (updatedImage: ImageDataProps) => {
    try {
      console.log("Image updated:", updatedImage);
      // Refetch the images to get the updated data from the server
      await refetch();
    } catch (error) {
      console.error("Error refreshing images after update:", error);
    }
  };

  const onChangeGroup = async (imageId: number | string, groupId: string) => {
    try {
      console.log("Change group:", imageId, "to", groupId);
      await refetch();
    } catch (error) {
      console.error("Error changing group:", error);
    }
  };

  // Loading state
  if (loading && images.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="gallery-loading-light dark:gallery-loading-dark rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <Loader2 className="h-12 w-12 text-romantic-500 dark:text-romantic-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Loading your photos...
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
              Please wait while we fetch your images from the gallery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && images.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="gallery-loading-light dark:gallery-loading-dark rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="p-4 bg-romantic-500/20 dark:bg-romantic-500/30 rounded-full mb-4">
              <ImageIcon className="h-12 w-12 text-romantic-400 dark:text-romantic-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Failed to load photos
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-md mb-4">
              {error}
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-romantic-500 hover:bg-romantic-600 dark:bg-romantic-400 dark:hover:bg-romantic-500 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="content-card-light content-card-hover-light dark:content-card-dark dark:content-card-hover-dark rounded-2xl shadow-2xl">
        <GalleryControls
          images={filteredAndSortedImages}
          groups={groups}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          handleCreateGroup={handleCreateGroup}
        />
      </div>

      <div className="content-card-light content-card-hover-light dark:content-card-dark dark:content-card-hover-dark rounded-2xl overflow-hidden shadow-2xl">
        {viewMode === "carousel" && (
          <CarouselView
            images={filteredAndSortedImages}
            groups={groups}
            onToggleFavorite={toggleFavorite}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeGroup={onChangeGroup}
            onImageUpdated={handleImageUpdated}
          />
        )}
        {viewMode === "grid" && (
          <GridView
            images={filteredAndSortedImages}
            groups={groups}
            onToggleFavorite={toggleFavorite}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeGroup={onChangeGroup}
            onImageUpdated={handleImageUpdated}
          />
        )}
        {viewMode === "timeline" && (
          <TimelineView
            groupedImages={groupedByDate}
            groups={groups}
            onToggleFavorite={toggleFavorite}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeGroup={onChangeGroup}
            onImageUpdated={handleImageUpdated}
          />
        )}

        {/* Empty state */}
        {filteredAndSortedImages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="p-4 bg-romantic-500/20 dark:bg-romantic-500/30 rounded-full mb-4">
              <ImageIcon className="h-12 w-12 text-romantic-400 dark:text-romantic-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No photos found
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
              {searchQuery
                ? `No photos match "${searchQuery}"`
                : "Try adjusting your filters or upload some photos"}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && filteredAndSortedImages.length > 0 && (
          <div className="flex justify-center p-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-romantic-500 hover:bg-romantic-600 dark:bg-romantic-400 dark:hover:bg-romantic-500 disabled:bg-romantic-500/50 dark:disabled:bg-romantic-400/50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Loading..." : "Load More Photos"}
            </button>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {pagination && filteredAndSortedImages.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-slate-400">
          Showing {filteredAndSortedImages.length} of {pagination.totalImages}{" "}
          photos
        </div>
      )}
    </div>
  );
}
