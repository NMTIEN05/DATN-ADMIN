import React, { useState, useEffect } from 'react';
import { Carousel, Image, Spin, Alert } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Banner } from '../../types/banner/banner.type';

interface BannerSliderProps {
  banners?: Banner[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  autoplay?: boolean;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners = [],
  loading = false,
  error = null,
  height = 400,
  autoplay = true,
}) => {
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);

  useEffect(() => {
    // Lọc banner đang active và sắp xếp theo thứ tự
    const filtered = banners
      .filter(banner => banner.isActive)
      .sort((a, b) => a.order - b.order);
    setActiveBanners(filtered);
  }, [banners]);

  if (loading) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5'
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải banner"
        description={error}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (activeBanners.length === 0) {
    return (
      <div 
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          color: '#999'
        }}
      >
        Không có banner nào
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Carousel
        autoplay={autoplay}
        autoplaySpeed={5000}
        dots={{ className: 'banner-dots' }}
        arrows={true}
        prevArrow={<LeftOutlined />}
        nextArrow={<RightOutlined />}
        style={{ height }}
      >
        {activeBanners.map((banner) => (
          <div key={banner.id}>
            <div style={{ position: 'relative', height }}>
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                preview={false}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                  padding: '20px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {banner.title}
                </h3>
                {banner.description && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '16px' }}>
                    {banner.description}
                  </p>
                )}
                {banner.link && (
                  <a
                    href={banner.link}
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '8px 16px',
                      background: '#1890ff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    Xem thêm
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerSlider; 