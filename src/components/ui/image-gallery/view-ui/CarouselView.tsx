"use client";

import { cn } from "@/lib/utils";
import { ImageDataProps, ImageGroupProps } from "@/types/types";
import { useCallback, useRef, useState } from "react";
import { ImageItem } from "../ImageItem";

interface CarouselViewProps {
  images: ImageDataProps[];
  groups: ImageGroupProps[];
  onToggleFavorite: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onChangeGroup: (imageId: string | number, groupId: string) => void;
}

export default function CarouselView({
  images,
  groups,
  onToggleFavorite,
  onEdit,
  onDelete,
  onChangeGroup,
}: CarouselViewProps) {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
    setActiveCardIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setActiveCardIndex(null);
    }, 150);
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(false);
    setActiveCardIndex(null);
  }, []);

  const getCardStyle = (index: number) => {
    const patterns = ["", "mt-[2.5%]", "mt-[5%]", "mt-[2.5%]"];
    return patterns[index % 4];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      {/* Mobile/Tablet Grid Layout */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="aspect-[3/4] rounded-xl overflow-hidden shadow-xl border border-slate-700/50"
            >
              <ImageItem
                image={image}
                groups={groups}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeGroup={onChangeGroup}
                viewMode="carousel"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Carousel Layout */}
      <div
        className="hidden lg:flex gap-1 overflow-x-auto items-start justify-center min-h-[600px] snap-x snap-mandatory px-4"
        onMouseLeave={handleContainerMouseLeave}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              // Base styles
              "relative flex-1 min-w-[60px] h-[600px] cursor-pointer",
              // Transitions
              "transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
              // Responsive behavior
              isHovering
                ? activeCardIndex === index
                  ? "opacity-100 flex-[0_0_30%]" // Active card
                  : "opacity-20" // Non-active cards
                : "opacity-100", // Default state
              // Margin patterns
              getCardStyle(index),
              // Snap behavior
              "snap-center"
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="h-full w-full rounded-lg overflow-hidden shadow-xl border border-slate-700/50">
              <ImageItem
                image={image}
                groups={groups}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
                onChangeGroup={onChangeGroup}
                viewMode="carousel"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
