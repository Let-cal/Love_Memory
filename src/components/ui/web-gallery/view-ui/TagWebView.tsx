"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WebLinkDataProps } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Globe,
  Heart,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";

interface TagWebViewProps {
  webLinks: WebLinkDataProps[];
  onVisitLink: (linkId: string) => void;
}

interface TagGroup {
  tag: string;
  links: WebLinkDataProps[];
  count: number;
}

export default function TagWebView({ webLinks, onVisitLink }: TagWebViewProps) {
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  // Group web links by tags
  const tagGroups = useMemo(() => {
    const tagMap = new Map<string, WebLinkDataProps[]>();

    webLinks.forEach((link) => {
      if (link.tags.length === 0) {
        // Add untagged links to a special "untagged" group
        const untaggedLinks = tagMap.get("untagged") || [];
        tagMap.set("untagged", [...untaggedLinks, link]);
      } else {
        link.tags.forEach((tag) => {
          const tagLinks = tagMap.get(tag) || [];
          tagMap.set(tag, [...tagLinks, link]);
        });
      }
    });

    // Convert to array and sort by count (descending)
    const groups: TagGroup[] = Array.from(tagMap.entries())
      .map(([tag, links]) => ({
        tag,
        links: links.sort(
          (a, b) =>
            new Date(b.lastVisited || 0).getTime() -
            new Date(a.lastVisited || 0).getTime()
        ),
        count: links.length,
      }))
      .sort((a, b) => b.count - a.count);

    return groups;
  }, [webLinks]);

  const toggleTagExpansion = (tag: string) => {
    setExpandedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const handleVisitLink = (link: WebLinkDataProps) => {
    onVisitLink(link._id);
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const getTagColor = (tag: string) => {
    const colors = [
      "from-pink-500 to-rose-600",
      "from-purple-500 to-indigo-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-yellow-500 to-orange-600",
      "from-red-500 to-pink-600",
      "from-indigo-500 to-purple-600",
      "from-cyan-500 to-blue-600",
    ];

    const index = tag
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (webLinks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-600/30 backdrop-blur-sm">
        <div className="text-center">
          <Tag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">
            No tagged websites to display
          </p>
          <p className="text-slate-400 text-sm">
            Add some tags to organize your love stories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl blur opacity-75 animate-pulse" />
            <div className="relative p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
            Organized by Tags
          </h2>
        </div>
        <p className="text-slate-400 text-lg">
          {tagGroups.length} tag groups • {webLinks.length} total websites
        </p>
      </div>

      {/* Tag Groups */}
      <div className="space-y-6">
        {tagGroups.map((group, groupIndex) => (
          <motion.div
            key={group.tag}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="relative"
          >
            {/* Tag Header */}
            <div
              className="relative overflow-hidden backdrop-blur-xl border border-white/10 rounded-2xl mb-4 cursor-pointer"
              onClick={() => toggleTagExpansion(group.tag)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${getTagColor(
                  group.tag
                )} opacity-10`}
              />
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTagColor(
                        group.tag
                      )} flex items-center justify-center shadow-lg`}
                    >
                      {group.tag === "untagged" ? (
                        <Globe className="h-6 w-6 text-white" />
                      ) : (
                        <Tag className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize">
                        {group.tag === "untagged" ? "Untagged" : group.tag}
                      </h3>
                      <p className="text-slate-300">
                        {group.count} website{group.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      className={`bg-gradient-to-r ${getTagColor(
                        group.tag
                      )} text-white border-0`}
                    >
                      {group.count}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10 transition-colors"
                    >
                      {expandedTags.has(group.tag) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Content */}
            <AnimatePresence>
              {expandedTags.has(group.tag) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.links.map((link, linkIndex) => (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: linkIndex * 0.1 }}
                      >
                        <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                          <CardContent className="p-0">
                            {/* Thumbnail */}
                            <div className="relative h-48 overflow-hidden">
                              {link.recentImages &&
                              link.recentImages.length > 0 ? (
                                <img
                                  src={link.recentImages[0].url}
                                  alt={link.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-700 to-slate-800">
                                  <Globe className="h-12 w-12 text-slate-400" />
                                </div>
                              )}

                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Visit Count */}
                              <div className="absolute top-3 right-3">
                                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                                  <Eye className="h-3 w-3 text-white" />
                                  <span className="text-white text-xs">
                                    {link.visitCount}
                                  </span>
                                </div>
                              </div>

                              {/* Category Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 text-xs">
                                  {link.category}
                                </Badge>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                                {link.title}
                              </h4>

                              {link.description && (
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                  {link.description}
                                </p>
                              )}

                              {/* Metadata */}
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                {link.lastVisited && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        link.lastVisited
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {link.imageCount && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{link.imageCount}</span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 mb-4">
                                {link.tags.slice(0, 3).map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {link.tags.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs"
                                  >
                                    +{link.tags.length - 3}
                                  </Badge>
                                )}
                              </div>

                              {/* Visit Button */}
                              <Button
                                onClick={() => handleVisitLink(link)}
                                className="w-full group/btn relative bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transition-all duration-200 h-9 text-sm"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-md blur opacity-0 group-hover/btn:opacity-30 transition-opacity" />
                                <ExternalLink className="h-4 w-4 mr-2 relative z-10" />
                                <span className="relative z-10">Visit</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Expand All / Collapse All */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setExpandedTags(new Set(tagGroups.map((g) => g.tag)))
            }
            className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpandedTags(new Set())}
            className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
          >
            <ChevronUp className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>
      </div>
    </div>
  );
}
