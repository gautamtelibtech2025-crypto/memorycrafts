"""
Django Admin registration for Category and Template models.
"""

from django.contrib import admin
from .models import Category, Template


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'display_order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug', 'description')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order', 'name')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'template_type', 'is_featured', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_featured', 'template_type', 'category')
    search_fields = ('title', 'slug', 'description')
    list_editable = ('is_featured', 'is_active', 'price')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('category',)
    ordering = ('-is_featured', '-created_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'description', 'category')
        }),
        ('Pricing & Type', {
            'fields': ('price', 'template_type', 'ratio')
        }),
        ('Links', {
            'fields': ('thumbnail', 'preview_url', 'canva_url')
        }),
        ('Visibility', {
            'fields': ('is_featured', 'is_active')
        }),
    )
