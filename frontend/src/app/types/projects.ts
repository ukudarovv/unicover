export interface ProjectCategory {
  id: string;
  name: string;
  name_kz?: string;
  name_en?: string;
  description?: string;
  order: number;
  is_active: boolean;
}

export interface ProjectImage {
  id: string;
  image: string;
  image_url?: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  category?: ProjectCategory;
  category_id?: number;
  location: string;
  year: number;
  image: string;
  image_url?: string;
  description: string;
  gallery_images?: ProjectImage[];
  is_published: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectDetail extends Project {
  full_description: string;
  characteristics?: Record<string, any>;
  timeline?: string;
  team?: string;
}

