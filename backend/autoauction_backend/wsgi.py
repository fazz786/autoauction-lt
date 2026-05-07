"""
WSGI config for AutoAuction LT — used by gunicorn on Railway.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'autoauction_backend.settings')

application = get_wsgi_application()
