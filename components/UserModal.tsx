
import React, { useState, useEffect } from 'react';
import type { User, Role, Company } from '../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    userToEdit: User | null;
    companies: Company[];
    isAccountantModuleEnabled: boolean;
}

const defaultAvatar = 'https://i.pravatar.cc/150?u=newuser';
const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit, companies, isAccountantModuleEnabled }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        role: 'Analyst' as Role,
        avatar: defaultAvatar,
        accessibleCompanies: [] as string[],
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                ...userToEdit,
                password: '' // Clear password on edit for security and to prevent showing it.
            });
        } else {
            setFormData({
                id: '',
                name: '',
                email: '',
                password: '',
                role: 'Analyst',
                avatar: `${defaultAvatar}${Date.now()}`,
                accessibleCompanies: [],
            });
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyAccessChange = (companyName: string) => {
        setFormData(prev => {
            const newAccess = prev.accessibleCompanies.includes(companyName)
                ? prev.accessibleCompanies.filter(c => c !== companyName)
                : [...prev.accessibleCompanies, companyName];
            return { ...prev, accessibleCompanies: newAccess };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (userToEdit) {
            // Editing existing user
            const updatedUser = {
                ...userToEdit,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                accessibleCompanies: formData.accessibleCompanies,
                // Only update password if a new one was entered
                password: formData.password ? formData.password : userToEdit.password,
            };
            onSave(updatedUser);
        } else {
            // Creating new user
            if (!formData.password) {
                alert('A senha é obrigatória para novos usuários.');
                return;
            }
            onSave(formData as User);
        }
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyle} />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder={userToEdit ? "Deixe em branco para não alterar" : ""}
                                required={!userToEdit}
                                className={inputStyle} 
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} className={selectStyle}>
                                <option>Analyst</option>
                                <option>Manager</option>
                                <option>Admin</option>
                                {isAccountantModuleEnabled && <option>Contador</option>}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Acesso às Empresas</label>
                             <div className="mt-2 space-y-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                {companies.map(company => (
                                    <label key={company.id} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.accessibleCompanies.includes(company.name)} 
                                            onChange={() => handleCompanyAccessChange(company.name)}
                                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="ml-3 text-slate-700 dark:text-slate-200">{company.name}</span>
                                    </label>
                                ))}
                             </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                            Salvar Usuário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
