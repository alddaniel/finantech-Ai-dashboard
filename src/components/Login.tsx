import React, { useState } from 'react';
import type { User } from '../types';

const inputStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";


interface LoginProps {
    users: User[];
    onLoginSuccess: (user: User, company: string) => void;
    onSuperAdminLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLoginSuccess, onSuperAdminLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuperAdminLogin, setIsSuperAdminLogin] = useState(false);
    
    const [step, setStep] = useState<'credentials' | 'company_selection'>('credentials');
    const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string>('');


    const handleCredentialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        
        if (!user) {
            setError('E-mail ou senha inválidos.');
            return;
        }

        if (user.accessibleCompanies.length === 0) {
            setError('Este usuário não tem acesso a nenhuma empresa.');
            return;
        }

        if (user.accessibleCompanies.length === 1) {
            onLoginSuccess(user, user.accessibleCompanies[0]);
        } else {
            setAuthenticatedUser(user);
            setSelectedCompany(user.accessibleCompanies[0]);
            setStep('company_selection');
        }
    };

    const handleCompanySelectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authenticatedUser && selectedCompany) {
            onLoginSuccess(authenticatedUser, selectedCompany);
        } else {
            setError('Ocorreu um erro. Por favor, tente fazer login novamente.');
            setStep('credentials');
        }
    };

    const handleSuperAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Find the specific super admin user
        const superAdmin = users.find(u => 
            u.email.toLowerCase() === 'ddarruspe@gmail.com' && 
            u.password === '1906'
        );

        if (superAdmin && superAdmin.email.toLowerCase() === email.trim().toLowerCase() && superAdmin.password === password) {
            onSuperAdminLoginSuccess(superAdmin);
        } else {
            setError('Credenciais de Super Administrador inválidas.');
        }
    };
    
    const resetToLogin = () => {
        setIsSuperAdminLogin(false);
        setStep('credentials');
        setAuthenticatedUser(null);
        setError('');
        setEmail('');
        setPassword('');
    };

    const renderHeader = () => (
        <>
            <div className="flex items-center justify-center gap-3">
                <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12h2v6H8v-6zm3-3h2v9h-2V9zm3-4h2v13h-2V5z"/>
                    </svg>
                </div>
                <h1 className="text-3xl text-center sm:text-4xl font-bold text-gray-800 dark:text-white font-lexend">FinanTech AI</h1>
            </div>
             <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isSuperAdminLogin ? 'Acesso Global' : 'Acesse sua conta'}
            </h2>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                {renderHeader()}
                <div className="mt-8">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-xl sm:px-10 ring-1 ring-slate-900/5 dark:ring-white/10">
                        {isSuperAdminLogin ? (
                            <form className="space-y-6" onSubmit={handleSuperAdminSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail do Super Admin</label>
                                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                                    <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} />
                                </div>
                                {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md"><p className="text-sm">{error}</p></div>}
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                                        Entrar no Painel
                                    </button>
                                </div>
                                 <p className="mt-2 text-center text-sm">
                                    <a href="#" onClick={(e) => { e.preventDefault(); resetToLogin(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        Voltar para login de usuário
                                    </a>
                                </p>
                            </form>
                        ) : step === 'credentials' ? (
                            <form className="space-y-6" onSubmit={handleCredentialSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                                    <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} />
                                </div>
                                {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md"><p className="text-sm">{error}</p></div>}
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                        Entrar
                                    </button>
                                </div>
                            </form>
                        ) : (
                             <form className="space-y-6" onSubmit={handleCompanySelectionSubmit}>
                                <div className="text-center">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Bem-vindo, {authenticatedUser?.name}!</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Selecione a empresa para continuar.</p>
                                </div>
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Empresa</label>
                                    <select id="companyName" name="companyName" required value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className={`${selectStyle} mt-1`}>
                                        {authenticatedUser?.accessibleCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                        Acessar Empresa
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="mt-6 text-center text-xs">
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSuperAdminLogin(true); setError(''); }} className="font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                Acesso do Administrador do Sistema
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
