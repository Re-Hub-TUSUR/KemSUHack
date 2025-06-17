import React from 'react';
import { Event } from '../types';
import { formatSingleDateTime } from '../utils/dateUtils';
import { CalendarIcon, LocationIcon, PencilIcon, TrashIcon } from './icons';

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
            return <div className="event-list-empty">Мероприятия не найдены. Попробуйте изменить фильтры.</div>;
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
                                loading="lazy"
                            />
                            <div className="event-card-type-badge">{event.event_type}</div>
                        </div>
                        <div className="event-card-content">
                            <header>
                                <div className="event-card-meta">
                                    <span><CalendarIcon size={16} /> {formatSingleDateTime(event.start_datetime)}</span>
                                    <span><LocationIcon size={16} /> {event.location}</span>
                                </div>
                                <h3 className="event-card-title" onClick={() => onViewDetails(event)} title={event.title}>
                                    {event.title}
                                </h3>
                            </header>
                            <p className="event-card-description">{event.description}</p>
                            <footer className="event-card-footer">
                                <div className="event-card-actions-wrapper">
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
                 {isLoading && <span className="event-list-loader-text">Обновление...</span>}
            </div>
            {renderContent()}
        </div>
    );
};

export default EventList;