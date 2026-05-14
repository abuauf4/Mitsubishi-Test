'use client';

import { useState, useEffect, useCallback } from 'react';
import { VehicleData } from '@/data/vehicles';

/**
 * Maps an API vehicle response (from Turso DB) to the VehicleData interface
 * used by VehicleDetailPage and VehicleCard components.
 */
export function mapApiVehicleToVehicleData(apiVehicle: any): VehicleData {
  // Get the image path from the DB
  let image = apiVehicle.imagePath || '/images/canter.png';

  // If the image is a proxy URL, add a cache-busting parameter using updatedAt
  // This ensures the browser fetches a fresh image when the vehicle is updated
  if (image.startsWith('/api/image?') && apiVehicle.updatedAt) {
    const separator = image.includes('&') ? '&' : '&';
    image = `${image}${separator}_t=${encodeURIComponent(apiVehicle.updatedAt)}`;
  }

  return {
    slug: apiVehicle.slug || '',
    name: apiVehicle.name || '',
    tagline: apiVehicle.tagline || '',
    category: apiVehicle.category || 'passenger',
    basePrice: apiVehicle.basePrice || '',
    image,
    payload: apiVehicle.payload || undefined,
    specsShort: Array.isArray(apiVehicle.specsShort)
      ? apiVehicle.specsShort
      : typeof apiVehicle.specsShort === 'string'
        ? JSON.parse(apiVehicle.specsShort || '[]')
        : [],
    colors: (apiVehicle.colors || []).map((c: any) => ({
      name: c.name || '',
      hex: c.hex || '#000000',
      image: c.imagePath || undefined,
    })),
    variants: (apiVehicle.variants || []).map((v: any) => ({
      name: v.name || '',
      price: v.price || '',
      priceNum: Number(v.priceNum) || 0,
      transmission: v.transmission || '',
      drivetrain: v.drivetrain || undefined,
      image: v.imagePath || undefined,
      highlights: Array.isArray(v.highlights)
        ? v.highlights
        : typeof v.highlights === 'string'
          ? JSON.parse(v.highlights || '[]')
          : [],
    })),
    specs: (apiVehicle.specs || []).map((s: any) => ({
      category: s.category || '',
      items: Array.isArray(s.items)
        ? s.items
        : typeof s.items === 'string'
          ? JSON.parse(s.items || '[]')
          : [],
    })),
    features: (apiVehicle.features || []).map((f: any) => ({
      icon: f.icon || 'Star',
      title: f.title || '',
      description: f.description || '',
    })),
  };
}

/**
 * Hook to fetch vehicles from the API (Turso DB) with static data fallback.
 * Returns the mapped VehicleData[] array.
 */
export function useApiVehicles(
  category?: string,
  staticFallback?: VehicleData[]
) {
  const [vehicles, setVehicles] = useState<VehicleData[]>(staticFallback || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicles() {
      try {
        const url = category
          ? `/api/vehicles?category=${category}&_t=${Date.now()}`
          : `/api/vehicles?_t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0 && !cancelled) {
          setVehicles(data.map(mapApiVehicleToVehicleData));
        }
      } catch (error) {
        console.log('API fetch failed, using static fallback:', error);
        // Already initialized with staticFallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVehicles();
    return () => { cancelled = true; };
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return { vehicles, loading };
}

/**
 * Hook to fetch a single vehicle by slug from the API with static fallback.
 * Returns the mapped VehicleData or null.
 *
 * Includes a refresh function that can be called to force a re-fetch.
 */
export function useApiVehicle(
  slug: string,
  staticFallback?: VehicleData | null
) {
  const [vehicle, setVehicle] = useState<VehicleData | null>(staticFallback ?? null);
  const [loading, setLoading] = useState(true);

  const fetchVehicle = useCallback(async () => {
    try {
      // Add timestamp cache buster to force fresh data from the server
      const res = await fetch(`/api/vehicles/${slug}?_t=${Date.now()}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();

      if (data) {
        setVehicle(mapApiVehicleToVehicleData(data));
      }
    } catch (error) {
      console.log('API fetch failed, using static fallback:', error);
      // Already initialized with staticFallback
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    fetchVehicle();
  }, [fetchVehicle]);

  return { vehicle, loading, refresh: fetchVehicle };
}
