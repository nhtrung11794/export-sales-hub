---
name: standardize-module
description: Tự động hóa quy trình chuẩn hóa một Module bất kỳ (M02-M15) theo tư duy B2B Frontend Mindset và PRD Master
---

# Hướng dẫn Chuẩn hóa Module (Module Standardization Routine)

Khi User yêu cầu chuẩn hóa một Module cụ thể (ví dụ: `@[Chuẩn hóa Module] hãy làm cho M04`), bạn (AI) MẶC ĐỊNH phải thực thi toàn bộ 5 bước sau mà không cần hỏi lại:

## Bước 1: Quét PRD_Master.md (Single Source of Truth)
- Tìm đọc `PRD/PRD_Master.md` để nắm bắt nội dung, tên bài học, và **Logic Gate** của Module được yêu cầu.
- Nếu có sự khác biệt giữa Code hiện tại và PRD, bạn BẮT BUỘC phải sửa Code theo PRD.

## Bước 2: Chuẩn hóa Layout (Cột 1)
- Áp dụng cấu trúc 3 cột bằng `ModuleLayout`.
- Thay thế tiêu đề và đoạn mô tả bài học chính xác từng chữ theo `PRD_Master.md`.
- Gắn các nút mở PDF/Video PiP với màu sắc và Icon (Lucide) chuẩn.

## Bước 3: Ép Giao diện Thẩm mỹ & Chống đứt gãy (Cột 2)
- Áp dụng triệt để **Glassmorphism**: Dùng `className="glass-panel"`, background kính mờ (`rgba(15, 23, 42, 0.5)`), và Neon Glow cho các biểu đồ/tool.
- Bọc toàn bộ ô nhập liệu bằng thuộc tính `disabled={!isOnline}` để khóa tính năng khi mất mạng.
- Gắn Banner cảnh báo mất mạng màu đỏ và hiển thị Dữ liệu giả lập (Mock data) khi có lỗi kết nối Supabase (`debugError`).

## Bước 4: Cập nhật Dây chuyền Data & AI Tutor (Cột 3)
- **CỰC KỲ QUAN TRỌNG:** Nếu cấu trúc dữ liệu bị đổi theo PRD, bạn phải sửa Interface Data (`src/types/...` hoặc ngay trong file component) và dùng Optional Chaining (`?.`) để làm Fallback an toàn.
- Sửa lại câu lệnh nội suy của thẻ AI Prompt ở Cột 3 để biến số được cập nhật khớp với dữ liệu mới.

## Bước 5: Cơ chế Nộp bài, Khóa Tuần tự & Supabase SSR Client
- **BẮT BUỘC DÙNG SSR CLIENT:** Tất cả các file `page.tsx` trong module đều phải import `createClient` từ `@/lib/supabase/client` (TUYỆT ĐỐI KHÔNG dùng `import { supabase } from '@/lib/supabase'` vì sẽ lỗi xác thực Cookie). Phải gọi `const supabase = createClient();` bên trong Component.
- Khai báo hook lấy `userId`: `const [userId, setUserId] = useState<string | null>(null);` và useEffect với `supabase.auth.getUser()`.
- Thêm logic kiểm tra tính hợp lệ của dữ liệu (Validation) trong file `page.tsx`. Chỉ những trường cực kỳ quan trọng mới bắt buộc khác rỗng.
- Cập nhật logic `isUnlocked` trong `AppLayout.tsx` và `page.tsx` (Dashboard) để đảm bảo Module này chỉ mở khi Module trước đó đã được nộp.

## Bước 6: Xử lý Trạng thái Khóa / Mở Khóa bài làm (Re-submission)
- Nhắc lại thiết kế DB: Bảng `module_submissions` sử dụng cột `status` (`'draft'` hoặc `'submitted'`), KHÔNG có cột `is_locked`. Việc mapping sang biến `is_locked` được thực hiện cục bộ tại store `useModuleStore`.
- Import các actions `submitModule` và `unlockModule` từ `useModuleStore`.
- Nút Action trên Header (`headerActionNode` của `ModuleLayout`) luôn bao gồm 2 trạng thái:
  1. Khi ĐÃ NỘP (`isLocked == true`): Hiển thị nút "Mở Khóa để Sửa" (`var(--accent-warning)`). Gọi hàm `handleUnlock`.
  2. Khi CHƯA NỘP (`!isLocked`): Hiển thị nút "Xác nhận Nộp bài" (`var(--accent-primary)`). Gọi hàm `handleSubmit`.

## Bước 7: Thẩm mỹ Toàn cục (Global Dark Theme)
- Luôn nhớ hệ thống của chúng ta sử dụng **CSS Variables ép cứng thành Màu Xanh Đen (Dark Theme)** trong `:root` tại `globals.css` (bỏ qua media query `prefers-color-scheme`). 
- Khi code UI mới, không sử dụng class màu Tailwind (ví dụ `bg-gray-800`) mà DÙNG BIẾN CSS của hệ thống như `var(--bg-secondary)`, `var(--accent-primary)` để luôn hòa hợp với Dark Theme thiết kế sẵn.

## Bước 8: Báo cáo
Sau khi hoàn thành, hãy trả lời User: "✅ Đã tự động chuẩn hóa [Tên Module] theo đúng PRD_Master, b2b-frontend-mindset và kiến trúc Khóa/Mở Khóa, ép cứng Dark Theme. Hãy lưu lại bằng lệnh git commit."
