"use client";

import { useSidebar } from "@/components/providers/sidebar-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gift,
  HeartHandshake,
  Images,
  Menu,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { expanded, toggleExpanded } = useSidebar();

  // Mobile sidebar content
  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full content-card-light dark:content-card-light">
      <VisuallyHidden>
        <SheetTitle>Sidebar Navigation</SheetTitle> {/* Thêm SheetTitle ẩn */}
      </VisuallyHidden>
      <SidebarHeader expanded={true} onToggle={() => setMobileOpen(false)} />
      <SidebarContent expanded={true} pathname={pathname} router={router} />
      <SidebarGroup expanded={true} pathname={pathname} router={router} />
      <div className="flex-1" />
      <ThemeToggle expanded={true} />
      <SidebarFooter expanded={true} />
    </div>
  );

  return (
    <>
      {/* Mobile Sheet Sidebar */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 left-4 z-50 content-card-light dark:content-card-light backdrop-blur-xl border-r border-pink-200/50 dark:border-slate-700/30"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <MobileSidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex relative h-full flex-col",
          "content-card-light dark:content-card-light backdrop-blur-xl border-r border-pink-200/50 dark:border-slate-700/30",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "transition-all duration-300 ease-in-out",
          expanded ? "min-w-64" : "min-w-16",
          className
        )}
      >
        <SidebarHeader expanded={expanded} onToggle={toggleExpanded} />
        <SidebarContent
          expanded={expanded}
          pathname={pathname}
          router={router}
        />
        <SidebarGroup expanded={expanded} pathname={pathname} router={router} />
        <div className="flex-1" />
        <ThemeToggle expanded={expanded} />
        <SidebarFooter expanded={expanded} />
      </div>
    </>
  );
}

function SidebarHeader({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-4 border-b border-pink-200/50 dark:border-slate-700/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-8 w-8 text-pink-500 dark:text-pink-400" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-foreground truncate">
                Love Memory
              </h1>
              <p className="text-xs text-pink-600/80 dark:text-pink-400/70 truncate">
                For My Love
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="flex-shrink-0 text-gray-700 dark:text-white hover:bg-pink-100/50 dark:hover:bg-slate-800/50 p-2 transition-colors duration-200"
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function SidebarContent({
  expanded,
  pathname,
  router,
}: {
  expanded: boolean;
  pathname: string | null;
  router: ReturnType<typeof useRouter>;
}) {
  const menuItems = [
    {
      icon: Images,
      label: "Image Gallery",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: ExternalLink,
      label: "Web Gallery",
      href: "/user/web-gallery",
      active: pathname === "/user/web-gallery",
    },
    {
      icon: Gift,
      label: "Wishes",
      href: "/user/wishes",
      active: pathname === "/user/wishes",
    },
  ];

  return (
    <div className="p-4 space-y-2">
      {expanded && (
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
          Navigation
        </h2>
      )}

      {menuItems.map((item, index) => (
        <SidebarButton
          key={index}
          icon={item.icon}
          label={item.label}
          expanded={expanded}
          active={item.active}
          onClick={() => {
            router.push(item.href);
          }}
        />
      ))}
    </div>
  );
}

function SidebarGroup({
  expanded,
  pathname,
  router,
}: {
  expanded: boolean;
  pathname: string | null;
  router: ReturnType<typeof useRouter>;
}) {
  console.log("Current pathname:", pathname);
  const groupItems = [
    {
      icon: HeartHandshake,
      label: "Profile",
      href: "/user/profile",
      active: pathname === "/user/profile",
    },
  ];

  return (
    <div className="p-4 border-t border-pink-200/50 dark:border-slate-700/30">
      {expanded && (
        <h2 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-4">
          Quick Access
        </h2>
      )}

      <div className="space-y-2">
        {groupItems.map((item, index) => (
          <SidebarButton
            key={index}
            icon={item.icon}
            label={item.label}
            expanded={expanded}
            active={item.active}
            onClick={() => {
              router.push(item.href);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarFooter({ expanded }: { expanded: boolean }) {
  return (
    <div className="p-4 border-t border-pink-200/50 dark:border-slate-700/30">
      <div className="text-center">
        {expanded ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-slate-500">
              Version 1.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-500">
              © 2024 Love Memory
            </p>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto bg-pink-200/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-700 dark:text-white font-bold">
              v1
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  expanded: boolean;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

function SidebarButton({
  icon: Icon,
  label,
  expanded,
  active = false,
  badge,
  onClick,
}: SidebarButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-foreground",
        "hover:bg-pink-100/50 dark:hover:bg-slate-800/50",
        "transition-all duration-200 ease-in-out",
        "touch-manipulation",
        active &&
          "bg-pink-200/50 dark:bg-pink-500/20 hover:bg-pink-200/70 dark:hover:bg-pink-500/30 border border-pink-300/50 dark:border-pink-400/30 shadow-md text-pink-700 dark:text-pink-100",
        expanded ? "px-3 py-2" : "px-2 py-2 justify-center"
      )}
      onClick={onClick}
    >
      <Icon
        className={cn(
          "flex-shrink-0",
          expanded ? "h-5 w-5 mr-3" : "h-5 w-5",
          active && "text-pink-600 dark:text-pink-300"
        )}
      />

      {expanded && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge && (
            <span className="ml-2 px-2 py-1 text-xs bg-pink-200/50 dark:bg-pink-500/30 text-pink-700 dark:text-pink-200 rounded-full border border-pink-300/50 dark:border-pink-400/30">
              {badge}
            </span>
          )}
        </>
      )}

      {!expanded && <span className="sr-only">{label}</span>}
    </Button>
  );
}
