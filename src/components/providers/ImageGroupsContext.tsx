// context/ImageGroupsContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { ImageGroupProps } from '@/types/types';

interface ImageGroupsContextType {
  groups: ImageGroupProps[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addGroup: (newGroup: ImageGroupProps) => void;
  updateGroup: (updatedGroup: ImageGroupProps) => void;
  removeGroup: (groupId: string) => void;
}

const ImageGroupsContext = createContext<ImageGroupsContextType | null>(null);

export function ImageGroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<ImageGroupProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/image-groups');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch groups');
      }

      setGroups(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(errorMessage);
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(); // Fetch dữ liệu khi provider được mount (tức là khi trang load)
  }, []);

  const addGroup = (newGroup: ImageGroupProps) => {
    setGroups(prev => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateGroup = (updatedGroup: ImageGroupProps) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === updatedGroup.id ? updatedGroup : group
      )
    );
  };

  const removeGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const refetch = () => {
    fetchGroups();
  };

  return (
    <ImageGroupsContext.Provider
      value={{
        groups,
        isLoading,
        error,
        refetch,
        addGroup,
        updateGroup,
        removeGroup,
      }}
    >
      {children}
    </ImageGroupsContext.Provider>
  );
}

export function useImageGroups() {
  const context = useContext(ImageGroupsContext);
  if (!context) {
    throw new Error('useImageGroups must be used within an ImageGroupsProvider');
  }
  return context;
}