
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import type { NetProfitData } from '../types';

interface NetProfitChartProps {
    data: NetProfitData[];
}

export const NetProfitChart: React.FC<NetProfitChartProps> = ({ data }) => {
    const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#84cc16" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};