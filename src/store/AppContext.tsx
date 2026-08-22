import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState } from '../data/types';
import { appReducer, type AppAction } from './reducer';
import SEED from '../data/seed';

const STORAGE_KEY = 'camp_mgmt_state_v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return {
        ...SEED,
        ...parsed,
        theme: parsed.theme || 'light',
        activeBrandName: parsed.activeBrandName || 'Burger King',
        isMobileMenuOpen: false,
      };
    }
  } catch {
    /* ignore */
  }
  return SEED;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ── Context ───────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  resetToSeed: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [state]);

  function resetToSeed() {
    dispatch({ type: 'RESET_STATE', payload: SEED });
  }

  return (
    <AppContext.Provider value={{ state, dispatch, resetToSeed }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}