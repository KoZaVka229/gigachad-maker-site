from .celery import app as celery_app
from loguru import logger


__all__ = ("celery_app",)

logger.add('logs', format='{time} {level} {message}')
