import React, { useState } from 'react';
import type { User } from '../types';

const inputStyle = "block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

interface LoginProps {
    users: User[];
    onLoginSuccess: (user: User) => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();
        // Make email check case-insensitive
        const user = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
        
        // Check for user existence AND correct password
        if (user && user.password === password) {
            onLoginSuccess(user);
        } else {
            setError('E-mail ou senha inválidos. Por favor, tente novamente.');
        }
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
                    Acesse sua conta
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/20 dark:shadow-black/60 rounded-xl sm:px-10 ring-1 ring-slate-900/5 dark:ring-white/10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Endereço de e-mail
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 rounded-md">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Não tem uma conta?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Registre-se aqui
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};