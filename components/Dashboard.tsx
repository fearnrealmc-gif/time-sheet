import React, { useState } from 'react';
import { useApp } from '../App';
import { Card, KpiCard, Button, Modal, Spinner } from './common/UI';
import { AttendanceGrid } from './attendance/AttendanceGrid';
import { generateAttendanceSummary } from '../services/geminiService';
import { getCurrentAttendanceCycle, formatDate } from '../utils/helpers';
import { Role, AttendanceStatus } from '../types';

const ICONS = {
    workers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
    sites: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
    presence: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
    absence: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
};


const AISummaryModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { workers, attendanceEntries } = useApp();
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const cycle = getCurrentAttendanceCycle();

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await generateAttendanceSummary(cycle.month_label, workers, attendanceEntries);
        setSummary(result);
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Attendance Summary">
            {summary ? (
                <div className="prose prose-sm dark:prose-invert max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Generate an AI-powered summary of the current attendance cycle. This will highlight trends, anomalies, and key insights.
                    </p>
                    {isLoading ? <Spinner /> : <Button onClick={handleGenerate}>Generate Summary</Button>}
                </div>
            )}
        </Modal>
    );
};


export const HRDashboard: React.FC = () => {
  const { currentUser, t, workers, sites, language, attendanceEntries, updateAttendanceEntry } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const todayString = formatDate(new Date());
  const todaysEntries = attendanceEntries.filter(e => e.date === todayString);
  const presenceCount = todaysEntries.filter(e => e.status === AttendanceStatus.Present).length;
  const absenceCount = todaysEntries.filter(e => e.status === AttendanceStatus.Absent).length;

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboard')}</h2>
            <Button onClick={() => setIsAiModalOpen(true)}>Generate AI Summary</Button>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t('active_workers')} value={workers.filter(w => w.status === 'active').length} icon={ICONS.workers} />
        <KpiCard title={t('active_sites')} value={sites.filter(s => s.is_active).length} icon={ICONS.sites} />
        <KpiCard title={t('today_presence')} value={presenceCount} icon={ICONS.presence} />
        <KpiCard title={t('today_absence')} value={absenceCount} icon={ICONS.absence} />
      </div>
      <Card className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Full Attendance View</h3>
        <AttendanceGrid 
            workers={workers} 
            entries={attendanceEntries} 
            cycle={getCurrentAttendanceCycle()} 
            sites={sites} 
            isEditable={true} 
            language={language} 
            currentUser={currentUser!}
            onEntryChange={updateAttendanceEntry}
        />
      </Card>
      <AISummaryModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};

export const ForemanDashboard: React.FC = () => {
  const { currentUser, t, workers, sites, language, attendanceEntries, updateAttendanceEntry } = useApp();
  const myWorkers = workers.filter(w => w.foreman_id === currentUser?.id);
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('foreman_dashboard')}</h2>
      <Card>
        <h3 className="text-lg font-semibold mb-4">{t('your_workers')} - Today's Attendance</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You can only edit attendance for today.</p>
        <AttendanceGrid 
            workers={myWorkers} 
            entries={attendanceEntries.filter(e => myWorkers.some(w => w.id === e.worker_id))}
            cycle={getCurrentAttendanceCycle()} 
            sites={sites} 
            isEditable={true} 
            language={language}
            currentUser={currentUser!}
            onEntryChange={updateAttendanceEntry}
        />
      </Card>
    </div>
  );
};

export const EngineerDashboard: React.FC = () => {
  const { currentUser, setView, t } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('engineer_dashboard')}</h2>
       <Card className="text-center p-8">
        <h3 className="text-xl font-semibold mb-2">Welcome, {currentUser?.name}!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('welcomeEngineer')}</p>
        <Button onClick={() => setView('reviews')}>
            {t('goToReviewPage')}
        </Button>
      </Card>
    </div>
  );
};

export const MainDashboard: React.FC = () => {
  const { currentUser } = useApp();

  switch (currentUser?.role) {
    case Role.HR:
    case Role.Accountant:
      return <HRDashboard />;
    case Role.Foreman:
      return <ForemanDashboard />;
    case Role.Engineer:
      return <EngineerDashboard />;
    default:
      return <div>Loading dashboard...</div>;
  }
};