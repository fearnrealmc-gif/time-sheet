
import { AttendanceCycle } from '../types';

export const getCurrentAttendanceCycle = (): AttendanceCycle => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  let start_date: Date;
  let end_date: Date;

  if (dayOfMonth >= 26) {
    start_date = new Date(today.getFullYear(), today.getMonth(), 26);
    end_date = new Date(today.getFullYear(), today.getMonth() + 1, 25);
  } else {
    start_date = new Date(today.getFullYear(), today.getMonth() - 1, 26);
    end_date = new Date(today.getFullYear(), today.getMonth(), 25);
  }

  const month_label = `${start_date.toLocaleString('default', { month: 'short' })}-${end_date.toLocaleString('default', { month: 'short' })} ${end_date.getFullYear()}`;
  
  return {
    id: `cycle-${start_date.getFullYear()}-${start_date.getMonth() + 1}`,
    company_id: 'c1',
    month_label,
    start_date,
    end_date,
  };
};

export const getDatesInCycle = (cycle: AttendanceCycle): Date[] => {
  const dates = [];
  let currentDate = new Date(cycle.start_date);
  while (currentDate <= cycle.end_date) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayInitial = (date: Date, lang: 'en' | 'ar'): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    let day = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', options).format(date);
    // For English, take the first letter. For Arabic, it's often a single letter already.
    return lang === 'en' ? day.charAt(0) : day;
};
