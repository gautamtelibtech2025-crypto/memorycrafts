"""
DRF serializers for Category and Template models.
"""

from rest_framework import serializers
from .models import Category, Template


class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'image_color', 'icon', 'display_order', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for template list views."""
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Template
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_slug', 'category_name',
            'price', 'template_type', 'thumbnail',
            'ratio', 'is_featured', 'is_active',
        ]
        read_only_fields = ['id', 'category_slug', 'category_name']


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Full serializer for template detail views."""
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Template
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_slug', 'category_name',
            'price', 'template_type', 'thumbnail',
            'preview_url', 'canva_url', 'ratio',
            'is_featured', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'category_slug', 'category_name', 'created_at', 'updated_at']

