"use client";

import { ImageDataProps, ImageGroupProps } from "@/types/types";
import { Calendar } from "lucide-react";
import { ImageItem } from "../ImageItem";

interface TimelineViewProps {
  groupedImages: { [key: string]: ImageDataProps[] };
  groups: ImageGroupProps[];
  onToggleFavorite: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onChangeGroup: (imageId: string | number, groupId: string) => void;
  onImageUpdated: (updatedImage: ImageDataProps) => void;
}

export default function TimelineView({
  groupedImages,
  groups,
  onToggleFavorite,
  onEdit,
  onDelete,
  onChangeGroup,
  onImageUpdated,
}: TimelineViewProps) {
  const sortedDates = Object.keys(groupedImages).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center gap-3 md:gap-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700/30 z-10">
            <div className="p-2 bg-pink-500/20 rounded-lg flex-shrink-0">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-pink-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-semibold text-white truncate">
                {new Date(dateKey).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                {groupedImages[dateKey].length} photo
                {groupedImages[dateKey].length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Images Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
            {groupedImages[dateKey].map((image) => (
              <div
                key={image.id}
                className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50"
              >
                <ImageItem
                  image={image}
                  groups={groups}
                  onToggleFavorite={onToggleFavorite}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeGroup={onChangeGroup}
                  viewMode="timeline"
                  onImageUpdated={onImageUpdated}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
