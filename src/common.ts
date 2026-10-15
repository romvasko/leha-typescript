import type { LngLatBounds } from '@yandex/ymaps3-types';

export interface MarkPropTypes {
    coordinates: [number, number];
    title: string;
    id: string;
}

export interface GroupPropTypes {
    groupName: string;
    color: string;
    id: string;
    marks: MarkPropTypes[];
}

export interface AddressPoint {
    id: string;
    address: string;
    lat: number;
    lng: number;
}

/** Случайная точка внутри bounds */
export function getRandomPointCoordinates(bounds: LngLatBounds): [number, number] {
    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lng = minLng + Math.random() * (maxLng - minLng);
    const lat = minLat + Math.random() * (maxLat - minLat);
    return [lng, lat];
}
