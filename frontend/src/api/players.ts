import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Player, PlayerRegistrationRequest } from '../types';

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
      return res.data;
    },
  });
}

export function useMyPlayer(enabled = true) {
  return useQuery({
    queryKey: ['players', 'me'],
    queryFn: () => api.get<Player>('/players/me').then((r) => r.data),
    enabled,
    retry: false,
  });
}

export function usePlayers(tournamentId: number | null) {
  return useQuery({
    queryKey: ['players', 'tournament', tournamentId],
    queryFn: () =>
      api.get<Player[]>(`/players?tournamentId=${tournamentId}`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.put<Player>(`/players/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/players/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}
