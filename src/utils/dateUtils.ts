import { Habit } from '../types';

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString(undefined, options);
}

export function isTargetDay(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === 'daily') return true;
  const date = parseDate(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  if (habit.frequency === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (habit.frequency === 'weekends') {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  if (habit.frequency === 'custom' && habit.customDays) {
    return habit.customDays.includes(dayOfWeek);
  }
  return true;
}

/**
 * Returns an array of columns (weeks), each containing 7 date strings (or empty if out of range).
 * Day 0 is Sunday, Day 6 is Saturday (or Mon-Sun).
 * The last column ends on the current week.
 */
export interface MatrixColumn {
  weekNumber: number;
  monthLabel?: string;
  days: {
    date: string;
    dayOfWeek: number;
    isFuture: boolean;
  }[];
}

export function generateContributionMatrix(totalWeeks: number = 20): MatrixColumn[] {
  const today = new Date();
  const todayStr = formatDate(today);
  const columns: MatrixColumn[] = [];

  // End at the upcoming Saturday (end of current week)
  const currentDayOfWeek = today.getDay(); // 0=Sun ... 6=Sat
  const daysUntilSaturday = 6 - currentDayOfWeek;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilSaturday);

  // Total days to generate
  const totalDays = totalWeeks * 7;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  let currentIter = new Date(startDate);
  let lastMonthSeen = -1;

  for (let w = 0; w < totalWeeks; w++) {
    const days = [];
    let monthLabel: string | undefined = undefined;

    for (let d = 0; d < 7; d++) {
      const dateString = formatDate(currentIter);
      const m = currentIter.getMonth();
      const isFuture = dateString > todayStr;

      if (d === 0 && m !== lastMonthSeen) {
        monthLabel = currentIter.toLocaleDateString(undefined, { month: 'short' });
        lastMonthSeen = m;
      }

      days.push({
        date: dateString,
        dayOfWeek: currentIter.getDay(),
        isFuture,
      });

      currentIter.setDate(currentIter.getDate() + 1);
    }

    columns.push({
      weekNumber: w,
      monthLabel,
      days,
    });
  }

  return columns;
}

export function getDaysCountForSpan(span: '30days' | '90days' | '180days' | 'year'): number {
  switch (span) {
    case '30days': return 5;   // ~5 weeks
    case '90days': return 13;  // ~13 weeks
    case '180days': return 26; // ~26 weeks
    case 'year': return 52;    // 52 weeks
    default: return 20;
  }
}
