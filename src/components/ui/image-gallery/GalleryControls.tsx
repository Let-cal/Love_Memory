"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageUploadDialog from "@/components/ui/image-gallery/ImageUpload"; // Updated import
import { cn } from "@/lib/utils";
import { ImageDataProps, ImageGroupProps } from "@/types/types";
import {
  Calendar,
  Camera,
  ChevronDown,
  Eye,
  Filter,
  FolderPlus,
  Grid3X3,
  Heart,
  Image as ImageIcon,
  Link,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

type ViewMode = "carousel" | "grid" | "timeline";
type SortBy = "date" | "group" | "favorites" | "name";

interface GalleryControlsProps {
  images: ImageDataProps[];
  groups: ImageGroupProps[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  handleCreateGroup: () => void;
  onUploadImages?: (files: FileList) => void;
  onAddFromUrl?: (url: string) => void;
  onImagesUploaded?: () => void;
}

export default function GalleryControls({
  images,
  groups,
  viewMode,
  setViewMode,
  selectedGroup,
  setSelectedGroup,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showFavoritesOnly,
  setShowFavoritesOnly,
  handleCreateGroup,
  onUploadImages,
  onAddFromUrl,
  onImagesUploaded,
}: GalleryControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"device" | "url">("device");

  const getGroupName = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.name || "Unknown Group";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadMode("device");
      setIsUploadDialogOpen(true);
      if (onUploadImages) onUploadImages(files);
    }
  };

  const handleOpenUploadDialog = (mode: "device" | "url") => {
    setUploadMode(mode);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
    if (onImagesUploaded) onImagesUploaded();
  };

  return (
    <>
      <div className="relative overflow-hidden backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                      Photo Gallery
                    </h1>
                    <Sparkles className="h-5 w-5 text-pink-400 animate-pulse" />
                  </div>
                  <p className="text-pink-400 font-medium">
                    <span className="text-pink-400 font-semibold">
                      {images.length}
                    </span>{" "}
                    photos
                    {selectedGroup !== "all" && (
                      <>
                        {" "}
                        in{" "}
                        <span className="text-cyan-400 font-semibold">
                          {getGroupName(selectedGroup)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
                <Button
                  onClick={() => handleOpenUploadDialog("device")}
                  className="relative group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-200 px-6 py-2.5 h-auto font-semibold"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-md blur opacity-0 group-hover:opacity-50 transition-opacity" />
                  <Upload className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Upload Photos</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200 p-2.5 h-auto"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 w-48">
                    <DropdownMenuItem
                      onClick={() => handleOpenUploadDialog("device")}
                      className="text-white hover:bg-slate-700/80 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2 text-pink-400" />
                      Upload from Device
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        handleOpenUploadDialog("url");
                        if (onAddFromUrl) onAddFromUrl(""); // Call onAddFromUrl if needed
                      }}
                      className="text-white hover:bg-slate-700/80 transition-colors"
                    >
                      <Link className="h-4 w-4 mr-2 text-cyan-400" />
                      Add from URL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        /* Camera capture logic */
                      }}
                      className="text-white hover:bg-slate-700/80 transition-colors"
                    >
                      <Camera className="h-4 w-4 mr-2 text-green-400" />
                      Take Photo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg blur-sm" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-700/30 backdrop-blur-sm rounded-lg p-1 border border-slate-600/30">
                  {[
                    {
                      mode: "carousel" as ViewMode,
                      icon: Eye,
                      label: "Carousel",
                    },
                    { mode: "grid" as ViewMode, icon: Grid3X3, label: "Grid" },
                    {
                      mode: "timeline" as ViewMode,
                      icon: Calendar,
                      label: "Timeline",
                    },
                  ].map(({ mode, icon: Icon, label }) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-3 py-2 h-auto transition-all duration-200 relative group",
                        viewMode === mode
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                          : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                      )}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                      {viewMode === mode && (
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded blur animate-pulse" />
                      )}
                    </Button>
                  ))}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 w-48">
                    <DropdownMenuItem
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="text-white hover:bg-slate-700/80 transition-colors"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 mr-2 transition-colors",
                          showFavoritesOnly
                            ? "fill-pink-400 text-pink-400"
                            : "text-slate-400"
                        )}
                      />
                      Favorites Only
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-600/50" />
                    <div className="px-2 py-1 text-xs text-slate-400 font-medium">
                      Sort By
                    </div>
                    {[
                      { value: "date", label: "Date", color: "text-blue-400" },
                      { value: "name", label: "Name", color: "text-green-400" },
                      {
                        value: "favorites",
                        label: "Favorites",
                        color: "text-pink-400",
                      },
                      {
                        value: "group",
                        label: "Group",
                        color: "text-purple-400",
                      },
                    ].map((sort) => (
                      <DropdownMenuItem
                        key={sort.value}
                        onClick={() => setSortBy(sort.value as SortBy)}
                        className={cn(
                          "text-white hover:bg-slate-700/80 transition-colors",
                          sortBy === sort.value && "bg-slate-700/50"
                        )}
                      >
                        <span className={cn("mr-2 text-xs", sort.color)}>
                          ●
                        </span>
                        {sort.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {selectedGroup === "all"
                          ? "All Photos"
                          : getGroupName(selectedGroup)}
                      </span>
                      <span className="sm:hidden">Albums</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 w-56">
                    <DropdownMenuItem
                      onClick={() => setSelectedGroup("all")}
                      className={cn(
                        "text-white hover:bg-slate-700/80 transition-colors",
                        selectedGroup === "all" && "bg-slate-700/50"
                      )}
                    >
                      <ImageIcon className="h-4 w-4 mr-2 text-cyan-400" />
                      All Photos ({images.length})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-600/50" />
                    {groups.map((group) => {
                      const count = images.filter(
                        (img) => img.group === group.id
                      ).length;
                      return (
                        <DropdownMenuItem
                          key={group.id}
                          onClick={() => setSelectedGroup(group.id)}
                          className={cn(
                            "text-white hover:bg-slate-700/80 transition-colors",
                            selectedGroup === group.id && "bg-slate-700/50"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{group.name}</span>
                            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className="bg-slate-600/50" />
                    <DropdownMenuItem
                      onClick={handleCreateGroup}
                      className="text-pink-400 hover:bg-slate-700/80 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Album
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
        mode={uploadMode}
        selectedGroup={selectedGroup !== "all" ? selectedGroup : undefined}
        availableGroups={groups}
      />
    </>
  );
}
