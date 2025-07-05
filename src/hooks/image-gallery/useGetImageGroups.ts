// hooks/image-gallery/useGetImageGroups.ts
import { useState, useEffect } from 'react';
import { ImageGroupProps } from '@/types/types';

export function useGetImageGroups() {
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
    fetchGroups();
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

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
    addGroup,
    updateGroup,
    removeGroup,
    clearError: () => setError(null),
  };
}

