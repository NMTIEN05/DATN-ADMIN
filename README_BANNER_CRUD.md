# Hướng dẫn sử dụng CRUD Banner trong Admin

## Tổng quan
Chức năng CRUD Banner đã được hoàn thiện và kết nối với backend. Hệ thống cho phép:
- Tạo banner mới với upload ảnh
- Xem danh sách banner với phân trang
- Chỉnh sửa banner
- Xóa banner
- Bật/tắt trạng thái banner

## Cấu hình Backend

### 1. Khởi động Backend
```bash
cd BE-DATN
npm start
```
Backend sẽ chạy tại: `http://localhost:8888`

### 2. API Endpoints
- `GET /api/banners` - Lấy danh sách banner
- `POST /api/banners` - Tạo banner mới
- `PUT /api/banners/:id` - Cập nhật banner
- `DELETE /api/banners/:id` - Xóa banner
- `POST /api/banners/upload` - Upload ảnh

### 3. Cấu trúc dữ liệu Banner
```javascript
{
  _id: string,
  title: string,
  description: string,
  image: string, // URL ảnh
  link: string,
  isActive: boolean,
  order: number,
  createdAt: Date,
  updatedAt: Date
}
```

## Cấu hình Frontend (Admin)

### 1. Khởi động Admin
```bash
cd DATN-ADMIN
npm run dev
```
Admin sẽ chạy tại: `http://localhost:5173`

### 2. Cấu hình API
File `src/utils/axios.util.ts` đã được cấu hình để kết nối với backend:
```typescript
baseURL: 'http://localhost:8888/api'
```

## Tính năng đã implement

### 1. Banner List
- Hiển thị danh sách banner với phân trang
- Hiển thị ảnh thumbnail
- Toggle trạng thái active/inactive
- Actions: Xem, Sửa, Xóa

### 2. Banner Form
- Form tạo mới và chỉnh sửa banner
- Upload ảnh với validation:
  - Kích thước tối đa: 2MB
  - Định dạng: JPG, PNG, WebP
- Preview ảnh real-time
- Validation form fields

### 3. Upload Ảnh
- Upload ảnh lên server
- Lưu ảnh trong thư mục `src/uploads/banners/`
- Trả về URL đầy đủ cho frontend

### 4. Error Handling
- Xử lý lỗi API calls
- Hiển thị thông báo lỗi cho user
- Loading states

## Cấu trúc Files

### Backend
```
BE-DATN/
├── src/
│   ├── controllers/banner.js
│   ├── model/banner.js
│   ├── routes/banner.js
│   └── uploads/banners/ (tự động tạo)
└── index.js
```

### Frontend (Admin)
```
DATN-ADMIN/
├── src/
│   ├── pages/banner/
│   │   ├── bannerList.tsx
│   │   └── bannerForm.tsx
│   ├── services/banner/
│   │   └── banner.service.ts
│   └── types/banner/
│       └── banner.type.ts
```

## Sử dụng

### 1. Tạo Banner Mới
1. Vào trang Banner Management
2. Click "Thêm Banner"
3. Điền thông tin:
   - Tiêu đề (bắt buộc)
   - Mô tả (tùy chọn)
   - Link (tùy chọn)
   - Thứ tự hiển thị
   - Trạng thái
4. Upload ảnh banner
5. Click "Tạo banner"

### 2. Chỉnh Sửa Banner
1. Click icon "Sửa" trong danh sách
2. Chỉnh sửa thông tin
3. Upload ảnh mới (nếu cần)
4. Click "Cập nhật"

### 3. Xóa Banner
1. Click icon "Xóa" trong danh sách
2. Xác nhận xóa

### 4. Toggle Trạng Thái
- Click switch "Hiện/Ẩn" để bật/tắt banner

## Lưu ý

1. **CORS**: Backend đã được cấu hình CORS để cho phép frontend truy cập
2. **Static Files**: Backend serve static files từ `/uploads` để hiển thị ảnh
3. **File Upload**: Ảnh được lưu trong thư mục `src/uploads/banners/`
4. **Database**: Sử dụng MongoDB với model Banner
5. **Validation**: Frontend và backend đều có validation cho upload ảnh

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend có đang chạy không
- Kiểm tra URL trong `axios.util.ts`
- Kiểm tra CORS configuration

### Lỗi upload ảnh
- Kiểm tra thư mục `uploads/banners/` có tồn tại không
- Kiểm tra quyền ghi file
- Kiểm tra kích thước và định dạng file

### Lỗi hiển thị ảnh
- Kiểm tra static file serving trong backend
- Kiểm tra URL ảnh có đúng không
- Kiểm tra file ảnh có tồn tại không 