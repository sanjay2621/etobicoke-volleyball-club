import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fixPhotoUrl } from './client';
import type { DraftState } from '../types';

const fixDraftState = (d: DraftState): DraftState => ({
  ...d,
  availablePlayers: d.availablePlayers.map((p) => ({ ...p, photoUrl: fixPhotoUrl(p.photoUrl) })),
  teams: d.teams.map((t) => ({
    ...t,
    members: t.members.map((m) => ({ ...m, photoUrl: fixPhotoUrl(m.photoUrl) })),
  })),
});

export function useDraftState(tournamentId: number | null) {
  return useQuery({
    queryKey: ['draft', tournamentId],
    queryFn: () => api.get<DraftState>(`/draft/${tournamentId}/state`).then((r) => fixDraftState(r.data)),
    enabled: tournamentId != null,
  });
}

export function useStartDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tournamentId: number) => api.post(`/draft/${tournamentId}/start`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draft'] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function usePick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, playerId, teamId }: { tournamentId: number; playerId: number; teamId: number }) =>
      api.post(`/draft/${tournamentId}/pick`, { playerId, teamId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draft'] });
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
