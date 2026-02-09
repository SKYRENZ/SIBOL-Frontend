import {
  bbox as turfBbox,
  featureCollection,
  point as turfPoint,
  voronoi as turfVoronoi,
  intersect as turfIntersect,
} from '@turf/turf';

type LngLat = [number, number];

type GeoJSONGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

type GeoJSONFeature = {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties?: Record<string, any>;
};

type BoundaryGeoJSON = GeoJSONFeature | { type: 'FeatureCollection'; features: GeoJSONFeature[] };

const toFeatureArray = (boundary: BoundaryGeoJSON): GeoJSONFeature[] => {
  if ((boundary as any).type === 'FeatureCollection') {
    return ((boundary as any).features || []).filter(Boolean);
  }
  return boundary ? [boundary as GeoJSONFeature] : [];
};

const forEachCoordinate = (geometry: GeoJSONGeometry, cb: (lng: number, lat: number) => void) => {
  if (geometry.type === 'Polygon') {
    (geometry.coordinates as number[][][]).forEach((ring) => {
      ring.forEach(([lng, lat]) => cb(lng, lat));
    });
    return;
  }
  (geometry.coordinates as number[][][][]).forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([lng, lat]) => cb(lng, lat));
    });
  });
};

export const getGeoJSONBounds = (boundary: BoundaryGeoJSON | null) => {
  if (!boundary) return null;
  const features = toFeatureArray(boundary);
  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  features.forEach((feature) => {
    if (!feature?.geometry) return;
    forEachCoordinate(feature.geometry, (lng, lat) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
  });

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
};

export const isPointInRing = (point: LngLat, ring: LngLat[]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = (yi > point[1]) !== (yj > point[1]) &&
      point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const isPointInPolygon = (point: LngLat, polygon: LngLat[][]) => {
  if (!polygon.length) return false;
  const [outer, ...holes] = polygon;
  if (!isPointInRing(point, outer)) return false;
  for (const hole of holes) {
    if (isPointInRing(point, hole)) return false;
  }
  return true;
};

export const isPointInBoundary = (point: LngLat, boundary: BoundaryGeoJSON | null) => {
  if (!boundary) return false;
  const features = toFeatureArray(boundary);
  return features.some((feature) => {
    const geom = feature?.geometry;
    if (!geom) return false;
    if (geom.type === 'Polygon') {
      return isPointInPolygon(point, geom.coordinates as LngLat[][]);
    }
    if (geom.type === 'MultiPolygon') {
      return (geom.coordinates as LngLat[][][]).some((poly) => isPointInPolygon(point, poly));
    }
    return false;
  });
};

export const buildGridFeatures = (
  boundary: BoundaryGeoJSON | null,
  labels: string[],
  options?: { padding?: number }
) => {
  if (!boundary || !labels.length) return [] as GeoJSONFeature[];
  const bounds = getGeoJSONBounds(boundary);
  if (!bounds) return [] as GeoJSONFeature[];

  const { minLng, minLat, maxLng, maxLat } = bounds;
  const count = labels.length;
  const rows = Math.ceil(Math.sqrt(count));
  const cols = Math.ceil(count / rows);
  const latStep = (maxLat - minLat) / rows;
  const lngStep = (maxLng - minLng) / cols;
  const padding = Math.min(Math.max(options?.padding ?? 0.08, 0), 0.45);

  const allCells: { coords: number[][][]; centroid: LngLat }[] = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const rawMinLat = minLat + r * latStep;
      const rawMaxLat = minLat + (r + 1) * latStep;
      const rawMinLng = minLng + c * lngStep;
      const rawMaxLng = minLng + (c + 1) * lngStep;

      const padLat = (rawMaxLat - rawMinLat) * padding;
      const padLng = (rawMaxLng - rawMinLng) * padding;

      const cellMinLat = rawMinLat + padLat;
      const cellMaxLat = rawMaxLat - padLat;
      const cellMinLng = rawMinLng + padLng;
      const cellMaxLng = rawMaxLng - padLng;

      const centroid: LngLat = [(cellMinLng + cellMaxLng) / 2, (cellMinLat + cellMaxLat) / 2];

      const coords = [
        [
          [cellMinLng, cellMinLat],
          [cellMaxLng, cellMinLat],
          [cellMaxLng, cellMaxLat],
          [cellMinLng, cellMaxLat],
          [cellMinLng, cellMinLat],
        ],
      ];

      allCells.push({ coords, centroid });
    }
  }

  const insideCells = allCells.filter((cell) => isPointInBoundary(cell.centroid, boundary));
  const chosenCells = [...insideCells];

  if (chosenCells.length < labels.length) {
    for (const cell of allCells) {
      if (chosenCells.length >= labels.length) break;
      if (!chosenCells.includes(cell)) chosenCells.push(cell);
    }
  }

  return labels.slice(0, chosenCells.length).map((label, index) => ({
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: chosenCells[index].coords },
    properties: { label },
  }));
};

const seededRandom = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const distance = (a: LngLat, b: LngLat) => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
};

const generatePointsInside = (boundary: BoundaryGeoJSON, count: number, seed = 1) => {
  const bounds = getGeoJSONBounds(boundary);
  if (!bounds) return [] as LngLat[];
  const rng = seededRandom(seed);
  const points: LngLat[] = [];
  const { minLng, minLat, maxLng, maxLat } = bounds;
  const maxAttempts = count * 30;
  let attempts = 0;

  while (points.length < count && attempts < maxAttempts) {
    attempts += 1;
    const lng = minLng + (maxLng - minLng) * rng();
    const lat = minLat + (maxLat - minLat) * rng();
    if (isPointInBoundary([lng, lat], boundary)) {
      points.push([lng, lat]);
    }
  }

  return points;
};

