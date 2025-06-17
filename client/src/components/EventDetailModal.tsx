import React from 'react';
import { Event } from '../types';
import { formatDate, formatDateTimeRange } from '../utils/dateUtils';
import { CalendarIcon, LocationIcon, TypeIcon, LinkIcon, InfoIcon } from './icons';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) {
        return null;
    }

    const renderLink = (url: string | null | undefined, label: string) => {
        if (!url) return null;
        const validUrl = url.startsWith('http://') || url.startsWith('https://');
        const displayUrl = validUrl ? url : `http://${url}`;
        return (
            <div className="meta-item">
                <LinkIcon />
                <a href={displayUrl} target="_blank" rel="noopener noreferrer">{label}</a>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content event-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="event-detail-close-btn"
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <h2>{event.title}</h2>

                <div className="detail-section description-section">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
                </div>

                <div className="detail-section meta-section">
                    <h4>Детали</h4>
                    <div className="meta-item">
                        <CalendarIcon />
                        <span>{formatDateTimeRange(event.start_datetime, event.end_datetime)}</span>
                    </div>
                    <div className="meta-item">
                        <LocationIcon />
                        <span>{event.location}{event.location_details ? ` - ${event.location_details}` : ''}</span>
                    </div>
                     <div className="meta-item">
                        <TypeIcon />
                        <span>{event.event_type}</span>
                    </div>
                </div>

                 <div className="detail-section roles-section">
                     <h4>Доступные роли</h4>
                     {event.roles_available && event.roles_available.length > 0 ? (
                         <div className="roles-list">
                             {event.roles_available.map(role => (
                                 <span key={role} className="role-tag">{role}</span>
                             ))}
                         </div>
                     ) : (
                         <p>Роли не указаны.</p>
                     )}
                </div>

                 {(event.registration_link_participant || event.registration_link_volunteer || event.registration_link_organizer) && (
                    <div className="detail-section registration-section">
                        <h4>Регистрация</h4>
                        {renderLink(event.registration_link_participant, 'Ссылка для Участников')}
                        {renderLink(event.registration_link_volunteer, 'Ссылка для Волонтёров')}
                        {renderLink(event.registration_link_organizer, 'Ссылка для Организаторов')}
                    </div>
                 )}

                <div className="detail-section info-section">
                     <h4>Информация</h4>
                     <div className="meta-item">
                        <InfoIcon />
                        <span>Добавлено: {formatDate(event.created_at, true)} {event.author_username ? `(${event.author_username})` : ''}</span>
                    </div>
                     <div className="meta-item">
                        <InfoIcon />
                        <span>Обновлено: {formatDate(event.updated_at, true)}</span>
                    </div>
                 </div>

            </div>
        </div>
    );
};

export default EventDetailModal;