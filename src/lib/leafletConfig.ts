import L from 'leaflet';

// Fix for default marker icons in Next.js
// This is needed because Leaflet's default icon paths don't work with Next.js bundling
export function fixLeafletMarkerIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Default map center (Lagos, Nigeria)
export const DEFAULT_CENTER: L.LatLngExpression = [6.5244, 3.3792];
export const DEFAULT_ZOOM = 12;

// Nigerian bounds (approximate)
export const NIGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.2, 2.7], // Southwest corner
  [13.9, 14.7], // Northeast corner
];
