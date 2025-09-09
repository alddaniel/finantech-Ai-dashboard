import React from 'react';
import type { Notification, View } from '../types';

interface NotificationCenterProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: Notification) => void;
}

const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return "agora mesmo";
};

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const baseClass = "w-6 h-6";
    switch (type) {
        case 'overdue_payable':
        case 'overdue_receivable':
            return <svg className={`${baseClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
        case 'accountant_request':
            return <svg className={`${baseClass} text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
        case 'payment_due_today':
            return <svg className={`${baseClass} text-cyan-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
        default:
            return <svg className={`${baseClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
    }
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead, onNotificationClick }) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleItemClick = (notification: Notification) => {
        onNotificationClick(notification);
    };
    
    return (
        <div 
          className="absolute bottom-20 left-72 ml-4 w-80 md:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col max-h-[60vh] z-30"
          onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllAsRead} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Marcar todas como lidas
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {notifications.map(n => (
                            <li 
                                key={n.id} 
                                className={`flex items-start p-4 gap-3 cursor-pointer transition-colors ${n.isRead ? 'opacity-70' : 'bg-indigo-50/50 dark:bg-indigo-500/10'} hover:bg-slate-100 dark:hover:bg-slate-800`}
                                onClick={() => handleItemClick(n)}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <NotificationIcon type={n.type} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{n.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{n.description}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{timeAgo(n.timestamp)}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-8">
                        <p className="text-slate-500 dark:text-slate-400">Você não tem nenhuma notificação.</p>
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center">
                 <button onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-full py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    Fechar
                </button>
            </div>
        </div>
    );
};