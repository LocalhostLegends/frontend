import { User } from '@app/core/models/user.model';
function extractDatePart(raw: string | undefined | null): string | null {
    if (!raw || typeof raw !== 'string')
        return null;
    const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
export function birthdayThisYear(datePart: string, year: number): Date | null {
    const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m)
        return null;
    const month = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) {
        return new Date(year, month, 28);
    }
    return d;
}
export function getUserBirthDatePart(user: User): string | null {
    const u = user as User & {
        birthDate?: string;
    };
    return extractDatePart(user.dateOfBirth) ?? extractDatePart(u.birthDate) ?? null;
}
export function getWeekRangeMonday(now = new Date()): {
    start: Date;
    end: Date;
} {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
export interface BirthdayWeekItem {
    user: User;
    occurrence: Date;
}
export function birthdaysThisWeek(users: User[], now = new Date()): BirthdayWeekItem[] {
    const { start, end } = getWeekRangeMonday(now);
    const y = now.getFullYear();
    const next: BirthdayWeekItem[] = [];
    for (const user of users) {
        const part = getUserBirthDatePart(user);
        if (!part)
            continue;
        const occ = birthdayThisYear(part, y);
        if (!occ)
            continue;
        if (occ >= start && occ <= end) {
            next.push({ user, occurrence: occ });
        }
    }
    next.sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime());
    return next;
}
const ABSENT_STATUSES = new Set(['on_leave', 'absent', 'day_off', 'vacation', 'sick', 'leave']);
export function isAbsentToday(user: User, now = new Date()): boolean {
    const u = user as User & {
        isAbsentToday?: boolean;
        onLeave?: boolean;
    };
    if (u.isAbsentToday === true || u.onLeave === true) {
        return true;
    }
    const s = (user.status ?? '').trim().toLowerCase();
    return ABSENT_STATUSES.has(s);
}
export function usersAbsentToday(users: User[], now = new Date()): User[] {
    return users.filter((u) => isAbsentToday(u, now));
}
