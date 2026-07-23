"""
URL configuration for memorycraft_backend project.

Routes:
    /api/health/  → core app (public)
    /api/me/      → users app (protected)
    /api/templates/ → templates_app (future)
    /api/orders/  → orders app (future)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def root_view(request):
    return JsonResponse({
        'name': 'MemoryCraft Backend API',
        'frontend_url': 'http://localhost:3000',
        'admin_url': 'http://localhost:8000/admin/',
        'endpoints': {
            'health': '/api/health/',
            'user_profile': '/api/me/',
            'categories': '/api/categories/',
            'templates': '/api/templates/',
            'orders': '/api/orders/',
        }
    })


from templates_app.views import AdminStatsView

urlpatterns = [
    path('', root_view, name='root-api-info'),
    path('admin/', admin.site.urls),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('api/', include('core.urls')),
    path('api/', include('users.urls')),
    path('api/categories/', include('templates_app.category_urls')),
    path('api/templates/', include('templates_app.urls')),
    path('api/orders/', include('orders.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


