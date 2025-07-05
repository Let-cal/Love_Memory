"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleFavorite } from "@/hooks/image-gallery/useToggleFavorite";
import { cn } from "@/lib/utils";
import { ImageDataProps, ImageGroupProps } from "@/types/types";
import {
  Edit,
  FolderOpen,
  Heart,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EditImageDialog } from "./EditImageDialog";

interface ImageItemProps {
  image: ImageDataProps;
  groups: ImageGroupProps[];
  onToggleFavorite: (id: string, newStatus: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeGroup: (imageId: string, groupId: string) => void;
  onImageUpdated: (updatedImage: ImageDataProps) => void;
  viewMode: "carousel" | "grid" | "timeline";
}

export function ImageItem({
  image,
  groups,
  onToggleFavorite,
  onEdit,
  onDelete,
  onChangeGroup,
  onImageUpdated,
  viewMode,
}: ImageItemProps) {
  // Convert ObjectId to string for comparison and usage
  const imageId = image._id ? image._id.toString() : image.id.toString();
  const currentGroupId = image.group?.toString();

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Optimistic UI state
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null
  );

  // Use the custom hook with success/error callbacks
  const { toggleFavorite, isToggling } = useToggleFavorite(
    // onSuccess callback
    (id, newStatus) => {
      setOptimisticFavorite(null); // Clear optimistic state
      onToggleFavorite(id, newStatus); // Call parent callback to update global state
      toast.success(
        newStatus ? "Added to favorites" : "Removed from favorites"
      );
    },
    // onError callback
    (id, error) => {
      setOptimisticFavorite(null); // Revert optimistic state on error
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite status");
    }
  );

  // Determine the current favorite status (optimistic or actual)
  const currentFavoriteStatus =
    optimisticFavorite !== null ? optimisticFavorite : image.isFavorite;
  const isCurrentlyToggling = isToggling(imageId);

  // Handle favorite toggle with optimistic UI
  const handleToggleFavorite = useCallback(async () => {
    if (isCurrentlyToggling) return; // Prevent multiple simultaneous requests

    // Set optimistic state immediately
    setOptimisticFavorite(!currentFavoriteStatus);

    try {
      await toggleFavorite(imageId);
    } catch (error) {
      // Error handling is done in the hook's onError callback
      console.error("Toggle favorite failed:", error);
    }
  }, [imageId, currentFavoriteStatus, isCurrentlyToggling, toggleFavorite]);

  // Handle edit dialog open
  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
    onEdit(imageId); // Call parent callback if needed
  }, [imageId, onEdit]);

  // Handle edit dialog close
  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  // Handle image update from dialog
  const handleImageUpdated = useCallback(
    (updatedImage: ImageDataProps) => {
      onImageUpdated(updatedImage);
      setIsEditDialogOpen(false);
    },
    [onImageUpdated]
  );

  return (
    <>
      <div className="relative group h-full">
        <Image
          src={image.url}
          alt={image.caption || "Image"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover rounded-lg"
          quality={80}
          priority={false}
        />

        {/* Favorite Badge */}
        {currentFavoriteStatus && (
          <div className="absolute top-2 right-2 z-10">
            <Heart className="h-4 w-4 text-pink-400 fill-current drop-shadow-md" />
          </div>
        )}

        {/* Desktop Actions (hover-based for lg+ screens) */}
        <div
          className={cn(
            "hidden lg:flex absolute inset-0 items-center justify-center gap-2",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg",
            viewMode !== "carousel" && "bg-black/40 backdrop-blur-sm"
          )}
        >
          <Button
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isCurrentlyToggling}
            className={cn(
              "h-9 w-9 p-0 rounded-full transition-all duration-200",
              currentFavoriteStatus
                ? "bg-pink-500/90 hover:bg-pink-600/90 text-white"
                : "bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm",
              isCurrentlyToggling && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCurrentlyToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={cn(
                  "h-4 w-4",
                  currentFavoriteStatus && "fill-current"
                )}
              />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleEditClick}
            className="h-9 w-9 p-0 rounded-full bg-blue-500/90 hover:bg-blue-600/90 text-white transition-all duration-200"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onDelete(imageId)}
            className="h-9 w-9 p-0 rounded-full bg-red-500/90 hover:bg-red-600/90 text-white transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile/Tablet Actions (always visible on smaller screens) */}
        <div className="lg:hidden absolute top-2 left-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm rounded-full border border-white/20 touch-manipulation"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Image actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white min-w-[160px]"
              align="start"
            >
              <DropdownMenuItem
                onClick={handleToggleFavorite}
                disabled={isCurrentlyToggling}
                className={cn(
                  "hover:bg-slate-800/80 focus:bg-slate-800/80 cursor-pointer touch-manipulation py-3",
                  isCurrentlyToggling && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCurrentlyToggling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentFavoriteStatus && "text-pink-400 fill-current"
                    )}
                  />
                )}
                {currentFavoriteStatus
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleEditClick}
                className="hover:bg-slate-800/80 focus:bg-slate-800/80 cursor-pointer touch-manipulation py-3"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit photo
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700/50" />

              {/* Move to Group submenu */}
              <div className="px-2 py-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
                  Move to Album
                </p>

                {/* Ungrouped option */}
                <DropdownMenuItem
                  onClick={() => onChangeGroup(imageId, "ungrouped")}
                  className={cn(
                    "hover:bg-slate-800/80 focus:bg-slate-800/80 cursor-pointer touch-manipulation py-2 pl-4",
                    !currentGroupId && "bg-pink-500/20 text-pink-200"
                  )}
                >
                  <FolderOpen className="mr-2 h-3 w-3" />
                  <span className="text-sm">Ungrouped</span>
                </DropdownMenuItem>

                {/* Available groups */}
                {groups.map((group) => {
                  const groupId = group._id?.toString() || group.id;
                  return (
                    <DropdownMenuItem
                      key={groupId}
                      onClick={() => onChangeGroup(imageId, groupId)}
                      className={cn(
                        "hover:bg-slate-800/80 focus:bg-slate-800/80 cursor-pointer touch-manipulation py-2 pl-4",
                        currentGroupId === groupId &&
                          "bg-pink-500/20 text-pink-200"
                      )}
                    >
                      <FolderOpen className="mr-2 h-3 w-3" />
                      <span className="text-sm">{group.name}</span>
                      {group.imageCount && (
                        <span className="ml-auto text-xs text-slate-500">
                          ({group.imageCount})
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              <DropdownMenuSeparator className="bg-slate-700/50" />

              <DropdownMenuItem
                onClick={() => onDelete(imageId)}
                className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer touch-manipulation py-3 text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete photo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-lg">
          <p
            className={cn(
              "text-sm font-medium truncate",
              viewMode === "carousel" ? "text-center" : "text-left"
            )}
          >
            {image.caption || "Untitled"}
          </p>
          {viewMode === "timeline" && (
            <p className="text-xs text-slate-300 mt-1">
              {new Date(image.takenAt || image.createdAt).toLocaleDateString()}
            </p>
          )}
          {/* Show formatted file size if available */}
          {image.formattedSize && viewMode !== "carousel" && (
            <p className="text-xs text-slate-400 mt-1">{image.formattedSize}</p>
          )}
          {/* Show tags if available */}
          {image.tags && image.tags.length > 0 && viewMode !== "carousel" && (
            <div className="flex flex-wrap gap-1 mt-1">
              {image.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-white/20 text-white px-1 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {image.tags.length > 3 && (
                <span className="text-xs text-slate-400">
                  +{image.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditImageDialog
        image={image}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onImageUpdated={handleImageUpdated}
      />
    </>
  );
}
