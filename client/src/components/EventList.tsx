import React from 'react';
import { Event } from '../types';

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const PeopleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.447 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.65m12.02 0a4.97 4.97 0 01-2.07.65c.04-.212.048-.432.025-.654a6.484 6.484 0 00-1.905-3.959 3 3 0 014.308 3.516.78.78 0 01-.358.447zM14 8a2 2 0 11-4 0 2 2 0 014 0zm-8.29 6.99a4.992 4.992 0 012.582-2.995 5.485 5.485 0 011.414 1.079 5.485 5.485 0 011.414-1.079 4.992 4.992 0 012.582 2.995M14 13H6v2h8v-2z" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
    </svg>
);

const formatSingleDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Неверная дата';
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleTimeString('ru-RU', options);
    } catch (e) {
        return 'Ошибка даты';
    }
};

interface EventListProps {
    events: Event[];
    isLoading: boolean;
    error: string | null;
    isAdmin: boolean;
    onViewDetails: (event: Event) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (eventId: number) => void;
}

const EventList: React.FC<EventListProps> = ({
    events,
    isLoading,
    error,
    isAdmin,
    onViewDetails,
    onEdit,
    onDelete
}) => {

    const renderContent = () => {
        if (isLoading) {
            return <div className="event-list-loading">Загрузка мероприятий...</div>;
        }
        if (error) {
            return <div className="event-list-error">Ошибка: {error}</div>;
        }
        if (events.length === 0) {
            return <div className="event-list-empty">Мероприятия не найдены.</div>;
        }
        return (
            <div className="event-grid">
                {events.map(event => (
                    <article key={event.id} className="event-card">
                        <div className="event-card-image-wrapper" onClick={() => onViewDetails(event)}>
                            <img 
                                src={event.image_url || '/assets/main/card-background.jpg'} 
                                alt={event.title} 
                                className="event-card-image"
                            />
                            <div className="event-card-type-badge">{event.event_type}</div>
                        </div>
                        <div className="event-card-content">
                            <header>
                                <div className="event-card-meta">
                                    <span><CalendarIcon /> {formatSingleDateTime(event.start_datetime)}</span>
                                    <span><LocationIcon /> {event.location}</span>
                                </div>
                                <h3 className="event-card-title" onClick={() => onViewDetails(event)} title={event.title}>
                                    {event.title}
                                </h3>
                            </header>
                            <p className="event-card-description">{event.description}</p>
                            <footer className="event-card-footer">
                                <div className="event-card-roles">
                                    <PeopleIcon />
                                    <div className="event-card-role-tags">
                                        {event.roles_available.slice(0, 3).map(role => (
                                            <span key={role} className="role-tag">{role}</span>
                                        ))}
                                        {event.roles_available.length > 3 && (
                                            <span className="role-tag more-tag">...</span>
                                        )}
                                    </div>
                                </div>
                                <div className="event-card-actions">
                                    <button onClick={() => onViewDetails(event)} className="secondary-btn">Подробнее</button>
                                    {isAdmin && onEdit && onDelete && (
                                        <div className="admin-actions">
                                            <button onClick={() => onEdit(event)} className="admin-action-btn edit-btn" title="Редактировать" aria-label="Редактировать мероприятие"><PencilIcon /></button>
                                            <button onClick={() => onDelete(event.id)} className="admin-action-btn delete-btn" title="Удалить" aria-label="Удалить мероприятие"><TrashIcon /></button>
                                        </div>
                                    )}
                                </div>
                            </footer>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    return (
         <div className="card event-list-card">
            <div className="event-list-header">
                <h2>Список мероприятий</h2>
                 {isLoading && <span style={{ fontSize: '0.9em', color: '#777' }}>Обновление...</span>}
            </div>
            {renderContent()}
        </div>
    );
};

export default EventList;