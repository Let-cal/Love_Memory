"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/SideBar";
import { Menu } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  videoSrc?: string;
}

export function Layout({
  children,
  videoSrc = "/love_background.mp4",
}: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Collapsed by default on mobile
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("Video source:", videoSrc);
    setVideoLoaded(false);
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoSrc]);

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setVideoLoaded(true);
    setVideoError(null);
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    const error = (e.target as HTMLVideoElement).error;
    const errorMessage = error
      ? `Video error: ${error.message} (code: ${error.code})`
      : "Unknown video error";
    console.error(errorMessage);
    setVideoError(errorMessage);
    setVideoLoaded(false);
  };

  const handleVideoCanPlay = () => {
    console.log("Video can play");
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video play failed:", err);
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen animated background video */}
      <div className="fixed inset-0 z-0">
        <video
          key={videoSrc}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onCanPlay={handleVideoCanPlay}
          preload="auto"
          controls={false}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc} type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback background */}
        {!videoLoaded && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-200 via-white to-pink-100 animate-gradient-x">
            {videoError && (
              <div className="absolute top-4 left-4 bg-red-500/80 text-white p-2 rounded text-sm">
                {videoError}
              </div>
            )}
          </div>
        )}

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
      </div>

      {/* Main layout container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - Desktop */}
        <div
          className={`
            hidden lg:block transition-all duration-300 ease-in-out
            ${sidebarExpanded ? "w-80" : "w-20"}
          `}
        >
          <Sidebar
            expanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </div>

        {/* Mobile Sidebar Trigger */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="bg-slate-900/90 backdrop-blur-sm text-white hover:bg-slate-800/90 border border-slate-700/50"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>

            <Sidebar expanded={true} onToggle={() => {}} />
          </Sheet>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative">
          {/* Content wrapper with translucent dark background */}
          <div className="h-full bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-800/60 backdrop-blur-sm dark:from-black/70 dark:via-black/50 dark:to-slate-900/70">
            <div className="p-4 sm:p-6 lg:p-8 h-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
