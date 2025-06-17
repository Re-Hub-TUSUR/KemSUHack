import React, { useState } from 'react';
import { Event } from '../../types';
import { formatSingleDateTime } from '../../utils/dateUtils';
import '../../styles/profile/UserEventsCard.css';

interface UserEventsCardProps {
    upcomingEvents: Event[];
    pastEvents: Event[];
}

const EventItem: React.FC<{event: Event}> = ({ event }) => (
    <div className="profile-event-item">
        <div className="profile-event-date">
            <span>{new Date(event.start_datetime).getDate()}</span>
            <span>{new Date(event.start_datetime).toLocaleString('ru-RU', { month: 'short' })}</span>
        </div>
        <div className="profile-event-info">
            <h4 className="profile-event-title">{event.title}</h4>
            <p className="profile-event-datetime">{formatSingleDateTime(event.start_datetime)}</p>
        </div>
        <a href={`/events/${event.id}`} className="profile-event-link">→</a>
    </div>
);


const UserEventsCard: React.FC<UserEventsCardProps> = ({ upcomingEvents, pastEvents }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const eventsToShow = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

    return (
        <div className="card profile-events-card">
            <h3>Мои мероприятия</h3>
            <div className="profile-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Предстоящие
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Прошедшие
                </button>
            </div>
            <div className="profile-events-list">
                {eventsToShow.length > 0 ? (
                    eventsToShow.map(event => <EventItem key={event.id} event={event} />)
                ) : (
                    <p className="no-events-placeholder">
                        {activeTab === 'upcoming' ? 'Нет предстоящих мероприятий.' : 'Нет прошедших мероприятий.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserEventsCard;