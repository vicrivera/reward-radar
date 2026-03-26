import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { fetchEvents, fetchAllMoatPoints } from "@/api";
import {
  detectRewardSignals,
  detectBurnSignals,
  detectUnstakeSignals,
  detectStreakSignals,
  createRankSnapshot,
} from "@/engine";
import { useRadarStore } from "@/stores/radarStore";
import { sendBrowserNotification, shouldNotify } from "@/utils";
import type { MoatEvent, RawMoatPoints, Signal, RankSnapshot } from "@/types";

// ─── Polling Intervals ──────────────────────────────────────────────────────

const EVENT_POLL_INTERVAL = 20_000; // 20s for events (real-time feel)
const POINTS_POLL_INTERVAL = 60_000; // 60s for points (slower changing)

// ─── Events Hook ────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery<MoatEvent[]>({
    queryKey: ["moat-events"],
    queryFn: fetchEvents,
    refetchInterval: EVENT_POLL_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: EVENT_POLL_INTERVAL / 2,
    refetchOnWindowFocus: true,
  });
}

// ─── Moat Points Hook ──────────────────────────────────────────────────────

export function useMoatPoints() {
  return useQuery<RawMoatPoints[]>({
    queryKey: ["moat-points"],
    queryFn: fetchAllMoatPoints,
    refetchInterval: POINTS_POLL_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: POINTS_POLL_INTERVAL / 2,
    refetchOnWindowFocus: true,
  });
}

// ─── Signal Processing Hook ─────────────────────────────────────────────────
// Runs signal detection whenever events or points data updates.

export function useSignalProcessor() {
  const { data: events } = useEvents();
  const { data: points } = useMoatPoints();

  const appendSignals = useRadarStore((s) => s.appendSignals);
  const lastSeenEventId = useRadarStore((s) => s.lastSeenEventId);
  const setLastSeenEventId = useRadarStore((s) => s.setLastSeenEventId);

  const processedRef = useRef(new Set<string>());
  const isFirstLoadRef = useRef(true);

  const fireAlerts = useCallback(
    (signals: Signal[]) => {
      for (const signal of signals) {
        if (shouldNotify(signal)) {
          sendBrowserNotification(signal);
        }
      }
    },
    []
  );

  // Process events into signals
  useEffect(() => {
    if (!events || events.length === 0) return;

    // Only process new events since last seen
    const newEvents = lastSeenEventId
      ? events.filter((e) => !processedRef.current.has(e.id))
      : events;

    if (newEvents.length === 0) return;

    // Build top-wallet set from points data
    const topWallets = new Set(
      (points ?? [])
        .slice(0, 20)
        .map((p) => p.address.toLowerCase())
    );

    // Run detectors
    const rewardSignals = detectRewardSignals(newEvents);
    const burnSignals = detectBurnSignals(newEvents);
    const unstakeSignals = detectUnstakeSignals(newEvents, topWallets);

    const allNewSignals = [...rewardSignals, ...burnSignals, ...unstakeSignals];

    if (allNewSignals.length > 0) {
      appendSignals(allNewSignals);

      // Only fire notifications on subsequent polls, not the initial batch
      if (!isFirstLoadRef.current) {
        fireAlerts(allNewSignals);
      }
    }

    // Mark as processed
    for (const event of newEvents) {
      processedRef.current.add(event.id);
    }

    if (events[0]) {
      setLastSeenEventId(events[0].id);
    }

    isFirstLoadRef.current = false;
  }, [events, points, lastSeenEventId, appendSignals, setLastSeenEventId, fireAlerts]);

  // Process points for streak detection
  // Using a ref to avoid re-render loops — writing snapshot to state
  // would trigger this same effect again since it's a dependency.
  const rankSnapshotRef = useRef<RankSnapshot | null>(null);

  useEffect(() => {
    if (!points || points.length === 0) return;

    const normalizedPoints = points.map((p) => ({
      rank: p.rank,
      address: p.address,
      username: p.username,
      points: Number(p.points),
      weight: p.weight,
    }));

    const streakSignals = detectStreakSignals(rankSnapshotRef.current, normalizedPoints, events ?? []);

    if (streakSignals.length > 0) {
      appendSignals(streakSignals);
      fireAlerts(streakSignals);
    }

    rankSnapshotRef.current = createRankSnapshot(normalizedPoints);
  }, [points, appendSignals, fireAlerts]);
}

// ─── Contract-Specific Points Hook ──────────────────────────────────────────

export function useMoatPointsForContract(contractAddress: string | undefined) {
  return useQuery<RawMoatPoints[]>({
    queryKey: ["moat-points", contractAddress],
    queryFn: () =>
      fetchAllMoatPoints().then((all) =>
        contractAddress ? all : all
      ),
    enabled: !!contractAddress,
    refetchInterval: POINTS_POLL_INTERVAL,
    staleTime: POINTS_POLL_INTERVAL / 2,
  });
}