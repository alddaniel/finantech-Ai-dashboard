
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import type { CashFlowData } from '../types';

interface CashFlowChartProps {
    data: CashFlowData[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '0.75rem'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};