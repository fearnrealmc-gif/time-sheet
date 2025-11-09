import React, { useState, useMemo } from 'react';
import { useApp } from '../../App';
import { Card, Button } from '../common/UI';
import { AttendanceGrid } from '../attendance/AttendanceGrid';
import { SignaturePad } from '../attendance/SignaturePad';
import { getCurrentAttendanceCycle } from '../../utils/helpers';
// Fix: Import TRANSLATIONS from constants.ts, not types.ts.
import { MOCK_ENGINEER_REVIEW, TRANSLATIONS } from '../../constants';
import { ReviewStatus } from '../../types';

export const ReviewsPage: React.FC = () => {
  const { currentUser, t, workers, sites, language, attendanceEntries } = useApp();
  
  const currentCycle = useMemo(() => getCurrentAttendanceCycle(), []);
  
  // In a real app, you'd fetch the review for the current cycle and engineer
  const currentReview = MOCK_ENGINEER_REVIEW;

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const handleSaveSignature = (dataUrl: string) => {
      setSignatureDataUrl(dataUrl);
      console.log("Signature captured:", dataUrl);
      alert("Signature captured! You can now submit.");
  }

  const handleSubmitReview = () => {
    if (!signatureDataUrl) {
      alert("Please sign before submitting.");
      return;
    }
    console.log("Submitting review for cycle:", currentCycle.id);
    alert("Review submitted to HR for approval.");
    // In a real app, you'd update the review status in the database.
  }

  const canSignAndSubmit = currentReview.status === ReviewStatus.Pending || currentReview.status === ReviewStatus.Returned;

  const getStatusBadgeColor = (status: ReviewStatus) => {
    switch(status) {
        case ReviewStatus.Approved: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case ReviewStatus.Submitted: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case ReviewStatus.Returned: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  // Fix: With TRANSLATIONS correctly imported, statusKey is now correctly typed, resolving the error on the next line.
  const statusKey = `reviewStatus_${currentReview.status}` as keyof typeof TRANSLATIONS.en;
  const statusText = t(statusKey);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('review_cycle')}</h2>
       <Card>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h3 className="text-lg font-semibold">
                {t('attendance')} - {currentCycle.month_label}
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('status')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(currentReview.status)}`}>
                    {statusText}
                </span>
            </div>
        </div>

        {currentReview.status === ReviewStatus.Returned && currentReview.hr_notes && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 border-s-4 border-yellow-400 dark:border-yellow-500 rounded-e-lg">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200">{t('notesFromHr')}:</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{currentReview.hr_notes}</p>
            </div>
        )}
        
        <AttendanceGrid 
            workers={workers} 
            entries={attendanceEntries} 
            cycle={currentCycle} 
            sites={sites} 
            isEditable={false} 
            language={language}
            currentUser={currentUser!}
            onEntryChange={() => {}}
        />

        {canSignAndSubmit && (
            <div className="mt-6 p-4 border-t dark:border-slate-700">
                <h4 className="font-semibold mb-2">{t('signOffAndSubmit')}</h4>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {currentReview.status === ReviewStatus.Returned 
                                ? t('resubmitPrompt')
                                : t('signHerePrompt')
                            }
                        </p>
                        <SignaturePad onSave={handleSaveSignature} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('submitWarning')}</p>
                        <Button onClick={handleSubmitReview} disabled={!signatureDataUrl}>
                            {currentReview.status === ReviewStatus.Returned ? t('resubmitToHr') : t('submit_for_review')}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {currentReview.status === ReviewStatus.Submitted && (
            <div className="mt-6 p-4 border-t dark:border-slate-700 text-center">
                <p className="text-gray-600 dark:text-gray-400">{t('cycleSubmitted')}</p>
            </div>
        )}

        {currentReview.status === ReviewStatus.Approved && (
             <div className="mt-6 p-4 border-t dark:border-slate-700 text-center">
                <p className="text-green-600 dark:text-green-400 font-semibold">{t('cycleApproved')}</p>
            </div>
        )}
      </Card>
    </div>
  );
};