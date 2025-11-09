

import React, { useState } from 'react';
import { useApp } from '../../App';
import { Card, Button } from '../common/UI';
import { Worker } from '../../types';
import { WorkerForm } from './WorkerForm';

export const WorkersPage: React.FC = () => {
    const { workers, saveWorker, deleteWorker, t } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);

    const handleAddWorker = () => {
        setWorkerToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditWorker = (worker: Worker) => {
        setWorkerToEdit(worker);
        setIsFormOpen(true);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('workers')}</h2>
                <Button onClick={handleAddWorker}>Add Worker</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Worker</th>
                                <th scope="col" className="px-6 py-3">Code</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Start Date</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map(worker => (
                                <tr key={worker.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {worker.full_name}
                                    </td>
                                    <td className="px-6 py-4">{worker.worker_code}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            worker.status === 'active' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {worker.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{worker.start_date}</td>
                                    <td className="px-6 py-4 text-end">
                                        <div className="space-x-2 rtl:space-x-reverse">
                                            <Button variant="secondary" onClick={() => handleEditWorker(worker)}>{t('edit')}</Button>
                                            <Button variant="danger" onClick={() => deleteWorker(worker.id)}>{t('delete')}</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <WorkerForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSave={saveWorker}
                workerToEdit={workerToEdit}
            />
        </div>
    );
};