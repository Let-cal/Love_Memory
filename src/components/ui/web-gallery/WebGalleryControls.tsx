"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Grid3X3, 
  Tags, 
  Eye, 
  Filter, 
  ChevronDown,
  Heart,
  Gift,
  Mail,
  Sparkles,
  Globe,
  Plus
} from "lucide-react";
import CreateWebLinkDialog from "./CreateWebLinkDialog";
import { WebLink } from "@/types/types";



type ViewMode = "carousel" | "tags" | "cards";

interface WebGalleryControlsProps {
  webLinks: WebLink[];
  categories: string[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const categoryIcons = {
  memories: Heart,
  gifts: Gift,
  letters: Mail,
  moments: Sparkles,
  other: Globe
};

const categoryColors = {
  memories: "text-pink-400",
  gifts: "text-purple-400",
  letters: "text-orange-400",
  moments: "text-cyan-400",
  other: "text-slate-400"
};

export default function WebGalleryControls({
  webLinks,
  categories,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
}: WebGalleryControlsProps) {
  
  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryCount = (category: string) => {
    return webLinks.filter(link => link.category === category).length;
  };

  const handleWebLinkCreated = (newWebLink: WebLink) => {
    // Optionally handle the newly created web link (e.g., refresh list or update state)
    console.log("New WebLink created:", newWebLink);
  };

  return (
    <div className="relative overflow-hidden backdrop-blur-xl border border-white/10 rounded-2xl mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-rose-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 p-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                    Web Gallery
                  </h2>
                  <Sparkles className="h-5 w-5 text-pink-400 animate-pulse" />
                </div>
                <p className="text-pink-400 font-medium">
                  <span className="text-pink-400 font-semibold">
                    {webLinks.length}
                  </span>{" "}
                  websites
                  {selectedCategory !== "all" && (
                    <>
                      {" "}
                      in{" "}
                      <span className="text-rose-400 font-semibold">
                        {getCategoryDisplayName(selectedCategory)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Add New Button */}
            <div className="flex items-center gap-3">
              <CreateWebLinkDialog
                trigger={
                  <Button
                    className="relative group bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-200 px-6 py-2.5 h-auto font-semibold"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-md blur opacity-0 group-hover:opacity-50 transition-opacity" />
                    <Plus className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">Add Website</span>
                  </Button>
                }
                onSuccess={handleWebLinkCreated}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg blur-sm" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your love stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-700/30 backdrop-blur-sm rounded-lg p-1 border border-slate-600/30">
                {[
                  { mode: "carousel" as ViewMode, icon: Eye, label: "Carousel" },
                  { mode: "tags" as ViewMode, icon: Tags, label: "Tags" },
                  { mode: "cards" as ViewMode, icon: Grid3X3, label: "Cards" },
                ].map(({ mode, icon: Icon, label }) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "px-3 py-2 h-auto transition-all duration-200 relative group",
                      viewMode === mode
                        ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                    )}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                    {viewMode === mode && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-600/20 rounded blur animate-pulse" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {selectedCategory === "all" 
                        ? "All Categories" 
                        : getCategoryDisplayName(selectedCategory)}
                    </span>
                    <span className="sm:hidden">Category</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 w-56">
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                      "text-white hover:bg-slate-700/80 transition-colors",
                      selectedCategory === "all" && "bg-slate-700/50"
                    )}
                  >
                    <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                    All Categories ({webLinks.length})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-600/50" />
                  {categories.map((category) => {
                    const Icon = categoryIcons[category as keyof typeof categoryIcons] || Globe;
                    const colorClass = categoryColors[category as keyof typeof categoryColors] || "text-slate-400";
                    const count = getCategoryCount(category);
                    
                    return (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "text-white hover:bg-slate-700/80 transition-colors",
                          selectedCategory === category && "bg-slate-700/50"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Icon className={cn("h-4 w-4 mr-2", colorClass)} />
                            <span>{getCategoryDisplayName(category)}</span>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}