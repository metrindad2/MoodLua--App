
import { isSameDay, isSameMonth } from 'date-fns';
import type { DailyLog } from '@/lib/types';

export type CalendarProps = {
  initialDate: Date;
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
  highlightedDates?: Date[];
  previsionRanges?: { from: Date; to: Date }[];
  fertileWindows?: { from: Date; to: Date }[];
  ovulationDates?: Date[];
  dailyLogs?: DailyLog[];
};

export const calendarCompare = (
  prevProps: CalendarProps,
  nextProps: CalendarProps
) => {
  if (prevProps.onDateClick !== nextProps.onDateClick) return false;
  if (!isSameDay(prevProps.initialDate, nextProps.initialDate)) return false;

  const month = prevProps.initialDate;

  const prevInMonth =
    prevProps.selectedDates?.filter((d) => isSameMonth(d, month)) || [];
  const nextInMonth =
    nextProps.selectedDates?.filter((d) => isSameMonth(d, month)) || [];

  if (prevInMonth.length === 0 && nextInMonth.length === 0) {
    return true;
  }

  if (prevInMonth.length !== nextInMonth.length) return false;

  const prevTimes = new Set(prevInMonth.map((d) => d.getTime()));
  for (const date of nextInMonth) {
    if (!prevTimes.has(date.getTime())) return false;
  }

  return true;
};
