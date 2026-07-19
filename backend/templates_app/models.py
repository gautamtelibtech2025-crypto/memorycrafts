"""
Templates app models — Category and Template models for MemoryCraft.

Category: Represents occasion types (birthday, wedding, etc.)
Template: Represents Canva templates or custom website offerings.
"""

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Occasion category for organizing templates.
    Maps to the frontend Category interface.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, default='')
    image_color = models.CharField(
        max_length=50,
        blank=True,
        default='bg-stone-50',
        help_text='Tailwind CSS background class for category card (e.g. bg-stone-50)'
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        default='Sparkles',
        help_text='Lucide icon name for category card (e.g. Cake, Heart, Sparkles)'
    )
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.IntegerField(
        default=0,
        help_text='Lower numbers appear first'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Template(models.Model):
    """
    A purchasable template — either a Canva template or custom website.
    Maps to the frontend template card data and CartItem/WishlistItem interfaces.
    """
    TEMPLATE_TYPE_CHOICES = [
        ('canva_template', 'Canva Template'),
        ('custom_website', 'Custom Website'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='templates'
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Price in USD'
    )
    template_type = models.CharField(
        max_length=20,
        choices=TEMPLATE_TYPE_CHOICES,
        default='canva_template',
        db_index=True
    )
    thumbnail = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text='External URL for template thumbnail image'
    )
    preview_url = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text='URL for live preview or demo'
    )
    canva_url = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text='Canva editor link (for canva_template type only)'
    )
    ratio = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Layout ratio descriptor (e.g. A4 Layout, 16:9 Landscape)'
    )
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Show in Featured Templates section'
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text='Only active templates are publicly visible'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']
        verbose_name = 'Template'
        verbose_name_plural = 'Templates'
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['template_type', 'is_active']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
