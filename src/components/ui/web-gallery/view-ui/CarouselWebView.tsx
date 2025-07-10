"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Eye, 
  Heart, 
  Calendar,
  Globe,
  Play,
  Pause
} from "lucide-react";
import { WebLinkDataProps } from "@/types/types";


interface CarouselWebViewProps {
  webLinks: WebLinkDataProps[];
  onVisitLink: (linkId: string) => void;
}

export default function CarouselWebView({ webLinks, onVisitLink }: CarouselWebViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || webLinks.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % webLinks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, webLinks.length]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + webLinks.length) % webLinks.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % webLinks.length);
  };

  const handleVisitLink = (link: WebLinkDataProps) => {
    onVisitLink(link._id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (webLinks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-600/30 backdrop-blur-sm">
        <div className="text-center">
          <Globe className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">No websites to display</p>
          <p className="text-slate-400 text-sm">Add some love stories to see them here</p>
        </div>
      </div>
    );
  }

  const currentLink = webLinks[currentIndex];
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  return (
    <div className="relative">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-600/30 backdrop-blur-sm bg-gradient-to-br from-slate-800/30 to-slate-700/30">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-rose-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Carousel Content */}
        <div className="relative z-10 h-[600px] flex items-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
            >
              <Card className="max-w-4xl w-full bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0 min-h-[500px]">
                    {/* Image Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      {currentLink.recentImages && currentLink.recentImages.length > 0 ?  (
                        <img
                          src={currentLink.recentImages[0].url}
                          alt={currentLink.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Globe className="h-20 w-20 mb-4" />
                          <p className="text-lg font-medium">{currentLink.metadata?.siteName || currentLink.title}</p>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 shadow-lg"
                        >
                          {currentLink.category}
                        </Badge>
                      </div>

                      {/* Visit Count */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                          <Eye className="h-4 w-4 text-white" />
                          <span className="text-white text-sm font-medium">{currentLink.visitCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent mb-4">
                          {currentLink.title}
                        </h3>

                        {/* Description */}
                        {currentLink.description && (
                          <p className="text-slate-300 text-lg leading-relaxed mb-6">
                            {currentLink.description}
                          </p>
                        )}

                        {/* Tags */}
                        {currentLink.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {currentLink.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
                          {currentLink.lastVisited && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Last visited: {new Date(currentLink.lastVisited).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {currentLink.imageCount && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{currentLink.imageCount} memories</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleVisitLink(currentLink)}
                        className="group relative bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-200 h-12 text-lg font-semibold"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-md blur opacity-0 group-hover:opacity-50 transition-opacity" />
                        <ExternalLink className="h-5 w-5 mr-2 relative z-10" />
                        <span className="relative z-10">Visit Love Story</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center z-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20 shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-4 flex items-center z-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20 shadow-lg transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {webLinks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoPlay}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isAutoPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <div className="text-slate-400 text-sm">
            {currentIndex + 1} / {webLinks.length}
          </div>
        </div>
      </div>
    </div>
  );
}