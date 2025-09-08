import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Company, User, AccountantRequest } from '../types';

// styles
const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const textareaStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return '-';
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
};

interface AccountantPanelProps {
    users: User[];
    companies: Company[];
    accountantRequests: AccountantRequest[];
    setAccountantRequests: React.Dispatch<React.SetStateAction<AccountantRequest[]>>;
    currentUser: User;
}

const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);


export const AccountantPanel: React.FC<AccountantPanelProps> = ({ users, companies, accountantRequests, setAccountantRequests, currentUser }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        assignedToId: '',
        requestType: 'documento' as AccountantRequest['requestType'],
        subject: '',
        details: '',
        priority: 'Medium' as 'High' | 'Medium' | 'Low'
    });
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

    const accessibleCompanies = useMemo(() => {
        return companies.filter(c => currentUser.accessibleCompanies.includes(c.name));
    }, [companies, currentUser]);

    const assignableUsers = useMemo(() => {
        if (!formData.company) return [];
        return users.filter(u => (u.role === 'Admin' || u.role === 'Manager') && u.accessibleCompanies.includes(formData.company));
    }, [users, formData.company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRequest: AccountantRequest = {
            id: `req${Date.now()}`,
            company: formData.company,
            requesterId: currentUser.id,
            requesterName: currentUser.name,
            assignedToId: formData.assignedToId,
            requestType: formData.requestType,
            subject: formData.subject,
            details: formData.details,
            status: 'Pendente',
            createdAt: new Date().toISOString().split('T')[0],
            priority: formData.priority,
        };
        setAccountantRequests(prev => [newRequest, ...prev]);
        setFormData({ company: '', assignedToId: '', requestType: 'documento', subject: '', details: '', priority: 'Medium' });
        setIsFormVisible(false);
    };
    
    const handleStatusChange = (id: string, newStatus: 'Resolvido' | 'Cancelado') => {
        setAccountantRequests(prev => prev.map(req => req.id === id ? {...req, status: newStatus, resolvedAt: newStatus === 'Resolvido' ? new Date().toISOString().split('T')[0] : undefined} : req));
    }

    const myRequests = useMemo(() => {
        return accountantRequests.filter(req => {
            const isMyRequest = req.requesterId === currentUser.id;
            const matchesPriority = priorityFilter === 'all' || (req.priority || 'Medium') === priorityFilter;
            return isMyRequest && matchesPriority;
        });
    }, [accountantRequests, currentUser.id, priorityFilter]);

    const getPriorityBadgeColor = (priority: 'High' | 'Medium' | 'Low' | undefined): 'red' | 'yellow' | 'blue' => {
        switch (priority) {
            case 'High': return 'red';
            case 'Medium': return 'yellow';
            case 'Low': return 'blue';
            default: return 'yellow';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel do Contador</h1>
                <button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                >
                    {isFormVisible ? <ChevronUpIcon /> : <PlusIcon />}
                    <span className="ml-2">{isFormVisible ? 'Fechar Formulário' : 'Nova Solicitação'}</span>
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-900/5 dark:border-white/10">
                            <h2 className="text-xl font-semibold">Criar Nova Solicitação</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField label="Empresa" name="company" value={formData.company} onChange={handleChange}>
                                    <option value="">Selecione a empresa</option>
                                    {accessibleCompanies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </SelectField>
                                <SelectField label="Atribuir Para" name="assignedToId" value={formData.assignedToId} onChange={handleChange} disabled={!formData.company}>
                                    <option value="">Selecione o responsável</option>
                                    {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </SelectField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Solicitação</label>
                                    <div className="flex gap-4">
                                        <RadioInput label="Documento" name="requestType" value="documento" checked={formData.requestType === 'documento'} onChange={handleChange} />
                                        <RadioInput label="Esclarecimento" name="requestType" value="esclarecimento" checked={formData.requestType === 'esclarecimento'} onChange={handleChange} />
                                        <RadioInput label="Lançamento" name="requestType" value="lançamento" checked={formData.requestType === 'lançamento'} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridade</label>
                                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className={selectStyle}>
                                        <option value="High">Alta</option>
                                        <option value="Medium">Média</option>
                                        <option value="Low">Baixa</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assunto</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Ex: NF de compra de monitores" className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="details" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Detalhes</label>
                                <textarea id="details" name="details" value={formData.details} onChange={handleChange} required rows={3} placeholder="Forneça detalhes claros sobre o que você precisa..." className={textareaStyle}></textarea>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-xl px-6 py-4 flex justify-end gap-3 border-t border-slate-900/5 dark:border-white/10">
                            <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                                Enviar Solicitação
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Card className="!p-0">
                <CardHeader className="p-6">
                    <h2 className="text-xl font-semibold">Minhas Solicitações</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtrar por prioridade:</span>
                        <FilterButton label="Todas" isActive={priorityFilter === 'all'} onClick={() => setPriorityFilter('all')} />
                        <FilterButton label="Alta" isActive={priorityFilter === 'High'} onClick={() => setPriorityFilter('High')} />
                        <FilterButton label="Média" isActive={priorityFilter === 'Medium'} onClick={() => setPriorityFilter('Medium')} />
                        <FilterButton label="Baixa" isActive={priorityFilter === 'Low'} onClick={() => setPriorityFilter('Low')} />
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Assunto / Empresa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Prioridade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {myRequests.map(req => (
                                    <tr key={req.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap"><p className="font-semibold text-gray-900 dark:text-white">{req.subject}</p><p className="text-sm text-gray-500 dark:text-gray-400">{req.company}</p></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(req.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{req.requestType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><Badge color={req.status === 'Pendente' ? 'yellow' : req.status === 'Resolvido' ? 'green' : 'red'}>{req.status}</Badge></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={getPriorityBadgeColor(req.priority)}>
                                                {req.priority || 'Medium'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {req.status === 'Pendente' && <>
                                                <button onClick={() => handleStatusChange(req.id, 'Resolvido')} className="font-semibold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">Resolver</button>
                                                <button onClick={() => handleStatusChange(req.id, 'Cancelado')} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Cancelar</button>
                                            </>}
                                        </td>
                                    </tr>
                                ))}
                                {myRequests.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma solicitação encontrada.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Form helper components
const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, disabled?: boolean}> = ({ label, name, value, onChange, children, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className={`${selectStyle} disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`}>{children}</select>
    </div>
);

const RadioInput: React.FC<{label: string, name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
);

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const ChevronUpIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;