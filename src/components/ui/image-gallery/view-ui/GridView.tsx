"use client";

import { ImageDataProps, ImageGroupProps } from "@/types/types";
import { ImageItem } from "../ImageItem";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

interface GridViewProps {
  images: ImageDataProps[];
  groups: ImageGroupProps[];
  onToggleFavorite: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onChangeGroup: (imageId: string | number, groupId: string) => void;
  onImageUpdated: (updatedImage: ImageDataProps) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function GridView({
  images,
  groups,
  onToggleFavorite,
  onEdit,
  onDelete,
  onChangeGroup,
  onImageUpdated,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: GridViewProps) {
  return (
    <div className="min-h-screen">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 border border-slate-700/30"
            >
              <ImageItem
                image={image}
                groups={groups}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeGroup={onChangeGroup}
                viewMode="grid"
                onImageUpdated={onImageUpdated}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pb-6 px-4 md:px-6 lg:px-8">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
            itemsPerPage={28}
            itemType="photo"
          />
        </div>
      )}
    </div>
  );
}