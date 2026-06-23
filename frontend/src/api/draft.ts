import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { DraftState } from '../types';

export function useDraftState(tournamentId: number | null) {
  return useQuery({
    queryKey: ['draft', tournamentId],
    queryFn: () => api.get<DraftState>(`/draft/${tournamentId}/state`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

function useDraftMutation(fn: (tournamentId: number, playerId?: number) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, playerId }: { tournamentId: number; playerId?: number }) =>
      fn(tournamentId, playerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draft'] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export const useStartDraft = () =>
  useDraftMutation((tournamentId) => api.post(`/draft/${tournamentId}/start`));

export const usePick = () =>
  useDraftMutation((tournamentId, playerId) =>
    api.post(`/draft/${tournamentId}/pick`, { playerId }),
  );
