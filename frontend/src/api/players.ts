import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fixPhotoUrl } from './client';
import type { Player, PlayerLookupResponse, PlayerRegistrationRequest } from '../types';

const fixPlayer = (p: Player): Player => ({ ...p, photoUrl: fixPhotoUrl(p.photoUrl) });

/** Public registration: sends multipart/form-data with a JSON "data" part + optional "photo". */
export function useRegisterPlayer() {
  return useMutation({
    mutationFn: async ({
      data,
      photo,
    }: {
      data: PlayerRegistrationRequest;
      photo?: File | null;
    }) => {
      const form = new FormData();
      form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (photo) form.append('photo', photo);
      const res = await api.post<Player>('/players', form);
      return fixPlayer(res.data);
    },
  });
}

/**
 * Looks up a previous registration by phone or email, for the public registration page's prefill
 * checkbox. A mutation rather than a query: it only ever runs when explicitly triggered (button
 * click), so there's no "enabled" flag or query-key-change semantics to get wrong.
 */
export function useLookupPreviousRegistration() {
  return useMutation({
    mutationFn: ({ email, phone }: { email: string; phone: string }) =>
      api
        .get<PlayerLookupResponse>('/players/lookup', { params: { email, phone } })
        .then((r) => r.data),
  });
}

export function useMyPlayer(enabled = true) {
  return useQuery({
    queryKey: ['players', 'me'],
    queryFn: () => api.get<Player>('/players/me').then((r) => fixPlayer(r.data)),
    enabled,
    retry: false,
  });
}

export function usePlayers(tournamentId: number | null) {
  return useQuery({
    queryKey: ['players', 'tournament', tournamentId],
    queryFn: () =>
      api.get<Player[]>(`/players?tournamentId=${tournamentId}`).then((r) => r.data.map(fixPlayer)),
    enabled: tournamentId != null,
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.put<Player>(`/players/${id}`, body).then((r) => fixPlayer(r.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useUploadMyPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photo: File) => {
      const form = new FormData();
      form.append('photo', photo);
      const res = await api.post<Player>('/players/me/photo', form);
      return fixPlayer(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', 'me'] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/players/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useMarkPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: number; paymentStatus: 'PAID' | 'UNPAID' }) =>
      api.patch<Player>(`/players/${id}/payment`, { paymentStatus }).then((r) => fixPlayer(r.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my', 'roster'] }),
  });
}

/** Admin copies a player's info into another tournament without the player re-registering. */
export function useCopyPlayerToTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetTournamentId }: { id: number; targetTournamentId: number }) =>
      api.post<Player>(`/players/${id}/copy`, { targetTournamentId }).then((r) => fixPlayer(r.data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useUploadPlayerPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, photo }: { id: number; photo: File }) => {
      const form = new FormData();
      form.append('photo', photo);
      const res = await api.post<Player>(`/players/${id}/photo`, form);
      return fixPlayer(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}
