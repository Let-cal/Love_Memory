"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WebLinkDataProps } from "@/types/types";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import React, { useRef, useState } from "react";

interface CardWebViewProps {
  webLinks: WebLinkDataProps[];
  onVisitLink: (linkId: string) => void;
}

const Card3D = ({
  webLink,
  onVisitLink,
}: {
  webLink: WebLinkDataProps;
  onVisitLink: (linkId: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["17.5deg", "-17.5deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-17.5deg", "17.5deg"]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleVisitLink = () => {
    onVisitLink(webLink._id);
    window.open(webLink.url, "_blank", "noopener,noreferrer");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      memories: "from-pink-500 to-rose-600",
      gifts: "from-purple-500 to-indigo-600",
      letters: "from-orange-500 to-amber-600",
      moments: "from-cyan-500 to-teal-600",
      other: "from-slate-500 to-gray-600",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative group cursor-pointer"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-xl shadow-2xl hover:shadow-pink-500/10 transition-all duration-300">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 right-2 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-rose-600/20 rounded-full blur-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-lg animate-pulse delay-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <CardContent className="p-0 relative z-10">
          {/* Thumbnail Section */}
          <div className="relative h-48 overflow-hidden">
            {webLink.recentImages && webLink.recentImages.length > 0 ? (
              <img
                src={webLink.recentImages[0].url} // Lấy ảnh đầu tiên làm thumbnail
                alt={webLink.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">
                    {webLink.metadata?.siteName || webLink.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                className={`bg-gradient-to-r ${getCategoryColor(
                  webLink.category
                )} text-white border-0 shadow-lg`}
              >
                {webLink.category}
              </Badge>
            </div>

            {/* Stats */}
            <div className="absolute top-3 right-3 flex gap-2">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                <Eye className="h-3 w-3 text-white" />
                <span className="text-white text-xs font-medium">
                  {webLink.visitCount}
                </span>
              </div>
              {webLink.imageCount && (
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                  <ImageIcon className="h-3 w-3 text-white" />
                  <span className="text-white text-xs font-medium">
                    {webLink.imageCount}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Sparkles */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-8 w-8 text-pink-400 animate-pulse" />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent mb-3 line-clamp-2">
              {webLink.title}
            </h3>

            {/* Description */}
            {webLink.description && (
              <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {webLink.description}
              </p>
            )}

            {/* Tags */}
            {webLink.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {webLink.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50 transition-colors text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {webLink.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs"
                  >
                    +{webLink.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-slate-400 text-xs mb-4">
              {webLink.lastVisited && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(webLink.lastVisited).toLocaleDateString()}
                  </span>
                </div>
              )}
              {webLink.metadata?.siteName && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">
                    {webLink.metadata.siteName}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleVisitLink}
              className="w-full group/btn relative bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transition-all duration-200 h-10 text-sm font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-md blur opacity-0 group-hover/btn:opacity-50 transition-opacity" />
              <ExternalLink className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Visit Love Story</span>
            </Button>
          </div>
        </CardContent>

        {/* 3D Effect Light */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-transparent to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            transform: `translateZ(75px)`,
            transformStyle: "preserve-3d",
          }}
        />
      </Card>
    </motion.div>
  );
};

export default function CardWebView({
  webLinks,
  onVisitLink,
}: CardWebViewProps) {
  if (webLinks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-600/30 backdrop-blur-sm">
        <div className="text-center">
          <Globe className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No websites to display</p>
          <p className="text-slate-400 text-sm">
            Add some love stories to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webLinks.map((webLink, index) => (
          <motion.div
            key={webLink._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card3D webLink={webLink} onVisitLink={onVisitLink} />
          </motion.div>
        ))}
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-500/20 text-lg"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1200),
              y:
                (typeof window !== "undefined" ? window.innerHeight : 800) + 20,
              rotate: 0,
            }}
            animate={{
              y: -20,
              rotate: 360,
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1200),
            }}
            transition={{
              duration: 12 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 4,
            }}
          >
            💕
          </motion.div>
        ))}
      </div>
    </div>
  );
}
