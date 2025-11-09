import React, { useState, useMemo } from 'react';
import { Worker, AttendanceEntry, AttendanceStatus, AttendanceCycle, Site, Role, User } from '../../types';
import { getDatesInCycle, formatDate, getDayInitial } from '../../utils/helpers';
import { ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_STATUS_COLORS, ATTENDANCE_STATUS_LABELS } from '../../constants';

interface AttendanceCellProps {
  entry: Partial<AttendanceEntry>;
  date: string;
  isWeekend: boolean;
  isEditable: boolean;
  role: Role;
  sites: Site[];
  onChange: (newEntryData: Partial<Omit<AttendanceEntry, 'id'|'worker_id'|'date'>>) => void;
}

const AttendanceCell: React.FC<AttendanceCellProps> = React.memo(({ entry, date, isWeekend, isEditable, role, sites, onChange }) => {
  const status = entry?.status || '';
  const overtime = entry?.overtime_hours || 0;
  const siteId = entry?.site_id || '';
  const bgColor = isWeekend && !status ? ATTENDANCE_STATUS_COLORS[AttendanceStatus.Weekend] : ATTENDANCE_STATUS_COLORS[status];
  const isPresent = status === AttendanceStatus.Present;
  
  const todayString = useMemo(() => formatDate(new Date()), []);
  const cellIsEditable = useMemo(() => {
      if (!isEditable) return false;
      if (role === Role.HR || role === Role.Accountant) return true;
      if (role === Role.Foreman && date === todayString) return true;
      return false;
  }, [isEditable, role, date, todayString]);


  if (!cellIsEditable) {
    const siteName = sites.find(s => s.id === siteId)?.name;
    return (
        <div className={`w-24 h-12 flex flex-col items-center justify-center text-xs font-mono ${bgColor}`}>
            <div className="font-semibold">{status}</div>
            {isPresent && siteName && (
                <div className="text-[10px] opacity-80 truncate" title={siteName}>{siteName}</div>
            )}
            {isPresent && overtime > 0 && (
                <div className="text-[10px] opacity-80">OT: {overtime}</div>
            )}
        </div>
    );
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AttendanceStatus | '';
    onChange({ status: newStatus });
  };

  const handleOvertimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOvertime = parseFloat(e.target.value);
    onChange({ overtime_hours: isNaN(newOvertime) ? 0 : newOvertime });
  };
  
  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ site_id: e.target.value });
  };

  const activeSites = useMemo(() => sites.filter(s => s.is_active), [sites]);

  return (
    <div className={`w-24 h-12 flex flex-col text-xs font-mono ${bgColor}`}>
      <select
        value={status}
        onChange={handleStatusChange}
        className={`w-full flex-grow text-xs font-mono border-0 focus:ring-0 focus:outline-none text-center appearance-none ${bgColor} p-0`}
      >
        <option value=""></option>
        {ATTENDANCE_STATUS_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {isPresent && (
        <>
            <select
                value={siteId}
                onChange={handleSiteChange}
                className={`w-full flex-grow text-[10px] font-mono border-0 focus:ring-0 focus:outline-none text-center appearance-none ${bgColor} p-0 truncate`}
            >
                <option value="">- Site -</option>
                {activeSites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                ))}
            </select>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={overtime}
              onChange={handleOvertimeChange}
              placeholder="OT"
              className={`w-full flex-grow text-xs font-mono border-0 focus:ring-0 focus:outline-none text-center ${bgColor} p-0 placeholder-gray-500 dark:placeholder-gray-400`}
              onClick={e => e.stopPropagation()}
            />
        </>
      )}
    </div>
  );
});

