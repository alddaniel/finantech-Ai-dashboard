
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import type { DefaultRateData } from '../types';

interface DefaultRateChartProps {
    data: DefaultRateData[];
}

export const DefaultRateChart: React.FC<DefaultRateChartProps> = ({ data }) => {
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                <YAxis tickFormatter={formatPercent} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                    formatter={(value: number) => [formatPercent(value), "Inadimplência"]}
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#f3f4f6' }}
                    cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="inadimplencia" name="Inadimplência" fill="#f59e0b" />
            </BarChart>
        </ResponsiveContainer>
    );
};