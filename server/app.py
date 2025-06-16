import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta, timezone

from config import Config
from auth_routes import register_auth_routes
from models import db, bcrypt, Event
from logging_config import setup_logging
from event_routes import register_event_routes

setup_logging()
logger = logging.getLogger(__name__)

async_mode = 'eventlet'
app = Flask(__name__)
app.config.from_object(Config)

if not app.config.get('SECRET_KEY'):
    logger.error("FLASK_SECRET_KEY не установлен! SocketIO может работать некорректно.")

socketio = SocketIO(app, cors_allowed_origins=Config.CORS_ORIGINS, async_mode=async_mode)

CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}}, supports_credentials=True)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

register_auth_routes(app)
register_event_routes(app)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

upcoming_event_notifications_sent = set()

def check_upcoming_events():
    with app.app_context():
        now = datetime.now(timezone.utc)
        soon_threshold = now + timedelta(days=1)
        upcoming = Event.query.filter(
            Event.start_datetime > now,
            Event.start_datetime <= soon_threshold,
            Event.id.notin_(upcoming_event_notifications_sent)
        ).all()

        if upcoming:
            logger.info(f"Найдены предстоящие события (за день) для уведомления: {[e.id for e in upcoming]}")

        for event in upcoming:
            try:
                logger.info(f"Отправка уведомления о событии ID: {event.id} ('{event.title}')")
                notification_data = {
                    'eventId': event.id,
                    'title': 'Скоро начнется!',
                    'message': f"Мероприятие '{event.title}' начнется {event.start_datetime.strftime('%d.%m.%Y в %H:%M')} (UTC).",
                }
                socketio.emit('upcoming_event', notification_data)
                upcoming_event_notifications_sent.add(event.id)
                logger.info(f"Уведомление 'upcoming_event' о событии ID: {event.id} отправлено.")
            except Exception as e:
                 logger.error(f"Ошибка при отправке уведомления 'upcoming_event' о событии ID {event.id}: {e}", exc_info=True)

        cleanup_threshold = now - timedelta(days=1)
        expired_ids = set()
        current_sent_ids = list(upcoming_event_notifications_sent)

        for event_id in current_sent_ids:
            event = Event.query.get(event_id)
            if event is None:
                expired_ids.add(event_id)
                continue

            event_start_dt_naive = event.start_datetime
            if event_start_dt_naive.tzinfo is None:
                 event_start_dt_aware = event_start_dt_naive.replace(tzinfo=timezone.utc)
            else:
                 event_start_dt_aware = event_start_dt_naive

            if event_start_dt_aware < cleanup_threshold:
                expired_ids.add(event_id)

        if expired_ids:
             upcoming_event_notifications_sent.difference_update(expired_ids)
             logger.info(f"Очищены старые ID уведомлений: {expired_ids}")

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(check_upcoming_events, 'interval', minutes=5)
scheduler.start()
logger.info("Планировщик уведомлений запущен.")

@socketio.on('connect')
def handle_connect():
    logger.info(f'Клиент подключился: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f'Клиент отключился: {request.sid}')


if __name__ == '__main__':
    logger.info("Запуск Flask-SocketIO приложения...")
    socketio.run(app, debug=Config.DEBUG, host='0.0.0.0', port=5000, use_reloader=Config.DEBUG)