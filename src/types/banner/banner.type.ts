export interface Banner {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  image: string; // Backend sử dụng 'image' thay vì 'imageUrl'
  imageUrl?: string; // Giữ lại để tương thích với frontend
  link?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  imageUrl: string; // Frontend vẫn sử dụng imageUrl
  link?: string;
  isActive: boolean;
  order: number;
}

export interface UpdateBannerRequest extends CreateBannerRequest {
  id: string;
}

export interface BannerListResponse {
  data: Banner[];
  total: number;
  page: number;
  limit: number;
} 