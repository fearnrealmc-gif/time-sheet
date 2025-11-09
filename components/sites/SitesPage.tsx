import React, { useState } from 'react';
import { useApp } from '../../App';
import { Card, Button } from '../common/UI';
import { Site } from '../../types';
import { SiteForm } from './SiteForm';

export const SitesPage: React.FC = () => {
    const { sites, saveSite, deleteSite, t } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

    const handleAddSite = () => {
        setSiteToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditSite = (site: Site) => {
        setSiteToEdit(site);
        setIsFormOpen(true);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('sites')}</h2>
                <Button onClick={handleAddSite}>{t('addSite')}</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('siteName')}</th>
                                <th scope="col" className="px-6 py-3">{t('siteStatus')}</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map(site => (
                                <tr key={site.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {site.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            site.is_active 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {site.is_active ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-end">
                                        <div className="space-x-2 rtl:space-x-reverse">
                                            <Button variant="secondary" onClick={() => handleEditSite(site)}>{t('edit')}</Button>
                                            <Button variant="danger" onClick={() => deleteSite(site.id)}>{t('delete')}</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <SiteForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSave={saveSite}
                siteToEdit={siteToEdit}
            />
        </div>
    );
};