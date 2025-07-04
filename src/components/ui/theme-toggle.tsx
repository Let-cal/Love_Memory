"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  expanded: boolean;
}

export function ThemeToggle({ expanded }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Add a small delay to let animation start before theme change
    setTimeout(() => {
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    }, 300);

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="p-4 border-t border-slate-700/30 dark:border-slate-600/20">
        <div
          className={cn(
            "w-full h-12 rounded-full bg-slate-700/50 animate-pulse",
            expanded ? "" : "w-12 mx-auto"
          )}
        />
      </div>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="p-4 border-t border-slate-700/30 dark:border-slate-600/20">
      <div
        className={cn(
          "flex items-center",
          expanded ? "justify-between" : "justify-center"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isAnimating}
          className={cn(
            "relative overflow-hidden rounded-full transition-all duration-500 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:ring-offset-2 focus:ring-offset-slate-900",
            "disabled:cursor-not-allowed",
            expanded ? "w-20 h-10" : "w-12 h-12"
          )}
          style={{
            background: isLight
              ? "linear-gradient(135deg, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)"
              : "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)",
          }}
        >
          {/* Sun/Moon Slider Container */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out",
              expanded ? "w-16 h-16" : "w-16 h-16",
              // Slide animation
              isLight
                ? expanded
                  ? "right-6"
                  : "right-0"
                : expanded
                ? "left-6"
                : "left-0",
              isAnimating && "scale-110"
            )}
          >
            {/* Sun */}
            <div
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                isLight
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 rotate-180"
              )}
            >
              {/* Replace this div with your sun image */}
              <Image
                src="/images/ThemeToggle/Sun.png" // Replace with your sun image path
                alt="Sun"
                width={100}
                height={100}
                className="w-full h-full object-contain"
                style={{
                  filter: isLight
                    ? "drop-shadow(0 0 10px rgba(255, 235, 59, 0.6))"
                    : "none",
                }}
              />
              {/* Fallback if no image */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg flex items-center justify-center">
                ☀️
              </div>
            </div>

            {/* Moon */}
            <div
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                !isLight
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 rotate-180"
              )}
            >
              {/* Replace this div with your moon image */}
              <Image
                src="/images/ThemeToggle/Moon.png" // Replace with your moon image path
                alt="Moon"
                width={500}
                height={500}
                className="object-contain"
                style={{
                  filter: !isLight
                    ? "drop-shadow(0 0 10px rgba(148, 163, 184, 0.4))"
                    : "none",
                }}
              />
              {/* Fallback if no image */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg flex items-center justify-center">
                🌙
              </div>
            </div>
          </div>

          {/* Clouds - Fade out when switching to dark */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              isLight ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Cloud 1 */}
            <Image
              src="/images/ThemeToggle/Cloud1.png" // Replace with your cloud image
              alt="Cloud"
              width={100}
              height={100}
              className={cn(
                "absolute w-4 h-3 transition-all duration-700 ease-out",
                expanded ? "top-1 right-2" : "top-2 right-1"
              )}
              style={{
                transform: isLight
                  ? "translateY(0) scale(1)"
                  : "translateY(-10px) scale(0.8)",
                transitionDelay: "100ms",
              }}
            />

            {/* Cloud 2 */}
            <Image
              src="/images/ThemeToggle/Cloud2.png" // Replace with your cloud image
              alt="Cloud"
              width={100}
              height={100}
              className={cn(
                "absolute w-3 h-2 transition-all duration-700 ease-out",
                expanded ? "bottom-1 right-3" : "bottom-2 right-1"
              )}
              style={{
                transform: isLight
                  ? "translateY(0) scale(1)"
                  : "translateY(10px) scale(0.8)",
                transitionDelay: "200ms",
              }}
            />

            {/* Cloud 3 */}
            <Image
              src="/images/ThemeToggle/Cloud3.png" // Replace with your cloud image
              alt="Cloud"
              width={100}
              height={100}
              className={cn(
                "absolute w-4 h-2 transition-all duration-700 ease-out",
                expanded ? "bottom-3 right-1" : "bottom-3 right-2"
              )}
              style={{
                transform: isLight
                  ? "translateY(0) scale(1)"
                  : "translateY(10px) scale(0.8)",
                transitionDelay: "200ms",
              }}
            />
          </div>

          {/* Stars - Fade in with staggered timing */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              !isLight ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Star 1 */}
            <Image
              src="/images/ThemeToggle/Stars.png" // Replace with your star image
              alt="Star"
              width={100}
              height={100}
              className={cn(
                "absolute w-20 h-10 transition-all duration-800 ease-out",
                expanded ? "top-4 right-2" : "top-2 left-1"
              )}
              style={{
                transform: !isLight
                  ? "scale(1) rotate(0deg)"
                  : "scale(0) rotate(180deg)",
                transitionDelay: "200ms",
              }}
            />

            {/* Fallback stars if no images */}
            <div
              className={cn(
                "absolute transition-all duration-800",
                expanded ? "top-1 left-2" : "top-2 left-1"
              )}
              style={{
                transform: !isLight
                  ? "scale(1) rotate(0deg)"
                  : "scale(0) rotate(180deg)",
                transitionDelay: "200ms",
              }}
            >
              <div className="w-1 h-1 bg-white relative">
                <div className="absolute inset-0 bg-white transform rotate-45" />
              </div>
            </div>
          </div>
        </button>

        {/* Label */}
        {expanded && (
          <span
            className={cn(
              "ml-3 text-sm font-medium transition-colors duration-300",
              "text-white dark:text-slate-100"
            )}
          >
            {isLight ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </div>
    </div>
  );
}
