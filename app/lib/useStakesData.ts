import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface StakerRow {
  user_id: string;
  display_name: string;
  has_staked: boolean;
}

export function useStakesData() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [potCents, setPotCents] = useState(0);
  const [members, setMembers] = useState<StakerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      return;
    }

    const { data: appUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single();
    if (!appUser) {
      setLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", appUser.id)
      .limit(1)
      .single();
    if (!membership) {
      setLoading(false);
      return;
    }

    const { data: group } = await supabase
      .from("groups")
      .select("id, pot_cents, current_week_number")
      .eq("id", membership.group_id)
      .single();
    if (!group) {
      setLoading(false);
      return;
    }

    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("users:user_id(id, display_name)")
      .eq("group_id", group.id);

    const { data: stakes } = await supabase
      .from("stakes")
      .select("user_id")
      .eq("group_id", group.id)
      .eq("week_number", group.current_week_number);

    const stakedUserIds = new Set((stakes ?? []).map((s) => s.user_id));

    const rows: StakerRow[] = (groupMembers ?? []).map((m: any) => ({
      user_id: m.users?.id,
      display_name: m.users?.display_name ?? "?",
      has_staked: stakedUserIds.has(m.users?.id),
    }));

    setGroupId(group.id);
    setWeekNumber(group.current_week_number);
    setPotCents(group.pot_cents);
    setMembers(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("stakes-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "stakes" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { groupId, weekNumber, potCents, members, loading, reload: load };
}
