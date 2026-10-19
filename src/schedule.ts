// src/schedule.ts
export interface ScheduleItem {
    id: string;
    day: 'monday' | 'tuesday'; // Пока только понедельник, потом добавите вторник
}

export const scheduleData: ScheduleItem[] = [
    // Понедельник (из вашего Excel)
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
    { id: '2526', day: 'monday' }
];
