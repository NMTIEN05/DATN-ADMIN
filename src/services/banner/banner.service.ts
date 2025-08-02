import axios from 'axios';
import type { Banner, CreateBannerRequest, UpdateBannerRequest, BannerResponse } from '../../types/banner/banner.type';

const API_BASE_URL = 'http://localhost:8888/api';

export const bannerService = {
  // Lấy tất cả banners
  getBanners: async (): Promise<Banner[]> => {
    const response = await axios.get(`${API_BASE_URL}/banners`);
    return response.data;
  },

  // Lấy banner theo ID
  getBannerById: async (id: string): Promise<Banner> => {
    const response = await axios.get(`${API_BASE_URL}/banners/${id}`);
    return response.data;
  },

  // Tạo banner mới
  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    const response = await axios.post(`${API_BASE_URL}/banners`, data);
    return response.data.data;
  },

  // Cập nhật banner
  updateBanner: async (id: string, data: UpdateBannerRequest): Promise<Banner> => {
    const response = await axios.put(`${API_BASE_URL}/banners/${id}`, data);
    return response.data.data;
  },

  // Xóa banner
  deleteBanner: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/banners/${id}`);
  },

  // Lấy banners active
  getActiveBanners: async (): Promise<Banner[]> => {
    const response = await axios.get(`${API_BASE_URL}/banners`);
    return response.data.filter((banner: Banner) => banner.isActive);
  }
}; 