"""
Templates app views — public read-only API for categories and templates.

Management operations (create/edit/delete) are restricted to Django Admin.
"""

from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django.db.models import Q

from .models import Category, Template
from .serializers import (
    CategorySerializer,
    TemplateListSerializer,
    TemplateDetailSerializer,
)


class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Returns all active categories ordered by display_order.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class CategoryDetailView(generics.RetrieveAPIView):
    """
    GET /api/categories/<slug>/
    Returns a single active category by slug.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class TemplateListView(generics.ListAPIView):
    """
    GET /api/templates/
    Returns active templates with optional filters:
      ?category=<slug>     — filter by category slug
      ?search=<term>       — search title/description
      ?featured=true       — featured templates only
      ?type=canva_template — filter by template_type
    """
    serializer_class = TemplateListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Template.objects.filter(is_active=True).select_related('category')

        # Category filter
        category_slug = self.request.query_params.get('category')
        if category_slug and category_slug != 'all':
            qs = qs.filter(category__slug=category_slug)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # Featured filter
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1', 'yes'):
            qs = qs.filter(is_featured=True)

        # Type filter
        template_type = self.request.query_params.get('type')
        if template_type in ('canva_template', 'custom_website'):
            qs = qs.filter(template_type=template_type)

        return qs


class TemplateDetailView(generics.RetrieveAPIView):
    """
    GET /api/templates/<slug>/
    Returns a single active template by slug with full detail.
    """
    serializer_class = TemplateDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Template.objects.filter(is_active=True).select_related('category')
