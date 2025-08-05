# Ứng Dụng Quản Lý Chi Tiêu PWA

Ứng dụng quản lý chi tiêu cá nhân được xây dựng với Next.js và TypeScript, hỗ trợ tính năng PWA (Progressive Web App) để sử dụng offline trên mọi thiết bị.

## ✨ Tính năng chính

- **💰 Quản lý giao dịch**: Thêm, sửa, xóa các giao dịch thu/chi
- **📊 Thống kê chi tiết**: Xem biểu đồ phân tích chi tiêu theo danh mục
- **📱 Mobile-first**: Giao diện tối ưu cho thiết bị di động
- **🔄 Hoạt động offline**: Lưu trữ dữ liệu local, đồng bộ khi online
- **🏠 Cài đặt như app**: Có thể cài đặt trực tiếp trên iOS/Android
- **⚡ Hiệu suất cao**: Sử dụng Next.js 14 với App Router

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### Build production
```bash
npm run build
npm start
```

## 📱 Cài đặt PWA trên thiết bị

### iPhone/iPad (Safari)
1. Mở ứng dụng trên Safari
2. Nhấn nút Share (biểu tượng chia sẻ)
3. Chọn "Add to Home Screen"
4. Nhấn "Add"

### Android (Chrome)
1. Mở ứng dụng trên Chrome
2. Nhấn menu 3 chấm
3. Chọn "Add to Home Screen"
4. Nhấn "Add"

## 🏗️ Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # CSS toàn cục
│   ├── layout.tsx         # Layout chính
│   └── page.tsx           # Trang chủ
├── components/            # React components
│   ├── ui/                # UI components tái sử dụng
│   ├── BalanceCard.tsx    # Thẻ hiển thị số dư
│   ├── StatsPage.tsx      # Trang thống kê
│   ├── TransactionItem.tsx # Item giao dịch
│   └── TransactionModal.tsx # Modal thêm/sửa giao dịch
├── hooks/                 # Custom React hooks
│   └── useStorage.ts      # Hook quản lý localStorage
├── lib/                   # Utility functions
│   ├── storage.ts         # Service lưu trữ local
│   └── utils.ts           # Các hàm tiện ích
└── types/                 # TypeScript type definitions
    └── index.ts           # Định nghĩa types chính
```

## 🎨 Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage
- **Build Tool**: Webpack (Next.js built-in)

## 📊 Tính năng chi tiết

### Quản lý giao dịch
- Thêm giao dịch thu nhập/chi tiêu
- Phân loại theo danh mục có sẵn
- Chỉnh sửa và xóa giao dịch
- Hiển thị theo thời gian thực

### Thống kê và báo cáo
- Tổng quan số dư hiện tại
- Thống kê theo danh mục
- Biểu đồ phần trăm chi tiêu
- Lịch sử giao dịch đầy đủ

### PWA Features
- Service Worker cho offline caching
- Web App Manifest
- Installable trên mobile devices
- Responsive design cho mọi màn hình

## 🔧 Tùy chỉnh

### Thêm danh mục mới
Chỉnh sửa file `src/lib/storage.ts` để thêm danh mục:

```typescript
export const defaultCategories: Category[] = [
  // Thêm danh mục mới
  { id: 'new-id', name: 'Tên danh mục', type: 'expense', color: '#color', icon: '🎯' },
  // ...existing categories
];
```

### Thay đổi theme colors
Chỉnh sửa `tailwind.config.ts` để thay đổi màu sắc chủ đạo.

## 📄 License

MIT License - có thể sử dụng tự do cho mục đích cá nhân và thương mại.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📞 Hỗ trợ

Nếu có vấn đề gì, vui lòng tạo issue trên GitHub repository.
