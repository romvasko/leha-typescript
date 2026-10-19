import { GroupPropTypes } from './common.js';
import { LOCATION, buildGroupsForDay } from './variables.js';

declare global {
    interface Window {
        map: any;
    }
}

window.map = null;

type MarkersState = Record<string, Record<string, any>>;

main();

async function main() {
    await ymaps3.ready;

    const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapControls,
        YMapControl,
        YMapGroupEntity
    } = ymaps3;

    // Регистрируем CDN для пакета с UI-компонентами
    ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest');

    // @ts-expect-error — типы ymaps3.import не знают про default-ui-theme
    const { YMapDefaultMarker } = await ymaps3.import('@yandex/ymaps3-default-ui-theme');

    // Глобальное состояние для всех маркеров
    const markersState: MarkersState = {};

    function focusOnPoint(lng: number, lat: number) {
        window.map.setLocation({
            center: [lng, lat],
            zoom: 14,
            duration: 500
        });
    }

    class CustomMenuControl extends YMapGroupEntity<{}> {
        private _element?: HTMLDivElement;
        private _container?: HTMLDivElement;
        private _detachDom?: () => void;
        private _currentGroups: GroupPropTypes[] = [];

        protected _onAttach() {
            this._createMenu();
        }

        _createMenu() {
            // 👇 ОБЁРТКА — держит и кнопку, и меню
            this._element = document.createElement('div');
            this._element.classList.add('menu-wrapper');

            // Кнопка-переключатель — СНАРУЖИ сворачиваемого блока
            const toggleButton = document.createElement('button');
            toggleButton.classList.add('menu-toggle');
            toggleButton.type = 'button';
            toggleButton.textContent = '☰';
            toggleButton.title = 'Скрыть / показать меню';
            this._element.appendChild(toggleButton);

            // Сворачиваемый блок меню
            const menuBody = document.createElement('div');
            menuBody.classList.add('menu');
            this._element.appendChild(menuBody);

            // Обработчик клика — сворачивает menuBody, кнопка остаётся на месте
            toggleButton.addEventListener('click', () => {
                const isHidden = menuBody.classList.toggle('menu--hidden');
                toggleButton.textContent = isHidden ? '☰' : '×';
            });

            // Заголовок — внутрь menuBody
            const titleElement = document.createElement('div');
            titleElement.textContent = 'График работы';
            titleElement.classList.add('menu__title');
            menuBody.appendChild(titleElement);

            // 👇 Выпадающий список дней недели
            const daySelector = document.createElement('select');
            daySelector.classList.add('menu-day-selector');
            daySelector.innerHTML = `
                <option value="monday">Понедельник</option>
                <option value="all">Все дни</option>
            `;
            menuBody.appendChild(daySelector);

            // Контейнер для групп
            this._container = document.createElement('div');
            this._container.classList.add('container');
            menuBody.appendChild(this._container);

            // 👇 Обработчик смены дня
            daySelector.addEventListener('change', (e) => {
                const selectedDay = (e.target as HTMLSelectElement).value;

                // 1. Удаляем старые маркеры с карты
                this._clearAllMarkers();

                // 2. Очищаем контейнер меню
                this._container!.innerHTML = '';

                // 3. Получаем новые данные и рисуем
                this._currentGroups = buildGroupsForDay(selectedDay);
                this._renderGroups(this._currentGroups);
            });

            // 👇 Первичная отрисовка (по умолчанию Понедельник)
            this._currentGroups = buildGroupsForDay('monday');
            this._renderGroups(this._currentGroups);

            // Регистрируем DOM-контекст на обёртке
            this._detachDom = ymaps3.useDomContext(this, this._element, this._element);
        }

        // 👇 Метод для полной очистки маркеров с карты
        _clearAllMarkers() {
            Object.values(markersState).forEach(group => {
                Object.values(group).forEach(marker => {
                    if (marker) window.map.removeChild(marker);
                });
            });
            // Очищаем объект состояния
            for (const key in markersState) delete markersState[key];
        }

        // 👇 Метод отрисовки меню и добавления маркеров
        _renderGroups(groups: GroupPropTypes[]) {
            groups.forEach((group) => {
                // Инициализируем состояние для группы
                if (!markersState[group.id]) markersState[group.id] = {};

                const divElement = document.createElement('div');
                const innerDivElement = document.createElement('div');
                innerDivElement.classList.add('menu__checkbox');

                const inputElement = document.createElement('input');
                inputElement.style.backgroundColor = group.color;
                inputElement.classList.add('menu__checkbox_input', `parent-${group.id}`);
                inputElement.type = 'checkbox';
                inputElement.id = group.id;
                inputElement.checked = true;

                inputElement.addEventListener('change', (event) => {
                    const checked = (event.target as HTMLInputElement).checked;

                    const childCheckboxes = divElement.querySelectorAll<HTMLInputElement>('.child-mark');
                    childCheckboxes.forEach((cb) => (cb.checked = checked));

                    if (checked) {
                        Object.entries(markersState[group.id]).forEach(([id]) => {
                            const markerInfo = group.marks.find((item) => item.id === id);
                            if (!markerInfo) return;

                            // Если маркер уже есть (не был удален), пропускаем, иначе создаем
                            if (!markersState[group.id][id]) {
                                const newMarker = new YMapDefaultMarker({
                                    coordinates: markerInfo.coordinates,
                                    iconName: 'fallback',
                                    size: 'small',
                                    title: markerInfo.title,
                                    color: { day: group.color, night: group.color } as any,
                                    draggable: false
                                } as any);
                                markersState[group.id][id] = newMarker;
                                window.map.addChild(newMarker);
                            }
                        });
                    } else {
                        Object.values(markersState[group.id]).forEach((marker) => {
                            if (marker) window.map.removeChild(marker);
                        });
                        // Не удаляем ключи, а просто ставим null, чтобы можно было вернуть
                        Object.keys(markersState[group.id]).forEach(key => {
                            markersState[group.id][key] = null;
                        });
                    }
                });

                const labelElement = document.createElement('label');
                labelElement.classList.add('menu__checkbox_title');
                labelElement.textContent = group.groupName;

                innerDivElement.appendChild(inputElement);
                innerDivElement.appendChild(labelElement);
                divElement.appendChild(innerDivElement);

                group.marks.forEach((mark) => {
                    const markDivElement = document.createElement('div');
                    markDivElement.style.marginLeft = '28px';
                    markDivElement.classList.add('menu__checkbox');

                    const markInputElement = document.createElement('input');
                    markInputElement.classList.add('menu__checkbox_input', 'child-mark');
                    markInputElement.style.backgroundColor = group.color;
                    markInputElement.type = 'checkbox';
                    markInputElement.checked = true;

                    markInputElement.addEventListener('change', (event) => {
                        const checked = (event.target as HTMLInputElement).checked;

                        if (checked) {
                            const parent = divElement.querySelector<HTMLInputElement>(`.parent-${group.id}`);
                            if (parent) parent.checked = true;

                            if (!markersState[group.id][mark.id]) {
                                const newMarker = new YMapDefaultMarker({
                                    coordinates: mark.coordinates,
                                    iconName: 'fallback',
                                    size: 'small',
                                    title: mark.title,
                                    color: { day: group.color, night: group.color } as any,
                                    draggable: false
                                } as any);
                                markersState[group.id][mark.id] = newMarker;
                                window.map.addChild(newMarker);
                            }
                        } else {
                            if (markersState[group.id][mark.id]) {
                                window.map.removeChild(markersState[group.id][mark.id]);
                                markersState[group.id][mark.id] = null;
                            }
                        }

                        const markers = Object.values(markersState[group.id]);
                        const anyChecked = markers.some((marker) => marker !== null);
                        const parent = divElement.querySelector<HTMLInputElement>(`.parent-${group.id}`);
                        if (parent) parent.checked = anyChecked;
                    });

                    const markLabelElement = document.createElement('label');
                    markLabelElement.classList.add('menu__checkbox_title');
                    markLabelElement.textContent = mark.title;

                    // 👇 Клик по названию центрирует карту
                    markLabelElement.style.cursor = 'pointer';
                    markLabelElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        const [lng, lat] = mark.coordinates;
                        focusOnPoint(lng, lat);
                    });

                    markDivElement.appendChild(markInputElement);
                    markDivElement.appendChild(markLabelElement);
                    divElement.appendChild(markDivElement);
                });

                this._container!.appendChild(divElement);
            });

            // 👇 После отрисовки меню добавляем все маркеры на карту
            this._currentGroups.forEach((group) => {
                group.marks.forEach((mark) => {
                    const newMarker = new YMapDefaultMarker({
                        coordinates: mark.coordinates,
                        iconName: 'fallback',
                        size: 'small',
                        title: mark.title,
                        color: { day: group.color, night: group.color } as any,
                        draggable: false
                    } as any);
                    markersState[group.id][mark.id] = newMarker;
                    window.map.addChild(newMarker);
                });
            });
        }

        protected _onDetach(): void {
            this._detachDom?.();
            this._detachDom = undefined;
            this._element = undefined;
            this._container = undefined;
        }
    }

    const controls = new YMapControls({
        position: 'top right',
        orientation: 'vertical'
    });
    const control = new YMapControl({});
    control.addChild(new CustomMenuControl({}));
    controls.addChild(control);

    window.map = new YMap(
        document.getElementById('app')!,
        { location: LOCATION, showScaleInCopyrights: true, behaviors: ['drag', 'pinchZoom', 'scrollZoom'] },
        [
            new YMapDefaultSchemeLayer({
                customization: [
                    {
                        tags: { any: ['poi'] },
                        elements: 'label.icon',
                        stylers: [{ opacity: 0 }]
                    },
                    {
                        tags: { any: ['poi'] },
                        elements: 'label.text.fill',
                        stylers: [{ opacity: 0 }]
                    },
                    {
                        tags: { any: ['street'] },
                        elements: 'label',
                        stylers: [{ opacity: 0 }]
                    }
                ]
            }),
            new YMapDefaultFeaturesLayer({}),
            controls
        ]
    );
}
