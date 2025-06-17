import React from 'react';
import '../../styles/profile/NotificationsCard.css';

const ToggleSwitch = ({ label, id }: { label: string, id: string }) => (
    <div className="toggle-switch-wrapper">
        <label htmlFor={id}>{label}</label>
        <label className="switch">
            <input type="checkbox" id={id} defaultChecked />
            <span className="slider round"></span>
        </label>
    </div>
);

const NotificationsCard = () => {
    return (
        <div className="card notifications-card">
            <h4>Уведомления</h4>
            <div className="notifications-list">
                <ToggleSwitch id="notif-reminder" label="Напоминания о предстоящих событиях" />
            </div>
        </div>
    );
};

export default NotificationsCard;