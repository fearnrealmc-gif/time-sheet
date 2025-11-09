

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UI';
import { Worker, WorkerStatus } from '../../types';

interface WorkerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (worker: Worker) => void;
    workerToEdit?: Worker | null;
}

const emptyWorker: Omit<Worker, 'id' | 'company_id'> = {
    full_name: '',
    worker_code: '',
    start_date: new Date().toISOString().split('T')[0],
    status: WorkerStatus.Active,
};

export const WorkerForm: React.FC<WorkerFormProps> = ({ isOpen, onClose, onSave, workerToEdit }) => {
    const [worker, setWorker] = useState<Omit<Worker, 'id' | 'company_id'>>(emptyWorker);

    useEffect(() => {
        if (workerToEdit) {
            setWorker(workerToEdit);
        } else {
            setWorker(emptyWorker);
        }
    }, [workerToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setWorker(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...worker,
            id: workerToEdit?.id || '', // ID is handled by the save function
            company_id: workerToEdit?.company_id || 'c1',
        });
        onClose();
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={workerToEdit ? "Edit Worker" : "Add New Worker"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="full_name" className={labelClasses}>Full Name</label>
                    <input type="text" id="full_name" name="full_name" value={worker.full_name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="worker_code" className={labelClasses}>Worker Code</label>
                    <input type="text" id="worker_code" name="worker_code" value={worker.worker_code} onChange={handleChange} className={inputClasses} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start_date" className={labelClasses}>Start Date</label>
                        <input type="date" id="start_date" name="start_date" value={worker.start_date} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="status" className={labelClasses}>Status</label>
                        <select id="status" name="status" value={worker.status} onChange={handleChange} className={inputClasses}>
                            <option value={WorkerStatus.Active}>Active</option>
                            <option value={WorkerStatus.Inactive}>Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Worker</Button>
                </div>
            </form>
        </Modal>
    );
};