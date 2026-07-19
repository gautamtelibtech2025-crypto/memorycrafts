"""
DRF serializers for Category and Template models.
"""

from rest_framework import serializers
from .models import Category, Template


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'image_color', 'icon', 'display_order',
        ]
        read_only_fields = fields


class TemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for template list views."""
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Template
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_slug', 'category_name',
            'price', 'template_type', 'thumbnail',
            'ratio', 'is_featured',
        ]
        read_only_fields = fields


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Full serializer for template detail views."""
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Template
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_slug', 'category_name',
            'price', 'template_type', 'thumbnail',
            'preview_url', 'canva_url', 'ratio',
            'is_featured', 'created_at', 'updated_at',
        ]
        read_only_fields = fields
