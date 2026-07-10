import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface GroupWeekStatus {
  groupId: string | null;
  myUserId: string | null;
  weekStatus: "open" | "deadlocked" | "settled" | null;
  deadlockFinalistIds: [string, string] | null;
  deadlockDeadline: string | null;
  loading: boolean;
}

// Lightweight, root-level subscription used to gate navigation: when the
// group enters a deadlock, every member should be routed to the Deadlock
// screen regardless of what tab they're on, mirroring the existing
// logged-out redirect pattern in app/_layout.tsx.
export function useGroupWeekStatus(): GroupWeekStatus {
  const [state, setState] = useState<GroupWeekStatus>({
    groupId: null,
    myUserId: null,
    weekStatus: null,
    deadlockFinalistIds: null,
    deadlockDeadline: null,
    loading: true,
  });

  const load = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const { data: appUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single();
    if (!appUser) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", appUser.id)
      .limit(1)
      .single();
    if (!membership) {
      setState((s) => ({ ...s, loading: false, myUserId: appUser.id }));
      return;
    }

    const { data: group } = await supabase
      .from("groups")
      .select("id, week_status, deadlock_finalist_ids, deadlock_deadline")
      .eq("id", membership.group_id)
      .single();
    if (!group) {
      setState((s) => ({ ...s, loading: false, myUserId: appUser.id }));
      return;
    }

    setState({
      groupId: group.id,
      myUserId: appUser.id,
      weekStatus: group.week_status,
      deadlockFinalistIds: group.deadlock_finalist_ids,
      deadlockDeadline: group.deadlock_deadline,
      loading: false,
    });
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("group-week-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return state;
}
