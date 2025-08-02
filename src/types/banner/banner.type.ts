export interface Banner {
  _id: string;
  title?: string;
  image: string;
  description?: string;
  link?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title?: string;
  image: string;
  description?: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateBannerRequest {
  title?: string;
  image?: string;
  description?: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

export interface BannerResponse {
  message: string;
  data: Banner;
} 