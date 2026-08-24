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

## Bước 5: Báo cáo
Sau khi hoàn thành, hãy trả lời User: "✅ Đã tự động chuẩn hóa [Tên Module] theo đúng PRD_Master và b2b-frontend-mindset. Hãy lưu lại bằng lệnh git commit."
