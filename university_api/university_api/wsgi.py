"""
WSGI config for university_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_api.settings')

django_app = get_wsgi_application()

# CORS wrapper to add headers to all responses
class CORSMiddleware:
    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        def cors_start_response(status, headers, exc_info=None):
            cors_headers = [
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ]
            headers = cors_headers + list(headers)
            return start_response(status, headers, exc_info)

        # Handle OPTIONS requests
        if environ.get('REQUEST_METHOD') == 'OPTIONS':
            cors_start_response('200 OK', [
                ('Content-Type', 'text/plain'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ])
            return [b'']

        return self.application(environ, cors_start_response)

application = CORSMiddleware(django_app)
