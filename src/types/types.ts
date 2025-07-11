// types.ts - TypeScript interfaces for the layout components

// Extended interfaces for frontend use that handle both MongoDB and local data
export interface ImageDataProps {
  id: string | number;
  _id?: string;
  url: string;
  cloudinaryPublicId: string;
  caption?: string;
  group?: string;
  createdAt: Date;
  updatedAt: Date;
  takenAt: Date;
  isFavorite: boolean;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    originalFilename?: string;
  };
  tags?: string[];
  formattedSize?: string;
}

export interface ImageGroupProps {
  id: string;
  _id?: string;
  name: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  imageCount?: number;
}

export interface LayoutProps {
  children: React.ReactNode;
  videoSrc?: string;
  className?: string;
}

export interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

export interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number | string;
  onClick?: () => void;
}

export interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  expanded: boolean;
  active?: boolean;
  badge?: number | string;
  onClick?: () => void;
  className?: string;
}

export interface SidebarSectionProps {
  title?: string;
  expanded: boolean;
  children: React.ReactNode;
  className?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalImages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter options
export interface ImageFilters {
  group?: string;
  search?: string;
  favoritesOnly?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

// Gallery props for view components
export interface GalleryViewProps {
  images: ImageDataProps[];
  groups: ImageGroupProps[];
  onToggleFavorite: (imageId: string | number) => void;
  onEdit: (imageId: string | number) => void;
  onDelete: (imageId: string | number) => void;
  onChangeGroup: (imageId: string | number, groupId: string) => void;
}

// Timeline grouped images type
export interface TimelineGroupedImages {
  [dateKey: string]: ImageDataProps[];
}

export type ViewMode = "carousel" | "grid" | "timeline";
export type SortBy = "date" | "group" | "favorites" | "name";

export interface WebLinkDataProps {
  _id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: "memories" | "gifts" | "letters" | "moments" | "other";
  backgroundColor?: string;
  textColor?: string;
  visitCount: number;
  lastVisited?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata?: {
    siteName?: string;
    siteDescription?: string;
    favicon?: string;
    previewImage?: string;
  };

  // Image-related fields from aggregation
  imageCount?: number;
  firstImage?: ImageDataProps | null; // The primary thumbnail image
  recentImages?: ImageDataProps[]; // Up to 3 recent images
}

// WebLink view component props
export interface WebLinkViewProps {
  webLinks: WebLinkDataProps[];
  onVisitLink: (webLinkId: string) => void;
  onEditLink?: (webLink: WebLinkDataProps) => void;
  onDeleteLink?: (webLinkId: string) => void;
}


// WebLink filters
export interface WebLinkFilters {
  category?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "visitCount" | "lastVisited" | "title";
  sortOrder?: "asc" | "desc";
  includeInactive?: boolean;
}

// WebLink statistics
export interface WebLinkStatistics {
  categories: Array<{ _id: string; count: number }>;
  popularTags: Array<{ name: string; count: number }>;
  overview: {
    totalLinks: number;
    totalVisits: number;
    avgVisitsPerLink: number;
    lastUpdated: Date;
  };
}

// API response for WebLinks
export interface WebLinksResponse {
  webLinks: WebLinkDataProps[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
  statistics: WebLinkStatistics;
}