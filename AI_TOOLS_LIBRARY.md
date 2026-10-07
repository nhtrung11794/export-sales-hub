# 🛡️ KHO VŨ KHÍ AI & CÔNG CỤ TỰ ĐỘNG HÓA (AI TOOLS LIBRARY)
**Dự án:** Export Sales Interactive Hub (LOS)
**Dành cho:** Solo Developer & AI Pair Programmer
**Cập nhật:** 25/08/2026 (Chốt hạ Module 02 & Hệ thống Phân quyền)

File này chứa các "Thần chú" (System Commands) đúc kết từ Kiến trúc PRD và các chuẩn mực đã kiểm chứng thành công. Bất cứ khi nào bạn mở một luồng chat mới với AI (tôi), hãy COPY một trong các lệnh dưới đây dán vào khung chat. AI sẽ lập tức bị ép vào đúng khuôn khổ và lập trình chuẩn xác theo ý bạn mà không cần giải thích lại.

---

## BỘ 1: KỸ NĂNG NHẬP VAI (AGENT PERSONAS)
*Sử dụng khi bạn muốn AI tập trung code một mảng cụ thể.*

### 🎨 Lệnh Frontend & UI/UX (FE-01)
> `[EXECUTE_SKILL: fe-cognitive-ui]`
> **Mục tiêu:** Xây dựng Giao diện UI/UX và Logic State.
> **Quy tắc ép buộc:** Chỉ sử dụng Next.js App Router (React) và TailwindCSS. Bắt buộc dùng `Zustand` cho Global State. Mọi Form phải có cơ chế Auto-save (Debounce), Dynamic Design (`:focus-within` Glow), và xử lý Graceful Degradation `(value || '').trim()`.

### 🗄️ Lệnh Database & Backend (DB-02)
> `[EXECUTE_SKILL: supabase-jsonb-master]`
> **Mục tiêu:** Thiết kế CSDL, Auth và Phân quyền.
> **Quy tắc ép buộc:** Sử dụng Supabase PostgreSQL. Hỗ trợ luồng Đăng ký tự động + Phê duyệt Admin (`approval_status = 'pending'`). Dữ liệu form lưu bằng `JSONB` trong `module_submissions`. Thiết lập nghiêm ngặt Row Level Security (RLS) để cô lập dữ liệu.

### 🎓 Lệnh Giảng Viên & Chấm Điểm Rubric (Admin-04)
> `[EXECUTE_SKILL: admin-grading-architect]`
> **Mục tiêu:** Quản trị Bảng Điểm 7 chặng, Chấm theo 10 Rubric Quốc Tế, Quản lý Học viên theo Lớp và Xuất Báo Cáo.
> **Quy tắc ép buộc:** Đọc dữ liệu từ Supabase `module_submissions` và `evaluations`. Mọi điểm số phải quy đổi theo đúng trọng số Sheet `11_Rubric`. Khi lưu kết quả phải bao gồm `reviewer_id` và fallback an toàn `localStorage`.

---

## BỘ 2: CÔNG CỤ TỰ ĐỘNG HÓA (AUTOMATION TOOLS & SKILLS)
*Sử dụng khi bạn muốn AI chạy các luồng tự động (Skill).*

### 🖨️ Lệnh Kết Xuất Báo Cáo In Ấn Gửi Trung Tâm Đào Tạo
> `[RUN_TOOL: @print-report-generator]`
> **Trường hợp dùng:** Khi cần in Bảng Tổng Hợp Cả Lớp (Khổ ngang Landscape A4) hoặc Phiếu Đánh Giá Năng Lực Cá Nhân (Khổ dọc Portrait A4) gửi Trung tâm Đào tạo.
> **Hành động của AI:** 
> 1. Sử dụng Component `PrintReportModal` với cơ chế in cô lập qua pop-up window sạch sẽ, không dính thanh điều hướng Sidebar hay Dark mode.
> 2. Đảm bảo đầy đủ tiêu đề hành chính, thông tin Khóa học/Lớp, bảng thống kê tỷ lệ đạt, bảng điểm 12 cột viền mực đen nét, và Footer 2 chữ ký: Giảng viên phụ trách & Đại diện Ban Đào tạo Trung tâm.
> 3. Hỗ trợ Live Preview và sửa nhanh các thông tin hành chính trước khi bấm In.

### 🔄 Lệnh Chuẩn hóa PRD (Đồng bộ tài liệu)
> `[RUN_TOOL: @standardize-prd]`
> **Trường hợp dùng:** Khi bạn vừa sửa file Word `.docx` và muốn tự động ghi đè kiến trúc mới vào `PRD_Master.md`.
> **Hành động của AI:** AI sẽ đọc file DOCX, loại bỏ các kiến trúc dư thừa, và tự động cập nhật lại file PRD chuẩn mực mà không thay đổi định hướng Solo Dev.

### 🎨 Lệnh Kiến trúc Sư Giao diện Module (Chuẩn hóa UI/UX)
> `[RUN_TOOL: @module-ui-architect]`
> **Trường hợp dùng:** Khi bạn muốn thiết kế và lập trình giao diện mới cho Module 03, 04, 05 theo đúng chuẩn mực đỉnh cao đã chốt ở Module 02.
> **Hành động của AI:** 
> 1. Đọc lại `src/components/modules/m02/B05_DiscoveryMatrix.tsx` và `B04_BuyerMap.tsx` để lấy chuẩn CSS Dynamic Design (Glow, Dimming, Table Header Center, Font size 1rem).
> 2. Khởi tạo schema trong Zustand Store với Default Values đầy đủ để chống crash trang trắng.
> 3. Tự động gắn phân quyền (Khóa với học viên, mở cho Admin) và xử lý liên kết PDF/Video.

---
*(Lưu ý: Bạn có thể tiếp tục bổ sung thêm các Lệnh mới vào file này trong tương lai nếu phát sinh các Tool/Skill mới)*
