import React, { useState } from 'react';
import type { User, Company } from '../types';

interface RegisterProps {
    users: User[];
    onRegisterSuccess: (newUser: User, newCompany: Company) => void;
    onSwitchToLogin: () => void;
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

export const Register: React.FC<RegisterProps> = ({ users, onRegisterSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedName = formData.name.trim();
        const trimmedCompanyName = formData.companyName.trim();
        const trimmedEmail = formData.email.trim();
        const password = formData.password;

        if (!trimmedName || !trimmedCompanyName || !trimmedEmail || !password) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        if (users.some(user => user.email.toLowerCase() === trimmedEmail.toLowerCase())) {
            setError('Este e-mail já está cadastrado. Por favor, use um e-mail diferente ou faça login.');
            return;
        }

        const newUser: User = {
            id: `user${Date.now()}`,
            name: trimmedName,
            email: trimmedEmail,
            password: password,
            role: 'Admin', // First user of a company is an Admin
            avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(trimmedEmail)}`,
            accessibleCompanies: [trimmedCompanyName],
        };

        const newCompany: Company = {
            id: `comp${Date.now()}`,
            name: trimmedCompanyName,
            cnpj: '', // Not asking for this in registration for simplicity
            address: '', // Not asking for this in registration for simplicity
        };
        
        onRegisterSuccess(newUser, newCompany);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex items-center justify-center gap-3">
                    <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">FinanTech AI</h1>
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Crie sua nova conta
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-xl sm:px-10 ring-1 ring-slate-900/5 dark:ring-white/10">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</label>
                            <div className="mt-1">
                                <input id="companyName" name="companyName" type="text" required value={formData.companyName} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço de e-mail</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        <div>
                            <button type="submit" className="w-full flex justify-center mt-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Registrar e Entrar
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Já tem uma conta?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Faça login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};