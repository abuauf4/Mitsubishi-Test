'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { proxyBlobUrl } from '@/lib/image-utils';

/** Shape of a single config row from the DB */
export interface SiteConfigItem {
  id: string;
  key: string;
  value: string;
  type: string;
  page: string;
}

/** Convenience type: a map of key → value for quick lookups */
export type SiteConfigMap = Record<string, string>;

/** The context value */
interface SiteConfigContextValue {
  /** Raw array from DB / static fallback */
  items: SiteConfigItem[];
  /** Quick lookup map: key → value */
  map: SiteConfigMap;
  /** Helper: get the displayable URL for a config key (runs proxyBlobUrl) */
  getUrl: (key: string, fallback?: string) => string | undefined;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

/** Provider — wraps children and makes site config available everywhere */
export function SiteConfigProvider({
  items,
  children,
}: {
  items: SiteConfigItem[];
  children: ReactNode;
}) {
  const value = useMemo<SiteConfigContextValue>(() => {
    const map: SiteConfigMap = {};
    for (const item of items) {
      if (item.key && item.value) {
        map[item.key] = item.value;
      }
    }

    const getUrl = (key: string, fallback?: string): string | undefined => {
      const raw = map[key];
      if (!raw) return fallback ? proxyBlobUrl(fallback) || fallback : undefined;
      return proxyBlobUrl(raw) || raw;
    };

    return { items, map, getUrl };
  }, [items]);

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

/** Hook — consume site config from any client component */
export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    // Return a safe fallback if used outside the provider
    return {
      items: [],
      map: {} as SiteConfigMap,
      getUrl: (_key: string, fallback?: string) => fallback,
    };
  }
  return ctx;
}
