"""
Management command to seed categories and templates from existing frontend data.

Usage:
    python manage.py seed_templates

Safe to run multiple times — uses get_or_create to prevent duplicates.
"""

from django.core.management.base import BaseCommand
from templates_app.models import Category, Template


# Existing frontend categories from types.ts CATEGORIES constant
SEED_CATEGORIES = [
    {
        'name': 'Birthday',
        'slug': 'birthday',
        'description': 'Celebrate another year of life with bespoke typography and layouts.',
        'image_color': 'bg-stone-50',
        'icon': 'Cake',
        'display_order': 1,
    },
    {
        'name': 'Wedding',
        'slug': 'wedding',
        'description': 'Timeless invitations, guest books, and digital reception programs.',
        'image_color': 'bg-neutral-50',
        'icon': 'Heart',
        'display_order': 2,
    },
    {
        'name': 'Anniversary',
        'slug': 'anniversary',
        'description': 'Reignite milestones with elegant timeline journals and photo cards.',
        'image_color': 'bg-slate-50',
        'icon': 'Sparkles',
        'display_order': 3,
    },
    {
        'name': 'Proposal',
        'slug': 'proposal',
        'description': 'Dramatic, breathtaking custom proposal sites and secret countdowns.',
        'image_color': 'bg-stone-100/50',
        'icon': 'Flame',
        'display_order': 4,
    },
    {
        'name': 'Friendship',
        'slug': 'friendship',
        'description': 'Celebrate childhood bonds, shared journeys, and digital scrapbooks.',
        'image_color': 'bg-zinc-50',
        'icon': 'Smile',
        'display_order': 5,
    },
    {
        'name': 'Parents',
        'slug': 'parents',
        'description': 'Honoring mothers and fathers with warm, nostalgic memory vaults.',
        'image_color': 'bg-neutral-100/50',
        'icon': 'Users',
        'display_order': 6,
    },
    {
        'name': 'Teacher',
        'slug': 'teacher',
        'description': 'Sleek, meaningful digital thank you boards and classroom boards.',
        'image_color': 'bg-slate-100/50',
        'icon': 'GraduationCap',
        'display_order': 7,
    },
    {
        'name': 'Farewell',
        'slug': 'farewell',
        'description': 'Graceful departure logs, digital memory registries, and well wishes.',
        'image_color': 'bg-stone-50',
        'icon': 'Compass',
        'display_order': 8,
    },
]

# Existing frontend placeholder templates from TemplateSection.tsx
SEED_TEMPLATES = [
    {
        'title': 'Editorial Invitation Bundle',
        'slug': 'editorial-invitation-bundle',
        'description': 'A premium editorial-style invitation suite with elegant typography and minimalist layouts. Perfect for weddings and formal celebrations.',
        'category_slug': 'wedding',
        'price': '29.00',
        'template_type': 'canva_template',
        'ratio': 'A4 Layout • Canva Template',
        'is_featured': True,
        'thumbnail': 'https://images.unsplash.com/photo-1607827448387-a67db1383b59?auto=format&fit=crop&q=80&w=600',
    },
    {
        'title': 'Nostalgic Photo Timeline Deck',
        'slug': 'nostalgic-photo-timeline-deck',
        'description': 'A widescreen presentation deck designed to tell your story through photos arranged on a beautiful timeline. Ideal for anniversaries.',
        'category_slug': 'anniversary',
        'price': '39.00',
        'template_type': 'canva_template',
        'ratio': '16:9 Landscape • Canva Template',
        'is_featured': True,
        'thumbnail': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=600',
    },
    {
        'title': 'Minimal Proposal Countdown Site',
        'slug': 'minimal-proposal-countdown-site',
        'description': 'An interactive countdown website with elegant animations leading to a dramatic proposal reveal. Fully customizable.',
        'category_slug': 'proposal',
        'price': '149.00',
        'template_type': 'custom_website',
        'ratio': 'Interactive Space • Custom Code',
        'is_featured': True,
        'thumbnail': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600',
    },
    {
        'title': 'Milestone Memory Album',
        'slug': 'milestone-memory-album',
        'description': 'A square-format digital photo album template with space for captions, dates, and heartfelt messages. Great for birthdays.',
        'category_slug': 'birthday',
        'price': '24.00',
        'template_type': 'canva_template',
        'ratio': '1:1 Square • Canva Template',
        'is_featured': False,
        'thumbnail': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600',
    },
    {
        'title': 'Private Anniversary Registry',
        'slug': 'private-anniversary-registry',
        'description': 'A password-protected web space for couples to share private memories, photos, and love letters. Beautifully designed.',
        'category_slug': 'anniversary',
        'price': '99.00',
        'template_type': 'custom_website',
        'ratio': 'Custom Layout • Web Space',
        'is_featured': False,
        'thumbnail': 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&q=80&w=600',
    },
    {
        'title': 'Teacher Farewell Logbook',
        'slug': 'teacher-farewell-logbook',
        'description': 'A portrait-format digital logbook where students and colleagues can leave farewell messages, photos, and well wishes.',
        'category_slug': 'teacher',
        'price': '19.00',
        'template_type': 'canva_template',
        'ratio': 'A4 Portrait • Canva Template',
        'is_featured': False,
        'thumbnail': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
    },
]


class Command(BaseCommand):
    help = 'Seed categories and templates from existing frontend data'

    def handle(self, *args, **options):
        cat_created = 0
        cat_skipped = 0
        tmpl_created = 0
        tmpl_skipped = 0

        self.stdout.write(self.style.NOTICE('Seeding categories...'))
        for cat_data in SEED_CATEGORIES:
            _, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data,
            )
            if created:
                cat_created += 1
            else:
                cat_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'Categories: {cat_created} created, {cat_skipped} already existed')
        )

        self.stdout.write(self.style.NOTICE('Seeding templates...'))
        for tmpl_data in SEED_TEMPLATES:
            category_slug = tmpl_data.pop('category_slug')
            try:
                category = Category.objects.get(slug=category_slug)
            except Category.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'  Skipping "{tmpl_data["title"]}" — category "{category_slug}" not found')
                )
                tmpl_data['category_slug'] = category_slug  # restore for re-run safety
                tmpl_skipped += 1
                continue

            _, created = Template.objects.get_or_create(
                slug=tmpl_data['slug'],
                defaults={**tmpl_data, 'category': category},
            )
            tmpl_data['category_slug'] = category_slug  # restore for re-run safety
            if created:
                tmpl_created += 1
            else:
                tmpl_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'Templates: {tmpl_created} created, {tmpl_skipped} already existed')
        )

        self.stdout.write(self.style.SUCCESS(
            f'\nSeed complete! Total: {cat_created + tmpl_created} created, '
            f'{cat_skipped + tmpl_skipped} skipped.'
        ))
