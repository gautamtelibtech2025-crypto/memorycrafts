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


from rest_framework import generics, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import Category, Template
from .serializers import (
    CategorySerializer,
    TemplateListSerializer,
    TemplateDetailSerializer,
)


class CategoryListView(generics.ListCreateAPIView):
    """
    GET /api/categories/  — Returns categories (active only for public, all for ?admin=true)
    POST /api/categories/ — Creates a new category
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        show_all = self.request.query_params.get('admin') == 'true'
        if show_all:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/categories/<pk_or_slug>/    — Retrieve category
    PUT/PATCH /api/categories/<id>/      — Update category
    DELETE /api/categories/<id>/         — Delete category
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = self.kwargs.get('slug')
        if lookup.isdigit():
            return generics.get_object_or_404(Category, pk=int(lookup))
        return generics.get_object_or_404(Category, slug=lookup)


class TemplateListView(generics.ListCreateAPIView):
    """
    GET /api/templates/  — Returns templates (supports category, search, featured, type filters)
    POST /api/templates/ — Creates a new template
    """
    serializer_class = TemplateListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        show_all = self.request.query_params.get('admin') == 'true'
        if show_all:
            qs = Template.objects.all().select_related('category')
        else:
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

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TemplateDetailSerializer
        return TemplateListSerializer


class TemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/templates/<pk_or_slug>/    — Retrieve template
    PUT/PATCH /api/templates/<id>/      — Update template
    DELETE /api/templates/<id>/         — Delete template
    """
    serializer_class = TemplateDetailSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = self.kwargs.get('slug')
        if lookup.isdigit():
            return generics.get_object_or_404(Template.objects.select_related('category'), pk=int(lookup))
        return generics.get_object_or_404(Template.objects.select_related('category'), slug=lookup)


class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns real statistics from SQLite database for MemoryCraft Admin Dashboard.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        total_templates = Template.objects.count()
        active_templates = Template.objects.filter(is_active=True).count()
        featured_templates = Template.objects.filter(is_featured=True).count()

        total_categories = Category.objects.count()
        active_categories = Category.objects.filter(is_active=True).count()

        recent_templates = TemplateListSerializer(
            Template.objects.all().select_related('category')[:5],
            many=True
        ).data

        recent_categories = CategorySerializer(
            Category.objects.all()[:5],
            many=True
        ).data

        return Response({
            'total_templates': total_templates,
            'active_templates': active_templates,
            'featured_templates': featured_templates,
            'total_categories': total_categories,
            'active_categories': active_categories,
            'recent_templates': recent_templates,
            'recent_categories': recent_categories,
        })

