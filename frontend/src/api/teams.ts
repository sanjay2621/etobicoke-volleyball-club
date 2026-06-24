import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fixPhotoUrl } from './client';
import type { CaptainRoster, PublicTeam, Team, TeamRequest } from '../types';

const fixTeam = (t: Team): Team => ({
  ...t,
  members: t.members.map((m) => ({ ...m, photoUrl: fixPhotoUrl(m.photoUrl) })),
});
const fixPublicTeam = (t: PublicTeam): PublicTeam => ({
  ...t,
  members: t.members.map((m) => ({ ...m, photoUrl: fixPhotoUrl(m.photoUrl) })),
});
const fixRoster = (r: CaptainRoster): CaptainRoster => ({
  ...r,
  members: r.members.map((m) => ({ ...m, photoUrl: fixPhotoUrl(m.photoUrl) })),
});

export function usePublicTeams(tournamentId: number | null) {
  return useQuery({
    queryKey: ['teams', 'public', tournamentId],
    queryFn: () =>
      api.get<PublicTeam[]>(`/teams/public?tournamentId=${tournamentId}`).then((r) => r.data.map(fixPublicTeam)),
    enabled: tournamentId != null,
  });
}

export function useMyRoster(enabled = true) {
  return useQuery({
    queryKey: ['teams', 'my', 'roster'],
    queryFn: () => api.get<CaptainRoster>('/teams/my/roster').then((r) => fixRoster(r.data)),
    enabled,
    retry: false,
  });
}

export function useTeams(tournamentId: number | null) {
  return useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => api.get<Team[]>(`/teams?tournamentId=${tournamentId}`).then((r) => r.data.map(fixTeam)),
    enabled: tournamentId != null,
  });
}

export function useMyTeam(enabled = true) {
  return useQuery({
    queryKey: ['teams', 'my'],
    queryFn: () => api.get<Team>('/teams/my').then((r) => fixTeam(r.data)),
    enabled,
    retry: false,
  });
}

function useTeamMutation<T>(fn: (arg: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export const useCreateTeam = () =>
  useTeamMutation((body: TeamRequest) => api.post('/teams', body));

export const useUpdateTeam = () =>
  useTeamMutation(({ id, body }: { id: number; body: TeamRequest }) => api.put(`/teams/${id}`, body));

export const useDeleteTeam = () => useTeamMutation((id: number) => api.delete(`/teams/${id}`));

export const useAddMember = () =>
  useTeamMutation(({ teamId, playerId }: { teamId: number; playerId: number }) =>
    api.post(`/teams/${teamId}/members`, { playerId }),
  );

export const useRemoveMember = () =>
  useTeamMutation(({ teamId, playerId }: { teamId: number; playerId: number }) =>
    api.delete(`/teams/${teamId}/members/${playerId}`),
  );

export const useSetCaptain = () =>
  useTeamMutation(({ teamId, playerId }: { teamId: number; playerId: number }) =>
    api.put(`/teams/${teamId}/captain/${playerId}`),
  );

export const useSetReferee = () =>
  useTeamMutation(({ teamId, playerId }: { teamId: number; playerId: number }) =>
    api.put(`/teams/${teamId}/referee/${playerId}`),
  );
