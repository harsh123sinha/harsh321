import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export function useBookmarks() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarkedIds = new Set(), isLoading } = useQuery({
    queryKey: ['bookmarks', 'ids'],
    queryFn: async () => {
      const res = await api.get('/saved-properties/ids');
      return new Set((res.data?.ids || []).map((id) => Number(id)));
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ propertyId, saved }) => {
      if (saved) {
        await api.delete(`/saved-properties/${propertyId}`);
      } else {
        await api.post(`/saved-properties/${propertyId}`);
      }
    },
    onSuccess: (_data, { saved }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(saved ? 'Removed from saved properties' : 'Property saved');
    },
    onError: () => {
      toast.error('Could not update bookmark. Please try again.');
    },
  });

  const toggleBookmark = (propertyId) => {
    const id = Number(propertyId);
    const saved = bookmarkedIds.has(id);
    return toggleMutation.mutateAsync({ propertyId: id, saved });
  };

  const isBookmarked = (propertyId) => bookmarkedIds.has(Number(propertyId));

  return {
    bookmarkedIds,
    isLoading,
    isBookmarked,
    toggleBookmark,
    isToggling: toggleMutation.isPending,
  };
}
