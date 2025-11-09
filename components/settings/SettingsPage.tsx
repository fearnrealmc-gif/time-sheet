import React, { useState, useRef } from 'react';
import { useApp } from '../../App';
import { Card, Button } from '../common/UI';
import { Company } from '../../types';

export const SettingsPage: React.FC = () => {
    const { company, saveCompany, t } = useApp();
    const [companyName, setCompanyName] = useState(company?.name || '');
    const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        const updatedCompany: Partial<Company> = {
            name: companyName,
        };
        if (logoPreview !== company?.logo_url) {
            updatedCompany.logo_url = logoPreview || '';
        }
        saveCompany(updatedCompany);
        alert(t('changesSaved'));
    };
    
    const handleExport = () => {
        // In a real app, this would generate an Excel file using a library like xlsx.
        // For this demo, we'll just show an alert.
        console.log("Exporting timesheet data...");
        alert(t('exportInitiated'));
    }
    
    const inputClasses = "w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('settings')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-lg font-semibold mb-4">{t('companySettings')}</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className={labelClasses}>{t('companyName')}</label>
                            <input
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>{t('companyLogo')}</label>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                {logoPreview && <img src={logoPreview} alt="Company Logo" className="h-16 w-16 rounded-lg object-cover bg-gray-200" />}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                />
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                    {t('uploadLogo')}
                                </Button>
                            </div>
                        </div>
                        <div className="pt-2">
                             <Button onClick={handleSaveChanges}>{t('saveChanges')}</Button>
                        </div>
                    </div>
                </Card>

                <Card>
                     <h3 className="text-lg font-semibold mb-4">{t('dataExport')}</h3>
                     <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {t('exportDescription')}
                        </p>
                        <div>
                            <Button onClick={handleExport}>
                                {t('exportTimesheet')}
                            </Button>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};