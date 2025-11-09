


import React, { useState } from 'react';
import { useApp } from '../../App';
import { Card, Button } from '../common/UI';
import { User } from '../../types';
import { UserForm } from './UserForm';

export const UsersPage: React.FC = () => {
    const { users, saveUser, deleteUser, t } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleAddUser = () => {
        setUserToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('users')}</h2>
                <Button onClick={handleAddUser}>{t('addUser')}</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-800 dark:bg-navy-900 dark:text-navy-200`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-end">
                                        <div className="space-x-2 rtl:space-x-reverse">
                                            <Button variant="secondary" onClick={() => handleEditUser(user)}>{t('edit')}</Button>
                                            <Button variant="danger" onClick={() => deleteUser(user.id)}>{t('delete')}</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <UserForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSave={saveUser}
                userToEdit={userToEdit}
            />
        </div>
    );
};