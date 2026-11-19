export function dayBounds(now: Date) {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setDate(end.getDate() + 1); end.setMilliseconds(-1);
    return { startOfDay: start, endOfToday: end };
}