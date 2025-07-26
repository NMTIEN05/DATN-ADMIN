import { axiosInstance } from '../../utils/axios.util';
import type { Banner, CreateBannerRequest, UpdateBannerRequest, BannerListResponse } from '../../types/banner/banner.type';

const BANNER_API = '/banners';

export const bannerService = {
  // Lấy danh sách banner
  getBanners: async (page: number = 1, limit: number = 10): Promise<BannerListResponse> => {
    try {
      const response = await axiosInstance.get(`${BANNER_API}?page=${page}&limit=${limit}`);
      // Backend trả về { data, total, page, limit }
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  // Lấy banner theo ID
  getBannerById: async (id: string): Promise<Banner> => {
    try {
      const response = await axiosInstance.get(`${BANNER_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banner by id:', error);
      throw error;
    }
  },

  // Tạo banner mới
  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    try {
      // Chuyển đổi imageUrl thành image để phù hợp với backend
      const { imageUrl, ...restData } = data;
      const bannerData = {
        ...restData,
        image: imageUrl,
      };
      
      const response = await axiosInstance.post(BANNER_API, bannerData);
      // Backend trả về { message, data }
      return response.data.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  // Cập nhật banner
  updateBanner: async (id: string, data: CreateBannerRequest): Promise<Banner> => {
    try {
      // Chuyển đổi imageUrl thành image để phù hợp với backend
      const { imageUrl, ...restData } = data;
      const bannerData = {
        ...restData,
        image: imageUrl,
      };
      
      const response = await axiosInstance.put(`${BANNER_API}/${id}`, bannerData);
      // Backend trả về { message, data }
      return response.data.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  // Xóa banner
  deleteBanner: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${BANNER_API}/${id}`);
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  // Upload ảnh
  uploadImage: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axiosInstance.post(`${BANNER_API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Tạo URL đầy đủ cho ảnh
      const fullImageUrl = `http://localhost:8888${response.data.url}`;
      
      return { url: fullImageUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
}; 