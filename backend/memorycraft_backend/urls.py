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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('users.urls')),
    path('api/templates/', include('templates_app.urls')),
    path('api/orders/', include('orders.urls')),
]
