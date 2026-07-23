export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageColor: string; // luxurious subtle background colors
  icon: string; // Lucide icon name
}

// API response shape from Django /api/categories/
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_color: string;
  icon: string;
  display_order: number;
  is_active?: boolean;
}

// API response shape from Django /api/templates/
export interface ApiTemplate {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: number;
  category_slug: string;
  category_name: string;
  price: string; // DecimalField returns string
  template_type: 'canva_template' | 'custom_website';
  thumbnail: string;
  ratio: string;
  is_featured: boolean;
  is_active?: boolean;
  // Detail-only fields
  preview_url?: string;
  canva_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  total_templates: number;
  active_templates: number;
  featured_templates: number;
  total_categories: number;
  active_categories: number;
  recent_templates: ApiTemplate[];
  recent_categories: ApiCategory[];
}

// Convert ApiCategory to frontend Category shape
export function apiCategoryToCategory(api: ApiCategory): Category {
  return {
    id: api.slug,
    name: api.name,
    description: api.description,
    slug: api.slug,
    imageColor: api.image_color,
    icon: api.icon,
  };
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  type: 'canva_template' | 'custom_website';
  category: string;
  quantity: number;
  image?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  type: 'canva_template' | 'custom_website';
  category: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  country?: string;
  state?: string;
  city?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Celebrate another year of life with bespoke typography and layouts.',
    slug: 'birthday',
    imageColor: 'bg-stone-50',
    icon: 'Cake',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Timeless invitations, guest books, and digital reception programs.',
    slug: 'wedding',
    imageColor: 'bg-neutral-50',
    icon: 'Heart',
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Reignite milestones with elegant timeline journals and photo cards.',
    slug: 'anniversary',
    imageColor: 'bg-slate-50',
    icon: 'Sparkles',
  },
  {
    id: 'proposal',
    name: 'Proposal',
    description: 'Dramatic, breathtaking custom proposal sites and secret countdowns.',
    slug: 'proposal',
    imageColor: 'bg-stone-100/50',
    icon: 'Flame',
  },
  {
    id: 'friendship',
    name: 'Friendship',
    description: 'Celebrate childhood bonds, shared journeys, and digital scrapbooks.',
    slug: 'friendship',
    imageColor: 'bg-zinc-50',
    icon: 'Smile',
  },
  {
    id: 'parents',
    name: 'Parents',
    description: 'Honoring mothers and fathers with warm, nostalgic memory vaults.',
    slug: 'parents',
    imageColor: 'bg-neutral-100/50',
    icon: 'Users',
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Sleek, meaningful digital thank you boards and classroom boards.',
    slug: 'teacher',
    imageColor: 'bg-slate-100/50',
    icon: 'GraduationCap',
  },
  {
    id: 'farewell',
    name: 'Farewell',
    description: 'Graceful departure logs, digital memory registries, and well wishes.',
    slug: 'farewell',
    imageColor: 'bg-stone-50',
    icon: 'Compass',
  },
];
