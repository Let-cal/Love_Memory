"use client";

import { useGetWebLinks } from "@/hooks/web-gallery/useGetWebLinks";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Globe,
  Heart,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import WebGalleryControls from "./WebGalleryControls";
import CardWebView from "./view-ui/CardWebView";
import CarouselWebView from "./view-ui/CarouselWebView";
import TagWebView from "./view-ui/TagWebView";

type ViewMode = "carousel" | "tags" | "cards";

export default function WebGallery() {
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Use the real hook
  const {
    webLinks,
    isLoading,
    error,
    statistics,
    updateFilters,
    visitWebLink,
  } = useGetWebLinks({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Filter web links based on search and category (additional client-side filtering if needed)
  const filteredWebLinks = webLinks.filter((link) => {
    const matchesSearch =
      searchQuery === "" ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || link.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filtering
  const categories = statistics?.categories.map((cat) => cat._id) || [];

  // Get statistics with fallback
  const stats = statistics
    ? {
        totalLinks: statistics.overview.totalLinks,
        totalVisits: statistics.overview.totalVisits,
        totalImages: webLinks.reduce(
          (sum, link) => sum + (link.imageCount || 0),
          0
        ),
        categories: categories.length,
      }
    : {
        totalLinks: 0,
        totalVisits: 0,
        totalImages: 0,
        categories: 0,
      };

  const handleVisitLink = async (linkId: string) => {
    await visitWebLink(linkId);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateFilters({
      category: category === "all" ? undefined : category,
      search: searchQuery || undefined,
      offset: 0,
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      search: search || undefined,
      offset: 0,
    });
  };

  // Loading state
  if (isLoading && webLinks.length === 0) {
    return (
      <div className="min-h-screen content-card-light content-card-hover-light dark:content-card-light rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading your love gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen content-card-light content-card-hover-light dark:content-card-light rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load web links</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen content-card-light content-card-hover-light dark:content-card-light rounded-2xl">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-rose-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 p-6 md:p-">
          <div className="max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl blur opacity-75 animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                    Love Gallery
                  </h1>
                  <p className="text-lg text-slate-300 mt-2">
                    Our digital love story collection
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    icon: Globe,
                    label: "Websites",
                    value: stats.totalLinks,
                    color: "from-pink-500 to-rose-600",
                  },
                  {
                    icon: Users,
                    label: "Visits",
                    value: stats.totalVisits,
                    color: "from-purple-500 to-indigo-600",
                  },
                  {
                    icon: Heart,
                    label: "Memories",
                    value: stats.totalImages,
                    color: "from-rose-500 to-pink-600",
                  },
                  {
                    icon: Sparkles,
                    label: "Categories",
                    value: stats.categories,
                    color: "from-indigo-500 to-purple-600",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group rounded-2xl"
                  >
                    <div className="absolute inset-0 content-card-light rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-4 content-card-light rounded-2xl backdrop-blur-sm">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 mx-auto`}
                      >
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-700">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <WebGalleryControls
              webLinks={filteredWebLinks}
              categories={categories}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === "carousel" && (
                <CarouselWebView
                  webLinks={filteredWebLinks}
                  onVisitLink={handleVisitLink}
                />
              )}
              {viewMode === "tags" && (
                <TagWebView
                  webLinks={filteredWebLinks}
                  onVisitLink={handleVisitLink}
                />
              )}
              {viewMode === "cards" && (
                <CardWebView
                  webLinks={filteredWebLinks}
                  onVisitLink={handleVisitLink}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Hearts Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-500/20 text-2xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              rotate: 0,
            }}
            animate={{
              y: -20,
              rotate: 360,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </div>
    </div>
  );
}