const kMeans = (points: LngLat[], k: number, seed = 1, iterations = 12) => {
  if (!points.length || k <= 0) return [] as LngLat[];
  const rng = seededRandom(seed);
  const centroids: LngLat[] = [];

  const shuffled = [...points].sort(() => rng() - 0.5);
  for (let i = 0; i < k; i += 1) {
    centroids.push(shuffled[i % shuffled.length]);
  }

  for (let iter = 0; iter < iterations; iter += 1) {
    const clusters: LngLat[][] = Array.from({ length: k }, () => []);
    points.forEach((point) => {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      centroids.forEach((center, idx) => {
        const d = distance(point, center);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = idx;
        }
      });
      clusters[bestIndex].push(point);
    });

    clusters.forEach((cluster, idx) => {
      if (!cluster.length) return;
      const sum = cluster.reduce(
        (acc, p) => [acc[0] + p[0], acc[1] + p[1]] as LngLat,
        [0, 0]
      );
      centroids[idx] = [sum[0] / cluster.length, sum[1] / cluster.length];
    });
  }

  return centroids;
};

const makeBlobPolygon = (
  center: LngLat,
  boundary: BoundaryGeoJSON,
  baseRadius: number,
  seed: number,
  steps = 20
) => {
  const rng = seededRandom(seed);
  const coords: LngLat[] = [];

  for (let i = 0; i < steps; i += 1) {
    const angle = (Math.PI * 2 * i) / steps;
    const jitter = 0.8 + rng() * 0.3;
    let radius = baseRadius * jitter;
    let lng = center[0] + Math.cos(angle) * radius;
    let lat = center[1] + Math.sin(angle) * radius;

    let shrinkAttempts = 0;
    while (!isPointInBoundary([lng, lat], boundary) && shrinkAttempts < 14) {
      radius *= 0.85;
      lng = center[0] + Math.cos(angle) * radius;
      lat = center[1] + Math.sin(angle) * radius;
      shrinkAttempts += 1;
    }

    coords.push([lng, lat]);
  }

  coords.push(coords[0]);
  return coords;
};

export const buildOrganicPackageFeatures = (
  boundary: BoundaryGeoJSON | null,
  labels: string[],
  options?: { seed?: number; density?: number }
) => {
  if (!boundary || !labels.length) return [] as GeoJSONFeature[];

  const seed = options?.seed ?? 176;
  const sampleCount = Math.max(labels.length * (options?.density ?? 50), 200);
  const points = generatePointsInside(boundary, sampleCount, seed);
  if (!points.length) return [] as GeoJSONFeature[];

  const centroids = kMeans(points, labels.length, seed, 10);
  if (!centroids.length) return [] as GeoJSONFeature[];

  const sortedCentroids = [...centroids].sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
  const features: GeoJSONFeature[] = [];

  sortedCentroids.forEach((center, index) => {
    const distances = sortedCentroids
      .filter((c) => c !== center)
      .map((c) => distance(center, c));
    const nearest = distances.length ? Math.min(...distances) : 0.003;
    const radius = nearest ? nearest * 0.48 : 0.003;
    const blob = makeBlobPolygon(center, boundary, radius, seed + index * 31, 22);
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [blob] },
      properties: { label: labels[index] },
    });
  });

  return features;
};

const getBoundaryFeature = (boundary: BoundaryGeoJSON | null): GeoJSONFeature | null => {
  if (!boundary) return null;
  if ((boundary as any).type === 'Feature') return boundary as GeoJSONFeature;
  if ((boundary as any).type === 'FeatureCollection') {
    const features = (boundary as any).features || [];
    return features[0] ?? null;
  }
  return null;
};

export const buildVoronoiPackageFeatures = (
  boundary: BoundaryGeoJSON | null,
  labels: string[],
  options?: { seed?: number; density?: number }
) => {
  if (!boundary || !labels.length) return [] as GeoJSONFeature[];
  const boundaryFeature = getBoundaryFeature(boundary);
  if (!boundaryFeature) return [] as GeoJSONFeature[];

  const seed = options?.seed ?? 176;
  const points = generatePointsInside(boundary, labels.length, seed);
  if (points.length < labels.length) return [] as GeoJSONFeature[];

  const turfPoints = featureCollection(points.map((p) => turfPoint(p)));
  const bbox = turfBbox(boundaryFeature as any) as [number, number, number, number];
  const voronoiPolys = turfVoronoi(turfPoints, { bbox });
  if (!voronoiPolys?.features?.length) return [] as GeoJSONFeature[];

  const clipped = voronoiPolys.features
    .map((cell, index) => {
      if (!cell) return null;
      const clippedCell = turfIntersect(featureCollection([cell as any, boundaryFeature as any]) as any);
      if (!clippedCell || !clippedCell.geometry) return null;
      return {
        type: 'Feature',
        geometry: clippedCell.geometry as GeoJSONGeometry,
        properties: { label: labels[index] },
      } as GeoJSONFeature;
    })
    .filter(Boolean) as GeoJSONFeature[];

  if (clipped.length !== labels.length) {
    return [] as GeoJSONFeature[];
  }

  return clipped;
};
