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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('users.urls')),
    path('api/templates/', include('templates_app.urls')),
    path('api/orders/', include('orders.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

