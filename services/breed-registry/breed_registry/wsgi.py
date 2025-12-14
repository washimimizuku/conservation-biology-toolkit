"""
WSGI config for breed_registry project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'breed_registry.settings')

application = get_wsgi_application()