import { GroupPropTypes } from './common.js';
import { LOCATION, buildGroupsForDay } from './variables.js';
import { scheduleData, DayOfWeek } from './schedule.js';

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

    ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest');

    // @ts-expect-error — типы ymaps3.import не знают про default-ui-theme
    const { YMapDefaultMarker } = await ymaps3.import('@yandex/ymaps3-default-ui-theme');

    const markersState: MarkersState = {};

    // 👇 Функция для создания маркера (активного или неактивного)
    function createMarker(
        coordinates: [number, number],
        title: string,
        color: string,
        isActive: boolean
    ) {
        return new YMapDefaultMarker({
            coordinates,
            iconName: 'fallback',
            size: 'small',
            title,
            // Если неактивен — серый и полупрозрачный
            color: isActive
                ? { day: color, night: color }
                : { day: '#999999', night: '#999999' },
            opacity: isActive ? 1 : 0.5, // Полупрозрачность для неактивных
            draggable: false
        } as any);
    }

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

        // 👇 Обновленный метод инициализации (все маркеры активны по умолчанию)
        public initMarkersOnMap() {
            this._currentGroups.forEach((group) => {
                if (!markersState[group.id]) markersState[group.id] = {};

                group.marks.forEach((mark: any) => {
                    // 👇 Используем флаг активности из данных
                    const isActive = mark.isActive !== false;
                    const newMarker = createMarker(mark.coordinates, mark.title, group.color, isActive);
                    markersState[group.id][mark.id] = newMarker;
                    if (window.map) window.map.addChild(newMarker);
                });
            });
        }

        _createMenu() {
            this._element = document.createElement('div');
            this._element.classList.add('menu-wrapper');

            const toggleButton = document.createElement('button');
            toggleButton.classList.add('menu-toggle');
            toggleButton.type = 'button';
            toggleButton.textContent = '☰';
            this._element.appendChild(toggleButton);

            const menuBody = document.createElement('div');
            menuBody.classList.add('menu');
            this._element.appendChild(menuBody);

            toggleButton.addEventListener('click', () => {
                const isHidden = menuBody.classList.toggle('menu--hidden');
                toggleButton.textContent = isHidden ? '☰' : '×';
            });

            const titleElement = document.createElement('div');
            titleElement.textContent = 'График работы';
            titleElement.classList.add('menu__title');
            menuBody.appendChild(titleElement);

            const daySelector = document.createElement('select');
            daySelector.classList.add('menu-day-selector');
            daySelector.innerHTML = `
                <option value="monday">Понедельник</option>
                <option value="tuesday">Вторник</option>
                <option value="wednesday">Среда</option>
                <option value="thursday">Четверг</option>
                <option value="friday">Пятница</option>
                <option value="saturday">Суббота</option>
                <option value="sunday">Воскресенье</option>
                <option value="all">Все дни</option>
            `;
            menuBody.appendChild(daySelector);
            // ... после daySelector ...

            // 👇 Добавляем кнопку "Скрыть/Показать неотмеченные"
            const hideUncheckedBtn = document.createElement('button');
            hideUncheckedBtn.classList.add('menu-action-btn');
            hideUncheckedBtn.textContent = 'Скрыть неотмеченные';
            menuBody.appendChild(hideUncheckedBtn);

            // 👇 Обработчик-переключатель
            hideUncheckedBtn.addEventListener('click', () => {
                // Проверяем текущее состояние (по тексту кнопки)
                const isHiddenMode = hideUncheckedBtn.textContent === 'Скрыть неотмеченные';

                if (isHiddenMode) {
                    // РЕЖИМ СКРЫТИЯ
                    const uncheckedBoxes = this._container!.querySelectorAll<HTMLInputElement>('.child-mark:not(:checked)');

                    uncheckedBoxes.forEach((checkbox) => {
                        const groupId = checkbox.dataset.groupId;
                        const markId = checkbox.dataset.markId;

                        if (groupId && markId) {
                            const marker = markersState[groupId]?.[markId];
                            if (marker && window.map) {
                                window.map.removeChild(marker);
                                markersState[groupId][markId] = null; // Временно удаляем с карты
                            }
                        }
                    });

                    // Меняем текст кнопки
                    hideUncheckedBtn.textContent = 'Показать все';
                } else {
                    // РЕЖИМ ВОЗВРАТА
                    // Проходимся по всем группам и маркерам в текущем дне
                    this._currentGroups.forEach((group) => {
                        group.marks.forEach((mark: any) => {
                            const checkbox = this._container!.querySelector<HTMLInputElement>(`.child-mark[data-mark-id="${mark.id}"]`);

                            // Если чекбокс существует и он НЕ отмечен,
                            // значит этот маркер мы ранее скрыли (или он неактивен)
                            if (checkbox && !checkbox.checked) {
                                // Восстанавливаем маркер только если его нет на карте
                                if (!markersState[group.id]?.[mark.id]) {
                                    // Создаем СЕРЫЙ (неактивный) маркер, так как галочка снята
                                    const newMarker = createMarker(mark.coordinates, mark.title, group.color, false);
                                    markersState[group.id][mark.id] = newMarker;
                                    if (window.map) window.map.addChild(newMarker);
                                }
                            }
                        });
                    });

                    // Меняем текст кнопки
                    hideUncheckedBtn.textContent = 'Скрыть неотмеченные';
                }
            });
            // 👇 Определяем текущий день недели
            const daysMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayIndex = new Date().getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
            const currentDay = daysMap[todayIndex];

            this._container = document.createElement('div');
            this._container.classList.add('container');
            menuBody.appendChild(this._container);

            daySelector.addEventListener('change', (e) => {
                const selectedDay = (e.target as HTMLSelectElement).value;
                this._clearAllMarkers();
                this._container!.innerHTML = '';
                hideUncheckedBtn.textContent = 'Скрыть неотмеченные';
                this._currentGroups = buildGroupsForDay(selectedDay);
                this._renderGroups(this._currentGroups);
                if (window.map) this.initMarkersOnMap();
            });

            // Если для сегодняшнего дня нет данных, показываем все дни
            const hasDataForToday = scheduleData.some(s => s.day === currentDay);
            const initialDay = hasDataForToday ? currentDay : 'all';

            daySelector.value = initialDay;
            this._currentGroups = buildGroupsForDay(initialDay);
            this._renderGroups(this._currentGroups);

            this._detachDom = ymaps3.useDomContext(this, this._element, this._element);
        }

        _clearAllMarkers() {
            Object.values(markersState).forEach(group => {
                Object.values(group).forEach(marker => {
                    if (marker && window.map) window.map.removeChild(marker);
                });
            });
            for (const key in markersState) delete markersState[key];
        }

        public _renderGroups(groups: GroupPropTypes[]) {
            groups.forEach((group) => {
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

                // 👇 Обработчик для ГРУППЫ (города)
                // 👇 Обработчик для ГРУППЫ (города)
                inputElement.addEventListener('change', (event) => {
                    const checked = (event.target as HTMLInputElement).checked;

                    // Визуально ставим/снимаем галочки у всех дочерних элементов
                    const childCheckboxes = divElement.querySelectorAll<HTMLInputElement>('.child-mark');
                    childCheckboxes.forEach((cb) => (cb.checked = checked));

                    group.marks.forEach((mark: any) => {
                        // 👇 ГЛАВНЫЙ ФИКС:
                        // Если мы ВКЛЮЧАЕМ группу, то активируем только те адреса,
                        // которые изначально входят в выбранный день (isActive !== false).
                        // Если ВЫКЛЮЧАЕМ — выключаем все.
                        const shouldBeActive = checked ? (mark.isActive !== false) : false;

                        const oldMarker = markersState[group.id][mark.id];
                        if (oldMarker && window.map) window.map.removeChild(oldMarker);

                        // Создаем новый маркер с учетом флага
                        const newMarker = createMarker(mark.coordinates, mark.title, group.color, shouldBeActive);
                        markersState[group.id][mark.id] = newMarker;
                        if (window.map) window.map.addChild(newMarker);
                    });
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
                    markInputElement.checked = mark.isActive !== false;

                    markInputElement.dataset.groupId = group.id;
                    markInputElement.dataset.markId = mark.id;

                    // 👇 Обработчик для ОТДЕЛЬНОГО адреса
                    markInputElement.addEventListener('change', (event) => {
                        const checked = (event.target as HTMLInputElement).checked;

                        // Меняем маркер на карте
                        const oldMarker = markersState[group.id][mark.id];
                        if (oldMarker && window.map) window.map.removeChild(oldMarker);

                        const newMarker = createMarker(mark.coordinates, mark.title, group.color, checked);
                        markersState[group.id][mark.id] = newMarker;
                        if (window.map) window.map.addChild(newMarker);

                        // Проверяем, все ли выключены, чтобы обновить чекбокс группы
                        const allCheckboxes = divElement.querySelectorAll<HTMLInputElement>('.child-mark');
                        const allUnchecked = Array.from(allCheckboxes).every(cb => !cb.checked);
                        const parent = divElement.querySelector<HTMLInputElement>(`.parent-${group.id}`);
                        if (parent) parent.checked = !allUnchecked;
                    });

                    const markLabelElement = document.createElement('label');
                    markLabelElement.classList.add('menu__checkbox_title');
                    markLabelElement.textContent = mark.title;

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

                const allCheckboxes = divElement.querySelectorAll<HTMLInputElement>('.child-mark');
                const anyChecked = Array.from(allCheckboxes).some(cb => cb.checked);
                inputElement.checked = anyChecked;

                this._container!.appendChild(divElement);
            });
        }

        protected _onDetach(): void {
            this._detachDom?.();
            this._detachDom = undefined;
            this._element = undefined;
            this._container = undefined;
        }
    }

    const customMenu = new CustomMenuControl({});

    const controls = new YMapControls({
        position: 'top right',
        orientation: 'vertical'
    });
    const control = new YMapControl({});
    control.addChild(customMenu);
    controls.addChild(control);

    window.map = new YMap(
        document.getElementById('app')!,
        { location: LOCATION, showScaleInCopyrights: true, behaviors: ['drag', 'pinchZoom', 'scrollZoom'] },
        [
            new YMapDefaultSchemeLayer({
                customization: [
                    { tags: { any: ['poi'] }, elements: 'label.icon', stylers: [{ opacity: 0 }] },
                    { tags: { any: ['poi'] }, elements: 'label.text.fill', stylers: [{ opacity: 0 }] },
                    { tags: { any: ['street'] }, elements: 'label', stylers: [{ opacity: 0 }] }
                ]
            }),
            new YMapDefaultFeaturesLayer({}),
            controls
        ]
    );

    customMenu.initMarkersOnMap();
}
