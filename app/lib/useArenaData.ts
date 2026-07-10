import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

export interface StandingRow {
  user_id: string;
  display_name: string;
  points: number | null;
  rank: number | null;
  is_turbo: boolean;
}

export interface ArenaData {
  groupId: string | null;
  groupName: string | null;
  potCents: number;
  weekNumber: number | null;
  standings: StandingRow[];
  loading: boolean;
}

// Loads the current user's first group, its live pot, and this week's standings.
// Subscribes to weekly_submissions/groups changes so the Arena updates in real time
// as the AI grades the pool and stakes come in.
export function useArenaData(): ArenaData {
  const [data, setData] = useState<ArenaData>({
    groupId: null,
    groupName: null,
    potCents: 0,
    weekNumber: null,
    standings: [],
    loading: true,
  });

  const load = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    const { data: appUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single();
    if (!appUser) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", appUser.id)
      .limit(1)
      .single();
    if (!membership) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    const { data: group } = await supabase
      .from("groups")
      .select("id, name, pot_cents, current_week_number")
      .eq("id", membership.group_id)
      .single();
    if (!group) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    const hasCurrent = await hasCurrentWeekSubmissions(group);
    const priorWeek = Math.max(1, group.current_week_number - 1 + hasCurrent);

    const { data: submissions } = await supabase
      .from("weekly_submissions")
      .select("user_id, points, rank, users:user_id(display_name)")
      .eq("group_id", group.id)
      .eq("week_number", priorWeek)
      .order("rank", { ascending: true });

    const standings: StandingRow[] = (submissions ?? []).map((s: any, i: number) => ({
      user_id: s.user_id,
      display_name: s.users?.display_name ?? "?",
      points: s.points,
      rank: s.rank,
      is_turbo: i === 0 && s.rank === 1,
    }));

    setData({
      groupId: group.id,
      groupName: group.name,
      potCents: group.pot_cents,
      weekNumber: priorWeek,
      standings,
      loading: false,
    });
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("arena-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_submissions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return data;
}

// If this week already has submissions being graded, show them; otherwise fall back
// to last week's finished standings so the Arena is never empty.
async function hasCurrentWeekSubmissions(group: { id: string; current_week_number: number }): Promise<0 | 1> {
  const { count } = await supabase
    .from("weekly_submissions")
    .select("id", { count: "exact", head: true })
    .eq("group_id", group.id)
    .eq("week_number", group.current_week_number);
  return count && count > 0 ? 1 : 0;
}
