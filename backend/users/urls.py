"""
Users URL routing.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.me, name='user-me'),
    path('users/profile-photo/', views.upload_profile_photo, name='upload-profile-photo'),
    path('users/profile-photo/delete/', views.delete_profile_photo, name='delete-profile-photo'),
]

