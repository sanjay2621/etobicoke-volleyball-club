import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fixPhotoUrl } from './client';
import type { Player, PlayerRegistrationRequest } from '../types';

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
