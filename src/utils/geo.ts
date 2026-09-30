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

/**
 * Automatically sorts polygon coordinates clockwise around their centroid.
 * This instantly untangles crossed/self-intersecting bowtie shapes (like irregular vertex placement)
 * into a clean, simple, non-self-intersecting closed boundary polygon.
 */
export function sortPolygonClockwise(coords: Coordinate[]): Coordinate[] {
  if (!coords || coords.length < 3) return coords;

  const centroid = coords.reduce(
    (acc, c) => ({ lng: acc.lng + c.lng / coords.length, lat: acc.lat + c.lat / coords.length }),
    { lng: 0, lat: 0 }
  );

  return [...coords].sort((a, b) => {
    const angleA = Math.atan2(a.lat - centroid.lat, a.lng - centroid.lng);
    const angleB = Math.atan2(b.lat - centroid.lat, b.lng - centroid.lng);
    // Clockwise order
    return angleB - angleA;
  });
}

/**
 * Generates an agricultural field boundary polygon centered at (centerLng, centerLat).
 * @param centerLng Center longitude
 * @param centerLat Center latitude
 * @param shape 'square' | 'rect' | 'circle'
 * @param areaHa Target area in hectares (default 1.0 ha)
 */
export function generatePresetPolygon(
  centerLng: number,
  centerLat: number,
  shape: 'square' | 'rect' | 'circle' = 'square',
  areaHa: number = 1.0
): Coordinate[] {
  const areaM2 = Math.max(0.1, areaHa) * 10000;
  const latRad = (centerLat * Math.PI) / 180;
  const metersPerDegLat = 111139;
  const metersPerDegLng = 111139 * Math.cos(latRad);

  if (shape === 'square') {
    const side = Math.sqrt(areaM2);
    const dLat = (side / 2) / metersPerDegLat;
    const dLng = (side / 2) / metersPerDegLng;
    return [
      { lng: Number((centerLng - dLng).toFixed(6)), lat: Number((centerLat - dLat).toFixed(6)) },
      { lng: Number((centerLng + dLng).toFixed(6)), lat: Number((centerLat - dLat).toFixed(6)) },
      { lng: Number((centerLng + dLng).toFixed(6)), lat: Number((centerLat + dLat).toFixed(6)) },
      { lng: Number((centerLng - dLng).toFixed(6)), lat: Number((centerLat + dLat).toFixed(6)) },
    ];
  }

  if (shape === 'rect') {
    // 2:1 ratio
    const width = Math.sqrt(areaM2 * 2);
    const height = areaM2 / width;
    const dLat = (height / 2) / metersPerDegLat;
    const dLng = (width / 2) / metersPerDegLng;
    return [
      { lng: Number((centerLng - dLng).toFixed(6)), lat: Number((centerLat - dLat).toFixed(6)) },
      { lng: Number((centerLng + dLng).toFixed(6)), lat: Number((centerLat - dLat).toFixed(6)) },
      { lng: Number((centerLng + dLng).toFixed(6)), lat: Number((centerLat + dLat).toFixed(6)) },
      { lng: Number((centerLng - dLng).toFixed(6)), lat: Number((centerLat + dLat).toFixed(6)) },
    ];
  }

  // Circle (approximated with 8 nodes for agricultural pivot irrigation)
  const radius = Math.sqrt(areaM2 / Math.PI);
  const points: Coordinate[] = [];
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const theta = (i * 2 * Math.PI) / segments;
    const dLng = (radius * Math.cos(theta)) / metersPerDegLng;
    const dLat = (radius * Math.sin(theta)) / metersPerDegLat;
    points.push({
      lng: Number((centerLng + dLng).toFixed(6)),
      lat: Number((centerLat + dLat).toFixed(6)),
    });
  }
  return points;
}

/**
 * Web Mercator Tile calculation for high-resolution satellite imagery
 */
export function lngToTileX(lng: number, zoom: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

export function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

export function tileXToLng(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

export function tileYToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export interface SatelliteTileInfo {
  x: number;
  y: number;
  z: number;
  url: string;
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

/**
 * Computes list of standard Web Mercator satellite imagery tiles covering the bounding box
 * Guaranteed full 2D coverage across the entire viewport without cut-offs
 */
export function getSatelliteTiles(
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number,
  zoom: number = 16
): SatelliteTileInfo[] {
  let safeZoom = Math.min(18, Math.max(12, zoom));

  // Determine tile span with 1-tile margin on all sides for seamless boundary panning
  let xMin = lngToTileX(minLng, safeZoom) - 1;
  let xMax = lngToTileX(maxLng, safeZoom) + 1;
  let yMin = latToTileY(maxLat, safeZoom) - 1;
  let yMax = latToTileY(minLat, safeZoom) + 1;

  // If the tile range exceeds 6x5, step down the zoom level by 1 so tiles are larger and cover the entire screen
  while ((xMax - xMin > 6 || yMax - yMin > 5) && safeZoom > 12) {
    safeZoom -= 1;
    xMin = lngToTileX(minLng, safeZoom) - 1;
    xMax = lngToTileX(maxLng, safeZoom) + 1;
    yMin = latToTileY(maxLat, safeZoom) - 1;
    yMax = latToTileY(minLat, safeZoom) + 1;
  }

  const tiles: SatelliteTileInfo[] = [];
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      const tileMinLng = tileXToLng(x, safeZoom);
      const tileMaxLng = tileXToLng(x + 1, safeZoom);
      const tileMaxLat = tileYToLat(y, safeZoom);
      const tileMinLat = tileYToLat(y + 1, safeZoom);

      tiles.push({
        x,
        y,
        z: safeZoom,
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${safeZoom}/${y}/${x}`,
        minLng: tileMinLng,
        maxLng: tileMaxLng,
        minLat: tileMinLat,
        maxLat: tileMaxLat,
      });
    }
  }

  return tiles;
}
