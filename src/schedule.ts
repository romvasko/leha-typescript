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
    // { id: '...', day: 'wednesday' },

    // --- ЧЕТВЕРГ ---
    // { id: '...', day: 'thursday' },

    // --- ПЯТНИЦА ---
    // { id: '...', day: 'friday' },

    // --- СУББОТА ---
    // { id: '...', day: 'saturday' },

    // --- ВОСКРЕСЕНЬЕ ---
    // { id: '...', day: 'sunday' },
];
