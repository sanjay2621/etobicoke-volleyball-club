import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Tournament, TournamentRequest } from '../types';

const KEY = ['tournaments'];

export function useTournaments() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Tournament[]>('/tournaments').then((r) => r.data),
  });
}

export function usePublicTournaments() {
  return useQuery({
    queryKey: ['tournaments', 'public'],
    queryFn: () => api.get<Tournament[]>('/tournaments/public').then((r) => r.data),
  });
}

const isUpcoming = (t: Tournament) => t.date >= new Date().toISOString().slice(0, 10);

/** Admin hook — upcoming tournaments only (today or future). */
export function useActiveTournaments() {
  const q = useTournaments();
  return { ...q, data: q.data?.filter(isUpcoming) };
}

/** Public hook — upcoming tournaments only (today or future). */
export function useActivePublicTournaments() {
  const q = usePublicTournaments();
  return { ...q, data: q.data?.filter(isUpcoming) };
}

export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TournamentRequest) =>
      api.post<Tournament>('/tournaments', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: TournamentRequest }) =>
      api.put<Tournament>(`/tournaments/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/tournaments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
