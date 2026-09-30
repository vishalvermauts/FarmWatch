import { Coordinate } from '../types/farmwatch';

// Radius of Earth in meters
const EARTH_RADIUS_METERS = 6378137;

/**
 * Calculates geodesic area of a polygon defined by WGS84 coordinates in hectares.
 * Uses the spherical polygon excess algorithm.
 */
export function calculateGeodesicAreaHa(coords: Coordinate[]): number {
  if (!coords || coords.length < 3) return 0;

  let totalArea = 0;
  const numPoints = coords.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % numPoints];

    const lambda1 = (p1.lng * Math.PI) / 180;
    const lambda2 = (p2.lng * Math.PI) / 180;
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;

    // Spherical trapezoid area
    totalArea += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  totalArea = (Math.abs(totalArea) * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 4.0;
  
  // Convert square meters to hectares (1 ha = 10,000 m²)
  const areaHa = totalArea / 10000;
  return Number(areaHa.toFixed(3));
}

/**
 * Export coordinates as standard GeoJSON Feature (Polygon)
 */
export function toGeoJSONFeature(coords: Coordinate[], properties: Record<string, any> = {}) {
  // Ensure closed ring
  const ring = coords.map(c => [c.lng, c.lat]);
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }

  return {
    type: 'Feature',
    properties: {
      ...properties,
      areaHa: calculateGeodesicAreaHa(coords),
      generatedAt: new Date().toISOString(),
    },
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  };
}

/**
 * Parse GeoJSON Polygon coordinates safely
 */
export function parseGeoJSON(rawText: string): Coordinate[] | null {
  try {
    const parsed = JSON.parse(rawText);
    let coordsArray: number[][] = [];

    if (parsed.type === 'FeatureCollection' && parsed.features?.[0]?.geometry?.coordinates) {
      coordsArray = parsed.features[0].geometry.coordinates[0];
    } else if (parsed.type === 'Feature' && parsed.geometry?.coordinates) {
      coordsArray = parsed.geometry.coordinates[0];
    } else if (parsed.type === 'Polygon' && parsed.coordinates) {
      coordsArray = parsed.coordinates[0];
    }

    if (!Array.isArray(coordsArray) || coordsArray.length < 3) {
      return null;
    }

    // Convert to Coordinate array, stripping duplicate closure if present
    const coords: Coordinate[] = coordsArray
      .filter(item => Array.isArray(item) && item.length >= 2 && !isNaN(item[0]) && !isNaN(item[1]))
      .map(item => ({ lng: Number(item[0]), lat: Number(item[1]) }));

    // Remove matching closing point if same as first
    if (coords.length > 3) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (Math.abs(first.lng - last.lng) < 1e-6 && Math.abs(first.lat - last.lat) < 1e-6) {
        coords.pop();
      }
    }

    return coords.length >= 3 ? coords : null;
  } catch (err) {
    return null;
  }
}

/**
 * Computes bounding box for centering and scaling SVG map
 */
export function getBoundingBox(coords: Coordinate[]) {
  if (!coords || coords.length === 0) {
    return { minLng: 73.78, maxLng: 73.79, minLat: 19.99, maxLat: 20.00 };
  }

  let minLng = coords[0].lng;
  let maxLng = coords[0].lng;
  let minLat = coords[0].lat;
  let maxLat = coords[0].lat;

  for (const c of coords) {
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
  }

  return { minLng, maxLng, minLat, maxLat };
}
