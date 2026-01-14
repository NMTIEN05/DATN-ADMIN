import { useEffect, useState } from 'react';
import type { Banner } from '../types/banner/banner.type';
import { bannerService } from '../services/banner/banner.service';

export const useBannerSync = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bannerService.getBanners();
      setBanners(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();

    // Lắng nghe sự kiện cập nhật banner từ admin
    const handleBannerUpdate = (event: CustomEvent) => {
      setBanners(event.detail.banners);
    };

    window.addEventListener('banners-updated', handleBannerUpdate as EventListener);

    // Polling để đồng bộ (mỗi 30 giây)
    const interval = setInterval(fetchBanners, 30000);

    return () => {
      window.removeEventListener('banners-updated', handleBannerUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
  };
}; 