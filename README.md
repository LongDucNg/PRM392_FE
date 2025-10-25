# prm392_fe

Ứng dụng Expo cho bán linh kiện điện tử.

## Quickstart

```bash
npm install
npm run start
# nhấn "a" để mở Android emulator, hoặc quét QR bằng Expo Go
```

## Env
- Thiết lập `EXPO_PUBLIC_API_URL` trong `.env` hoặc biến dự án.

## Thư viện
- React Query, Axios, Zustand (persist), Zod, React Hook Form
- Async Storage, Expo Notifications, Secure Store, Device

## Cấu trúc
- `app/(auth)` màn hình đăng nhập
- `app/(tabs)` tabs: Home, Products, Cart, Orders, Admin
- `state/auth.ts` store đăng nhập (persist)
- `lib/api.ts` Axios client với bearer token

## Ghi chú
- Tab Admin có guard theo role (admin/staff)
- Thay fake login bằng API thật ở bước sau
