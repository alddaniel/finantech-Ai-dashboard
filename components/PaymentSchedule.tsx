
import React, { useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Transaction, View } from '../types';
import { VIEWS } from '../constants';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return '-';
    }
    // Handles both DD/MM/YYYY and YYYY-MM-DD, returns DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    return dateString;
};

const getStatusColor = (status: Transaction['status']): 'yellow' | 'blue' => {
    switch (status) {
        case 'Pendente': return 'yellow';
        case 'Agendado': return 'blue';
        default: return 'yellow';
    }
};

const parseDate = (dateStr: string): Date => {
    let date;
    // Check for DD/MM/YYYY format first
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            // new Date(year, monthIndex, day)
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) { // Check for YYYY-MM-DD format
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    // Return an invalid date if parsing failed
    return new Date(NaN);
};

interface PaymentScheduleProps {
    payables: Transaction[];
    selectedCompany: string;
    setActiveView: (view: View) => void;
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ payables, selectedCompany, setActiveView }) => {

    const scheduledPaymentsByDate = useMemo(() => {
        const companyPayables = payables.filter(p =>
            p.company === selectedCompany && (p.status === 'Pendente' || p.status === 'Agendado')
        );

        return companyPayables.reduce((acc, transaction) => {
            const dateKey = formatDate(transaction.dueDate);
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(transaction);
            return acc;
        }, {} as Record<string, Transaction[]>);

    }, [payables, selectedCompany]);

    const sortedDates = useMemo(() => {
        return Object.keys(scheduledPaymentsByDate).sort((dateA, dateB) => {
            const d1 = parseDate(dateA);
            const d2 = parseDate(dateB);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
            return d1.getTime() - d2.getTime();
        });
    }, [scheduledPaymentsByDate]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agendar Pagamentos</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        Adicione ou visualize suas contas a pagar pendentes e agendadas.
                    </p>
                </div>
                <button
                    onClick={() => setActiveView(VIEWS.PAYABLE)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                >
                    <PlusIcon />
                    <span className="ml-2">Novo Agendamento</span>
                </button>
            </div>

            {sortedDates.length > 0 ? (
                sortedDates.map(date => (
                    <div key={date}>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-gray-50/80 dark:bg-black/80 backdrop-blur-sm py-2 z-10">{date}</h2>
                        <div className="space-y-4">
                            {scheduledPaymentsByDate[date].map(transaction => (
                                <Card key={transaction.id} className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{transaction.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="font-bold text-red-500 text-lg">{formatCurrency(transaction.amount)}</p>
                                            <Badge color={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <Card>
                    <CardContent className="text-center py-20">
                         <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                             <CalendarIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Agenda Limpa!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Nenhum pagamento pendente ou agendado para esta empresa.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const CalendarIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