interface AttendanceGridProps {
  workers: Worker[];
  entries: AttendanceEntry[];
  cycle: AttendanceCycle;
  sites: Site[];
  isEditable: boolean;
  language: 'en' | 'ar';
  currentUser: User;
  onEntryChange: (workerId: string, date: string, newEntryData: Partial<Omit<AttendanceEntry, 'id'|'worker_id'|'date'>>) => void;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({ workers, entries, cycle, sites, isEditable, language, currentUser, onEntryChange }) => {

  const datesInCycle = useMemo(() => getDatesInCycle(cycle), [cycle]);

  const entryMap = useMemo(() => {
    const map: Record<string, Partial<AttendanceEntry>> = {};
    entries.forEach(entry => {
        map[`${entry.worker_id}-${entry.date}`] = entry;
    });
    return map;
  }, [entries]);


  const totals = useMemo(() => {
    const workerTotals: Record<string, Record<string, number>> = {};
    workers.forEach(w => {
      workerTotals[w.id] = {
        ...Object.fromEntries(ATTENDANCE_STATUS_OPTIONS.map(s => [s, 0])),
        OT: 0,
      };
    });

    Object.values(entryMap).forEach((entryData) => {
      const workerId = entryData.worker_id;
      if (!workerId || !workerTotals[workerId]) return;

      if (entryData?.status) {
        const status = entryData.status;
        if (workerTotals[workerId][status] !== undefined) {
          workerTotals[workerId][status]++;
        }
      }
      if (entryData?.overtime_hours) {
        workerTotals[workerId].OT += entryData.overtime_hours;
      }
    });
    return workerTotals;
  }, [entryMap, workers]);


  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4">
      <div className="min-w-max">
        {/* Header */}
        <div className="flex sticky top-0 bg-gray-50 dark:bg-slate-700 z-10">
          <div className="w-56 px-2 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border-e dark:border-slate-600 sticky start-0 bg-gray-50 dark:bg-slate-700">Worker</div>
          <div className="flex">
            {datesInCycle.map(date => {
              const isWeekend = date.getDay() === 0; // Sunday
              return (
                <div key={date.toISOString()} className={`w-24 text-center border-b-2 ${isWeekend ? 'bg-gray-200 dark:bg-navy-900' : ''}`}>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getDayInitial(date, language)}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{date.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="flex ms-2">
             {ATTENDANCE_STATUS_OPTIONS.map(s => <div key={s} className="w-10 text-center py-2 text-xs font-bold" title={ATTENDANCE_STATUS_LABELS[s]}>{s}</div>)}
             <div className="w-12 text-center py-2 text-xs font-bold" title="Overtime Hours">OT</div>
          </div>
        </div>

        {/* Body */}
        <div>
          {workers.map(worker => (
            <div key={worker.id} className="flex border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
              <div className="w-56 px-2 py-2 text-sm text-gray-800 dark:text-gray-200 border-e dark:border-slate-600 sticky start-0 bg-white dark:bg-slate-800 flex items-center">
                <div className="truncate pe-2">
                    <p className="font-semibold truncate">{worker.full_name}</p>
                    <p className="text-xs text-gray-500">{worker.worker_code}</p>
                </div>
              </div>
              <div className="flex">
                {datesInCycle.map(date => {
                  const dateString = formatDate(date);
                  const isWeekend = date.getDay() === 0;
                  return (
                    <div key={dateString} className="border-e dark:border-slate-700">
                        <AttendanceCell 
                            entry={entryMap[`${worker.id}-${dateString}`] || { status: '' }}
                            date={dateString}
                            isWeekend={isWeekend}
                            isEditable={isEditable}
                            role={currentUser.role}
                            sites={sites}
                            onChange={(newEntryData) => onEntryChange(worker.id, dateString, newEntryData)}
                        />
                    </div>
                  );
                })}
              </div>
               <div className="flex ms-2 items-center">
                {ATTENDANCE_STATUS_OPTIONS.map(s => (
                    <div key={s} className="w-10 text-center text-sm font-mono text-gray-700 dark:text-gray-300">
                        {totals[worker.id][s] > 0 ? totals[worker.id][s] : '-'}
                    </div>
                ))}
                <div className="w-12 text-center text-sm font-mono text-gray-700 dark:text-gray-300">
                    {totals[worker.id].OT > 0 ? totals[worker.id].OT.toFixed(1) : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};