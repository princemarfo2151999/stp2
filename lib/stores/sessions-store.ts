"use client"

import { create } from "zustand"
import { type Session, type SessionStatus, mockSessions } from "@/lib/data/sessions"

interface SessionsState {
  sessions: Session[]
  isLoading: boolean
  error: string | null

  // Actions
  updateSessionStatus: (id: string, status: SessionStatus) => void
  getSession: (id: string) => Session | undefined
  getActiveSessions: () => Session[]
  getSessionsByStation: (stationId: string) => Session[]
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: mockSessions,
  isLoading: false,
  error: null,

  updateSessionStatus: (id, status) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              status,
              endTime:
                status === "completed" || status === "failed" || status === "refunded"
                  ? new Date().toISOString()
                  : session.endTime,
            }
          : session
      ),
    }))
  },

  getSession: (id) => {
    return get().sessions.find((session) => session.id === id)
  },

  getActiveSessions: () => {
    return get().sessions.filter(
      (session) =>
        session.status === "charging" ||
        session.status === "starting" ||
        session.status === "awaiting_plug" ||
        session.status === "awaiting_operator"
    )
  },

  getSessionsByStation: (stationId) => {
    return get().sessions.filter((session) => session.stationId === stationId)
  },
}))
