import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UI';
import { Site } from '../../types';
import { useApp } from '../../App';

interface SiteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (site: Site) => void;
    siteToEdit?: Site | null;
}

const emptySite: Omit<Site, 'id' | 'company_id'> = {
    name: '',
    is_active: true,
};

export const SiteForm: React.FC<SiteFormProps> = ({ isOpen, onClose, onSave, siteToEdit }) => {
    const { t } = useApp();
    const [site, setSite] = useState<Omit<Site, 'id' | 'company_id'>>(emptySite);

    useEffect(() => {
        if (siteToEdit) {
            setSite(siteToEdit);
        } else {
            setSite(emptySite);
        }
    }, [siteToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSite(prev => ({ ...prev, [name]: checked }));
        } else {
            setSite(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...site,
            id: siteToEdit?.id || '', 
            company_id: siteToEdit?.company_id || 'c1',
            is_active: site.is_active,
        });
        onClose();
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={siteToEdit ? t('editSite') : t('addSite')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>{t('siteName')}</label>
                    <input type="text" id="name" name="name" value={site.name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                     <label htmlFor="is_active" className={labelClasses}>{t('siteStatus')}</label>
                     <select id="is_active" name="is_active" value={String(site.is_active)} onChange={(e) => setSite(prev => ({...prev, is_active: e.target.value === 'true' }))} className={inputClasses}>
                        <option value="true">{t('active')}</option>
                        <option value="false">{t('inactive')}</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Site</Button>
                </div>
            </form>
        </Modal>
    );
};