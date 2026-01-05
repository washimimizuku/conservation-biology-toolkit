"""
URL configuration for breed_registry project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Breed Registry API',
        'version': '2.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api-root'),
]