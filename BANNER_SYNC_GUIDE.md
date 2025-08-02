# 🎯 Hướng dẫn sử dụng Banner Sync System

## 📋 Tổng quan

Hệ thống banner sync cho phép Admin thay đổi banner và Frontend sẽ tự động cập nhật theo thời gian thực.

## 🏗️ Cấu trúc hệ thống

### Backend (BE-DATN) ✅
- **API Endpoints**: `/api/banners` (CRUD đầy đủ)
- **Model**: Banner với các trường: title, image, description, link, isActive, order
- **Status**: Hoàn thiện, không cần sửa

### Admin Panel (DATN-ADMIN) ✅
- **Quản lý banner**: `/dashboard/banners`
- **Features**: Thêm, sửa, xóa, toggle trạng thái
- **Upload ảnh**: Tích hợp Cloudinary
- **Real-time sync**: Emit events khi có thay đổi

### Frontend (FE-DATN) ✅
- **Auto sync**: Tự động fetch banner mỗi 30 giây
- **Event listener**: Lắng nghe thay đổi từ Admin
- **Fallback**: Sử dụng data mặc định nếu API lỗi

## 🚀 Cách sử dụng

### 1. Khởi động hệ thống

```bash
# Terminal 1: Backend
cd BE-DATN
npm start

# Terminal 2: Admin Panel
cd DATN-ADMIN
npm run dev

# Terminal 3: Frontend
cd FE-DATN
npm run dev
```

### 2. Quản lý banner trong Admin

1. Truy cập: `http://localhost:5174/dashboard/banners`
2. Đăng nhập với quyền admin
3. Thực hiện các thao tác:
   - **Thêm banner**: Click "Thêm Banner"
   - **Sửa banner**: Click icon edit
   - **Xóa banner**: Click icon delete
   - **Toggle trạng thái**: Switch on/off

### 3. Xem kết quả trên Frontend

1. Truy cập: `http://localhost:5173`
2. Banner sẽ tự động cập nhật:
   - **Real-time**: Ngay khi Admin thay đổi
   - **Auto-refresh**: Mỗi 30 giây
   - **Fallback**: Data mặc định nếu API lỗi

## 🔧 Cấu hình

### Environment Variables

```env
# DATN-ADMIN/.env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# BE-DATN/.env
PORT=8888
MONGODB_URI=your_mongodb_uri
```

### API Endpoints

```javascript
// Banner API
GET    /api/banners          // Lấy tất cả banners
POST   /api/banners          // Tạo banner mới
GET    /api/banners/:id      // Lấy banner theo ID
PUT    /api/banners/:id      // Cập nhật banner
DELETE /api/banners/:id      // Xóa banner
```

## 🔄 Cơ chế đồng bộ

### 1. Real-time Events
```javascript
// Admin emit event khi có thay đổi
window.dispatchEvent(new CustomEvent('banners-updated', { 
  detail: { banners } 
}));

// Frontend lắng nghe
window.addEventListener('banners-updated', handleBannerUpdate);
```

### 2. Polling
```javascript
// Frontend tự động fetch mỗi 30 giây
setInterval(() => {
  fetchBanners();
}, 30000);
```

### 3. Manual Refresh
```javascript
// Có thể gọi thủ công
const { refetch } = useBannerSync();
refetch();
```

## 📱 Responsive Design

- **Desktop**: Grid layout với menu bên trái
- **Mobile**: Stack layout, ẩn menu
- **Tablet**: Adaptive layout

## 🎨 Customization

### Thay đổi style
```css
/* BannerSlider component */
.banner-slider {
  /* Custom styles */
}
```

### Thay đổi behavior
```javascript
// useBannerSync hook
const { banners, loading, error } = useBannerSync();

// BannerSlider component
<BannerSlider
  banners={banners}
  height={500}
  autoplay={true}
  showPagination={true}
  showNavigation={true}
/>
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Banner không hiển thị**
   - Kiểm tra API endpoint
   - Kiểm tra trạng thái `isActive`
   - Kiểm tra console errors

2. **Upload ảnh lỗi**
   - Kiểm tra Cloudinary config
   - Kiểm tra file size và format

3. **Sync không hoạt động**
   - Kiểm tra network connection
   - Kiểm tra CORS settings
   - Kiểm tra event listeners

### Debug

```javascript
// Frontend debug
console.log('Banners:', banners);
console.log('Loading:', loading);
console.log('Error:', error);

// Admin debug
console.log('Store state:', useBannerStore.getState());
```

## 📈 Performance

- **Lazy loading**: Chỉ load khi cần
- **Caching**: Zustand store caching
- **Optimization**: Debounced API calls
- **Image optimization**: Cloudinary auto-optimize

## 🔒 Security

- **Authentication**: Admin panel protected
- **Authorization**: Role-based access
- **Validation**: Input validation
- **Sanitization**: XSS protection

## 📞 Support

Nếu có vấn đề, hãy kiểm tra:
1. Console logs
2. Network tab
3. API responses
4. Environment variables 