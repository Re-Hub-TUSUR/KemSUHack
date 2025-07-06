import logging
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta, timezone

from config import Config
from auth_routes import register_auth_routes
from models import db, bcrypt, Event, Role, ParticipantRoleEnum
from logging_config import setup_logging
from event_routes import register_event_routes
from notification_routes import register_notification_routes

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
register_event_routes(app, socketio)
register_notification_routes(app)

@app.cli.command("init-db")
def init_db_command():
    db.create_all()
    for role_enum in ParticipantRoleEnum:
        if not Role.query.filter_by(name=role_enum).first():
            db.session.add(Role(name=role_enum))
            print(f"Role '{role_enum.value}' created.")
    db.session.commit()
    print("Database initialized and roles populated.")

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

def check_upcoming_events():
    with app.app_context():
        now_utc = datetime.now(timezone.utc)
        soon_threshold = now_utc + timedelta(days=1)
        
        upcoming_events = Event.query.filter(
            Event.start_datetime > now_utc,
            Event.start_datetime <= soon_threshold,
            Event.notification_sent_at.is_(None)
        ).all()

        if upcoming_events:
            logger.info(f"Найдены предстоящие события для уведомления: {[e.id for e in upcoming_events]}")

        for event in upcoming_events:
            try:
                logger.info(f"Отправка уведомления о событии ID: {event.id} ('{event.title}')")
                local_start_time = event.start_datetime.strftime('%d.%m.%Y в %H:%M')
                notification_data = {
                    'eventId': event.id,
                    'title': 'Скоро начнется!',
                    'message': f"Мероприятие '{event.title}' начнется {local_start_time} (UTC).",
                }
                socketio.emit('upcoming_event', notification_data)
                event.notification_sent_at = now_utc
                db.session.add(event)
                logger.info(f"Уведомление 'upcoming_event' о событии ID: {event.id} отправлено.")
            except Exception as e:
                 logger.error(f"Ошибка при отправке уведомления 'upcoming_event' о событии ID {event.id}: {e}", exc_info=True)
                 db.session.rollback()
                 continue

        db.session.commit()

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