import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gigachad_maker_site.settings')

app = Celery('gigachad_maker_site')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
