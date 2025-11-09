


import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UI';
import { User, Role } from '../../types';
import { useApp } from '../../App';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    userToEdit?: User | null;
}

const emptyUser: Omit<User, 'id' | 'company_id'> & { password?: string } = {
    name: '',
    email: '',
    role: Role.Foreman,
    password: '',
};

export const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const { t } = useApp();
    const [user, setUser] = useState(emptyUser);

    useEffect(() => {
        if (userToEdit) {
            setUser({ ...userToEdit, password: '' }); // Clear password for edit form
        } else {
            setUser(emptyUser);
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...user,
            id: userToEdit?.id || '', // ID is handled by the save function
            company_id: userToEdit?.company_id || 'c1',
        });
        onClose();
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const availableRoles = [Role.Foreman, Role.Engineer, Role.Accountant, Role.HR];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? t('editUser') : t('addUser')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>{t('fullName')}</label>
                    <input type="text" id="name" name="name" value={user.name} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="email" className={labelClasses}>{t('email')}</label>
                    <input type="email" id="email" name="email" value={user.email} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="password" className={labelClasses}>{t('password')}</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={user.password} 
                        onChange={handleChange} 
                        className={inputClasses} 
                        placeholder={userToEdit ? t('leaveBlank') : ""}
                        required={!userToEdit}
                    />
                </div>
                <div>
                    <label htmlFor="role" className={labelClasses}>{t('role')}</label>
                    <select id="role" name="role" value={user.role} onChange={handleChange} className={inputClasses}>
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('saveUser')}</Button>
                </div>
            </form>
        </Modal>
    );
};