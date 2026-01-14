import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Banner } from '../types/banner/banner.type';
import { bannerService } from '../services/banner/banner.service';

interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  selectedBanner: Banner | null;
  
  // Actions
  fetchBanners: () => Promise<void>;
  createBanner: (data: any) => Promise<void>;
  updateBanner: (id: string, data: any) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  setSelectedBanner: (banner: Banner | null) => void;
  clearError: () => void;
  
  // Computed
  activeBanners: Banner[];
  getBannerById: (id: string) => Banner | undefined;
}

export const useBannerStore = create<BannerState>()(
  subscribeWithSelector((set, get) => ({
    banners: [],
    loading: false,
    error: null,
    selectedBanner: null,

    // Actions
    fetchBanners: async () => {
      set({ loading: true, error: null });
      try {
        const banners = await bannerService.getBanners();
        set({ banners, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Lỗi khi tải banner',
          loading: false 
        });
      }
    },

    createBanner: async (data) => {
      set({ loading: true, error: null });
      try {
        const newBanner = await bannerService.createBanner(data);
        set(state => ({
          banners: [...state.banners, newBanner],
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Lỗi khi tạo banner',
          loading: false 
        });
      }
    },

    updateBanner: async (id, data) => {
      set({ loading: true, error: null });
      try {
        const updatedBanner = await bannerService.updateBanner(id, data);
        set(state => ({
          banners: state.banners.map(banner => 
            banner._id === id ? updatedBanner : banner
          ),
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Lỗi khi cập nhật banner',
          loading: false 
        });
      }
    },

    deleteBanner: async (id) => {
      set({ loading: true, error: null });
      try {
        await bannerService.deleteBanner(id);
        set(state => ({
          banners: state.banners.filter(banner => banner._id !== id),
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Lỗi khi xóa banner',
          loading: false 
        });
      }
    },

    setSelectedBanner: (banner) => {
      set({ selectedBanner: banner });
    },

    clearError: () => {
      set({ error: null });
    },

    // Computed
    get activeBanners() {
      return get().banners.filter(banner => banner.isActive);
    },

    getBannerById: (id) => {
      return get().banners.find(banner => banner._id === id);
    },
  }))
);

// Auto-fetch banners when store is initialized
useBannerStore.getState().fetchBanners();

// Subscribe to changes for real-time sync
useBannerStore.subscribe(
  (state) => state.banners,
  (banners) => {
    // Emit event for other components to listen
    window.dispatchEvent(new CustomEvent('banners-updated', { 
      detail: { banners } 
    }));
  }
); 