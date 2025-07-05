// hooks/image-gallery/useCreateImageGroup.ts
import { useState } from 'react';
import { ImageGroupProps } from '@/types/types';

interface CreateGroupData {
  name: string;
  description?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useCreateImageGroup() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (data: CreateGroupData): Promise<ImageGroupProps | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/image-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create group');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createGroup,
    isCreating,
    error,
    clearError: () => setError(null),
  };
}

