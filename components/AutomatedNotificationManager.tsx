

import React, { useEffect, useRef } from 'react';
import type { Transaction, Notification } from '../types';

interface AutomatedNotificationManagerProps {
    payables: Transaction[];
    receivables: Transaction[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    notifications: Notification[];
}

const getFormattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const parseDate = (dateStr: string): Date => {
    let date;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
            date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
    } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
           date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
    }
    if (date && !isNaN(date.getTime())) {
        return date;
    }
    return new Date(NaN);
};


export const AutomatedNotificationManager: React.FC<AutomatedNotificationManagerProps> = ({
    payables,
    receivables,
    addNotification,
    notifications
}) => {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const todayStr = getFormattedDate(today);
        const tomorrowStr = getFormattedDate(tomorrow);

        // Check for items due tomorrow that require an email reminder
        const checkReminders = (transactions: Transaction[], type: 'pagamento' | 'recebimento') => {
            const notificationsToSend = transactions.filter(tx => 
                tx.status === 'Agendado' &&
                tx.notificationEmail &&
                tx.scheduledPaymentDate === tomorrowStr &&
                tx.notificationSentOn !== todayStr
            );

            notificationsToSend.forEach(tx => {
                addNotification({
                    type: 'payment_due_today',
                    title: `Lembrete de ${type}`,
                    description: `O item "${tx.description}" vence amanhã.`,
                    entityId: tx.id,
                    company: tx.company
                });
                // Here, you would also trigger the actual email sending logic.
                // For now, we just create the notification. The parent component
                // should update the `notificationSentOn` field if it needs to.
            });
        };

        // Check for newly overdue items
        const checkOverdue = (transactions: Transaction[], type: 'overdue_payable' | 'overdue_receivable') => {
            const overdueItems = transactions.filter(tx => {
                if (tx.status === 'Pendente') {
                    const dueDate = parseDate(tx.dueDate);
                    return !isNaN(dueDate.getTime()) && dueDate < today;
                }
                return false;
            });

            overdueItems.forEach(tx => {
                const existingNotification = notifications.find(n => n.entityId === tx.id && !n.isRead);
                if (!existingNotification) {
                    addNotification({
                        type: type,
                        title: type === 'overdue_payable' ? 'Conta a Pagar Vencida' : 'Conta a Receber Vencida',
                        description: `A transação "${tx.description}" venceu.`,
                        entityId: tx.id,
                        company: tx.company,
                    });
                }
            });
        };

        checkReminders(payables, 'pagamento');
        checkReminders(receivables, 'recebimento');
        checkOverdue(payables, 'overdue_payable');
        checkOverdue(receivables, 'overdue_receivable');

    }, [payables, receivables, addNotification, notifications]);

    return null; // This component does not render anything
};
