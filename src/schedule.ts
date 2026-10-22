export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduleItem {
    id: string;
    day: DayOfWeek;
}

export const scheduleData: ScheduleItem[] = [
    // --- ПОНЕДЕЛЬНИК ---
    { id: '759', day: 'monday' },
    { id: '499', day: 'monday' },
    { id: '5003', day: 'monday' },
    { id: '337', day: 'monday' },
    { id: '2285', day: 'monday' },
    { id: '336', day: 'monday' },
    { id: '353', day: 'monday' },
    { id: '2037', day: 'monday' },
    { id: '310', day: 'monday' },
    { id: '461', day: 'monday' },
    { id: '2073', day: 'monday' },
    { id: '2652', day: 'monday' },
    { id: '526', day: 'monday' },
    { id: '2314', day: 'monday' },
    { id: '280', day: 'monday' },
    { id: '2140', day: 'monday' },
    { id: '538', day: 'monday' },
    { id: '543', day: 'monday' },
    { id: '2101', day: 'monday' },
    { id: '2460', day: 'monday' },
    { id: '2105', day: 'monday' },
    { id: '2427', day: 'monday' },
    { id: '2426', day: 'monday' },
    { id: '2526', day: 'monday' },

    // --- ВТОРНИК ---
    { id: '393', day: 'tuesday' },
    { id: '384', day: 'tuesday' },
    { id: '2544', day: 'tuesday' },
    { id: '378', day: 'tuesday' },
    { id: '2042', day: 'tuesday' },
    { id: '2529', day: 'tuesday' },
    { id: '488', day: 'tuesday' },
    { id: '2070', day: 'tuesday' },
    { id: '454', day: 'tuesday' },
    { id: '2503', day: 'tuesday' },
    { id: '2339', day: 'tuesday' },
    { id: '269', day: 'tuesday' },
    { id: '351', day: 'tuesday' },
    { id: '2030', day: 'tuesday' },
    { id: '2213', day: 'tuesday' },
    { id: '2552', day: 'tuesday' },
    { id: '2525', day: 'tuesday' },
    { id: '2312', day: 'tuesday' },
    { id: '2064', day: 'tuesday' },

    // --- СРЕДА ---
    { id: '353', day: 'wednesday' },
    { id: '2426', day: 'wednesday' },
    { id: '759', day: 'wednesday' },
    { id: '2285', day: 'wednesday' },
    { id: '2037', day: 'wednesday' },
    { id: '336', day: 'wednesday' },
    { id: '337', day: 'wednesday' },
    { id: '499', day: 'wednesday' },
    { id: '706', day: 'wednesday' },
    { id: '2538', day: 'wednesday' },
    { id: '2536', day: 'wednesday' },
    { id: '311', day: 'wednesday' },
    { id: '2060', day: 'wednesday' },
    { id: '2545', day: 'wednesday' },
    { id: '2408', day: 'wednesday' },
    { id: '2248', day: 'wednesday' },
    { id: '368', day: 'wednesday' },
    { id: '528', day: 'wednesday' },
    { id: '2745', day: 'wednesday' },
    { id: '2073', day: 'wednesday' },
    { id: '2101', day: 'wednesday' },
    { id: '2407', day: 'wednesday' },
    { id: '2105', day: 'wednesday' },


    // --- ЧЕТВЕРГ ---
    { id: '2460', day: 'thursday' },
    { id: '526', day: 'thursday' },
    { id: '543', day: 'thursday' },
    { id: '2552', day: 'thursday' },
    { id: '378', day: 'thursday' },
    { id: '310', day: 'thursday' },
    { id: '461', day: 'thursday' },
    { id: '2314', day: 'thursday' },
    { id: '2042', day: 'thursday' },
    { id: '2529', day: 'thursday' },
    { id: '5032', day: 'thursday' }, // 👈 Новый
    { id: '2503', day: 'thursday' },
    { id: '384', day: 'thursday' },
    { id: '2339', day: 'thursday' },
    { id: '2652', day: 'thursday' },
    { id: '280', day: 'thursday' },
    { id: '2140', day: 'thursday' },
    { id: '538', day: 'thursday' },
    { id: '2427', day: 'thursday' },
    { id: '2030', day: 'thursday' },
    { id: '269', day: 'thursday' },
    { id: '393', day: 'thursday' },
    { id: '351', day: 'thursday' },

    // --- ПЯТНИЦА ---
    // { id: '...', day: 'friday' },

    // --- СУББОТА ---
    // { id: '...', day: 'saturday' },

    // --- ВОСКРЕСЕНЬЕ ---
    // { id: '...', day: 'sunday' },
];
