import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { MatchResponse, MatchSetDto, StandingGroup } from '../types';

export function useSchedule(tournamentId: number | null) {
  return useQuery({
    queryKey: ['schedule', tournamentId],
    queryFn: () => api.get<MatchResponse[]>(`/schedule/${tournamentId}`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

export function useStandings(tournamentId: number | null) {
  return useQuery({
    queryKey: ['standings', tournamentId],
    queryFn: () => api.get<StandingGroup[]>(`/standings/${tournamentId}`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

export function usePublicSchedule(tournamentId: number | null) {
  return useQuery({
    queryKey: ['schedule', 'public', tournamentId],
    queryFn: () =>
      api.get<MatchResponse[]>(`/schedule/public/${tournamentId}`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

export function usePublicStandings(tournamentId: number | null) {
  return useQuery({
    queryKey: ['standings', 'public', tournamentId],
    queryFn: () =>
      api.get<StandingGroup[]>(`/standings/public/${tournamentId}`).then((r) => r.data),
    enabled: tournamentId != null,
  });
}

/** Polls the public schedule and returns only matches currently live, for the home-page scoreboard. */
export function usePublicLiveMatches(tournamentId: number | null) {
  return useQuery({
    queryKey: ['schedule', 'public', tournamentId, 'live'],
    queryFn: () =>
      api.get<MatchResponse[]>(`/schedule/public/${tournamentId}`)
        .then((r) => r.data.filter((m) => m.status === 'IN_PROGRESS')),
    enabled: tournamentId != null,
    refetchInterval: 3000,
  });
}

function useScheduleMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      qc.invalidateQueries({ queryKey: ['standings'] });
    },
  });
}

export const useGeneratePools = () =>
  useScheduleMutation((tournamentId: number) => api.post(`/schedule/${tournamentId}/generate-pools`));

export const useGeneratePlayoffs = () =>
  useScheduleMutation((tournamentId: number) => api.post(`/schedule/${tournamentId}/generate-playoffs`));

export const useRecordResult = () =>
  useScheduleMutation(({ matchId, sets }: { matchId: number; sets: MatchSetDto[] }) =>
    api.put(`/matches/${matchId}/result`, { sets }),
  );

export const useAdjustLiveScore = () =>
  useScheduleMutation(({ matchId, side, delta }: { matchId: number; side: 'HOME' | 'AWAY'; delta: number }) =>
    api.patch(`/matches/${matchId}/live-score`, { side, delta }),
  );
