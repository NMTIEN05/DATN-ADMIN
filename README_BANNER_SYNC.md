# 🎯 Hướng dẫn tích hợp Banner Sync

## 📋 Tổng quan

Hệ thống banner sync cho phép đồng bộ real-time giữa Admin panel và Frontend khi có thay đổi banner.

## 🏗️ Cấu trúc hệ thống

```
DATN-ADMIN/ (Admin Panel)
├── src/
│   ├── stores/banner.store.ts          # Zustand store
│   ├── services/banner/banner.service.ts # API calls
│   ├── pages/banner/bannerList.tsx     # Admin UI
│   └── pages/banner/bannerForm.tsx     # Form thêm/sửa

FE-DATN/ (Frontend)
├── src/
│   ├── hooks/useBannerSync.ts          # Hook đồng bộ
│   ├── components/banner/BannerSlider.tsx # Component hiển thị
│   └── services/banner/banner.service.ts # API calls
```

## 🔧 Cách tích hợp vào Frontend

### 1. Copy các file cần thiết

```bash
# Copy types
cp DATN-ADMIN/src/types/banner/banner.type.ts FE-DATN/src/types/banner/

# Copy service
cp DATN-ADMIN/src/services/banner/banner.service.ts FE-DATN/src/services/banner/

# Copy hook
cp DATN-ADMIN/src/hooks/useBannerSync.ts FE-DATN/src/hooks/

# Copy component
cp DATN-ADMIN/src/components/banner/BannerSlider.tsx FE-DATN/src/components/banner/
```

### 2. Sử dụng trong Frontend

```tsx
// pages/Home.tsx
import { useBannerSync } from '../hooks/useBannerSync';
import BannerSlider from '../components/banner/BannerSlider';

const HomePage = () => {
  const { banners, loading, error } = useBannerSync();

  return (
    <div>
      <BannerSlider 
        banners={banners}
        loading={loading}
        error={error}
        height={400}
        autoplay={true}
      />
    </div>
  );
};
```

## 🔄 Cơ chế đồng bộ

### 1. Real-time Events
- Admin thay đổi banner → Emit `banners-updated` event
- Frontend lắng nghe event → Cập nhật UI

### 2. Polling
- Frontend tự động fetch banner mỗi 30 giây
- Đảm bảo đồng bộ ngay cả khi miss events

### 3. Manual Refresh
- Có thể gọi `refetch()` để refresh thủ công

## 📡 API Endpoints

```typescript
// GET /api/banners - Lấy danh sách banner
// POST /api/banners - Tạo banner mới
// PUT /api/banners/:id - Cập nhật banner
// DELETE /api/banners/:id - Xóa banner
// POST /api/banners/upload - Upload ảnh
```

## 🎨 Customization

### 1. Thay đổi style BannerSlider
```tsx
<BannerSlider 
  height={500}           // Chiều cao
  autoplay={false}       // Tắt autoplay
  banners={banners}
/>
```

### 2. Thay đổi polling interval
```tsx
// Trong useBannerSync.ts
const interval = setInterval(fetchBanners, 60000); // 60 giây
```

### 3. Thêm loading state
```tsx
const { banners, loading, error, refetch } = useBannerSync();

if (loading) return <Spin />;
if (error) return <Alert message={error} />;
```

## 🚀 Deployment

### 1. Environment Variables
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8888

# Production
VITE_API_URL=https://your-api-domain.com
```

### 2. Build & Deploy
```bash
# Frontend
npm run build
# Deploy dist/ folder

# Admin
npm run build
# Deploy dist/ folder
```

## 🔍 Debug

### 1. Kiểm tra API
```bash
curl http://localhost:8888/api/banners
```

### 2. Kiểm tra events
```javascript
// Browser console
window.addEventListener('banners-updated', (e) => {
  console.log('Banners updated:', e.detail);
});
```

### 3. Logs
```typescript
// Trong service
console.log('API Response:', response.data);
```

## 📝 Lưu ý quan trọng

1. **CORS**: Đảm bảo backend cho phép CORS từ frontend domain
2. **Authentication**: Thêm token vào API calls nếu cần
3. **Error Handling**: Luôn xử lý lỗi gracefully
4. **Performance**: Không poll quá thường xuyên
5. **Fallback**: Có plan B khi API không khả dụng

## 🎯 Kết quả

- ✅ Admin thay đổi banner → Frontend cập nhật ngay lập tức
- ✅ Real-time sync không cần refresh trang
- ✅ Fallback với polling
- ✅ Error handling đầy đủ
- ✅ Responsive design
- ✅ Type-safe với TypeScript 