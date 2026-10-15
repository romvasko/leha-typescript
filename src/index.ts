import { GroupPropTypes } from './common.js';
import { LOCATION, groupsProps } from './variables.js';

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

    interface CustomMenuControlProps {
        groupsProps: Array<GroupPropTypes>;
    }

    const markersState: MarkersState = {};

    // 👇 НОВОЕ — центрирование карты на точке
    function focusOnPoint(lng: number, lat: number) {
        window.map.setLocation({
            center: [lng, lat],
            zoom: 14,
            duration: 500
        });
    }

    class CustomMenuControl extends YMapGroupEntity<CustomMenuControlProps> {
        private _element?: HTMLDivElement;
        private _container?: HTMLDivElement;
        private _detachDom?: () => void;

        protected _onAttach() {
            this._createMenu();
        }

        _createMenu() {
            this._element = document.createElement('div');
            this._element.classList.add('menu');
            this._container = document.createElement('div');
            this._container.classList.add('container');

            // 👇 Кнопка-переключатель меню
            const toggleButton = document.createElement('button');
            toggleButton.classList.add('menu-toggle');
            toggleButton.type = 'button';
            toggleButton.textContent = '☰';
            toggleButton.title = 'Скрыть / показать меню';
            toggleButton.addEventListener('click', () => {
              const isHidden = this._element!.classList.toggle('menu--hidden');
              toggleButton.textContent = isHidden ? '☰' : '×';
            });
            this._element.appendChild(toggleButton);

            const titleElement = document.createElement('div');
            titleElement.textContent = 'What to do in the city';
            titleElement.classList.add('menu__title');
            this._element.appendChild(titleElement);

            this._props.groupsProps.forEach((group) => {
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
                        });
                    } else {
                        Object.values(markersState[group.id]).forEach((marker) => {
                            if (marker) window.map.removeChild(marker);
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
                        } else {
                            window.map.removeChild(markersState[group.id][mark.id]);
                            markersState[group.id][mark.id] = null;
                        }

                        const markers = Object.values(markersState[group.id]);
                        const anyChecked = markers.some((marker) => marker !== null);
                        const parent = divElement.querySelector<HTMLInputElement>(`.parent-${group.id}`);
                        if (parent) parent.checked = anyChecked;
                    });

                    const markLabelElement = document.createElement('label');
                    markLabelElement.classList.add('menu__checkbox_title');
                    markLabelElement.textContent = mark.title;

                    // 👇 НОВОЕ — клик по названию центрирует карту
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

            this._element.appendChild(this._container);
            this._detachDom = ymaps3.useDomContext(this, this._element, this._container);
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
    control.addChild(new CustomMenuControl({ groupsProps }));
    controls.addChild(control);

    window.map = new YMap(
        document.getElementById('app')!,
        { location: LOCATION, showScaleInCopyrights: true },
        [new YMapDefaultSchemeLayer({
    customization: [
        // Скрываем иконки и подписи POI (магазины, банкоматы и т.д.)
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
        // Скрываем подписи улиц (если нужно)
        {
            tags: { any: ['street'] },
            elements: 'label',
            stylers: [{ opacity: 0 }]
        }
    ]
}), new YMapDefaultFeaturesLayer({}), controls]
    );

    groupsProps.forEach((group) => {
        markersState[group.id] = {};
        group.marks.forEach((mark) => {
            const marker = new YMapDefaultMarker({
                coordinates: mark.coordinates,
                iconName: 'fallback',
                size: 'small',
                title: mark.title,
                color: { day: group.color, night: group.color } as any,
                draggable: false
            } as any);
            markersState[group.id][mark.id] = marker;
            window.map.addChild(marker);
        });
    });
}
