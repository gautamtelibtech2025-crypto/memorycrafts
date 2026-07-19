"""
Templates app URL routing.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.TemplateListView.as_view(), name='template-list'),
    path('<slug:slug>/', views.TemplateDetailView.as_view(), name='template-detail'),
]
