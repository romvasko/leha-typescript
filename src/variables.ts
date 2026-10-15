import type { LngLatBounds, YMapLocationRequest } from '@yandex/ymaps3-types';
import type { GroupPropTypes, AddressPoint } from './common';
import { addresses } from './addresses.js';

/** Города и их цвета */
const CITY_KEYS: Array<{ key: string; name: string; color: string }> = [
    { key: 'Барановичи,',       name: 'Барановичи',       color: '#E53935' },  // красный
    { key: 'Барановичский р-н', name: 'Барановичский р-н', color: '#8E24AA' },  // фиолетовый
    { key: 'Ляховичи,',         name: 'Ляховичи',         color: '#FB8C00' },  // оранжевый
    { key: 'Слоним,',           name: 'Слоним',           color: '#1E88E5' }   // синий
];

function detectCity(address: string): { name: string; color: string } {
    const found = CITY_KEYS.find(({ key }) => address.startsWith(key));
    return found ?? { name: 'Другое', color: '#43A047' };  // зелёный для «прочего»
}

function stripCity(address: string): string {
    // Убираем всё до первой запятой включительно (это город)
    const commaIndex = address.indexOf(',');
    if (commaIndex === -1) return address.trim();
    return address.slice(commaIndex + 1).trim();
}

function buildGroups(points: AddressPoint[]): GroupPropTypes[] {
    const map = new Map<string, GroupPropTypes>();

    points.forEach((point) => {
        const { name, color } = detectCity(point.address);

        if (!map.has(name)) {
            map.set(name, {
                groupName: name,
                color,
                id: String(map.size + 1),
                marks: []
            });
        }

        map.get(name)!.marks.push({
            coordinates: [point.lng, point.lat],
            title: `${point.id}`,
            id: point.id
        });
    });

    return Array.from(map.values());
}

export const groupsProps: Array<GroupPropTypes> = buildGroups(
    [...addresses].sort((a, b) => Number(a.id) - Number(b.id))
);

export const BOUNDS: LngLatBounds = [
    [25.28, 53.04],   // юго-запад
    [26.36, 53.16]    // северо-восток
];

export const LOCATION: YMapLocationRequest = {
    bounds: BOUNDS
};
