# 🛡️ KHO VŨ KHÍ AI & CÔNG CỤ TỰ ĐỘNG HÓA (AI TOOLS LIBRARY)
**Dự án:** Export Sales Interactive Hub (LOS)
**Dành cho:** Solo Developer & AI Pair Programmer

File này chứa các "Thần chú" (System Commands) đúc kết từ Kiến trúc PRD. Bất cứ khi nào bạn mở một luồng chat mới với AI (tôi), hãy COPY một trong các lệnh dưới đây dán vào khung chat. AI sẽ lập tức bị ép vào đúng khuôn khổ và lập trình chuẩn xác theo ý bạn mà không cần giải thích lại.

---

## BỘ 1: KỸ NĂNG NHẬP VAI (AGENT PERSONAS)
*Sử dụng khi bạn muốn AI tập trung code một mảng cụ thể.*

### 🎨 Lệnh Frontend & UI/UX (FE-01)
> `[EXECUTE_SKILL: fe-cognitive-ui]`
> **Mục tiêu:** Xây dựng Giao diện UI/UX và Logic State.
> **Quy tắc ép buộc:** Chỉ sử dụng Next.js App Router (React) và TailwindCSS. Bắt buộc dùng `Zustand` cho Global State. Mọi Form phải có cơ chế Auto-save (Debounce) và các rào cản nghiệp vụ (Cognitive Friction).

### 🗄️ Lệnh Database & Backend (DB-02)
> `[EXECUTE_SKILL: supabase-jsonb-master]`
> **Mục tiêu:** Thiết kế CSDL và Bảo mật.
> **Quy tắc ép buộc:** Sử dụng Supabase PostgreSQL. Dữ liệu động bắt buộc lưu bằng `JSONB` trong cột `form_data`. Thiết lập nghiêm ngặt Row Level Security (RLS) để cô lập dữ liệu người dùng. Code Backend phải sử dụng Next.js Server Actions.

### ⚙️ Lệnh DevOps & Tích hợp (DevOps-03)
> `[EXECUTE_SKILL: vercel-integrator]`
> **Mục tiêu:** Cài đặt Webhooks, Cronjobs và xử lý PDF.
> **Quy tắc ép buộc:** File xuất PDF (Capstone) phải được render tại **Client-side** (`html2pdf.js`) để tránh Timeout của Vercel Serverless. Cấu hình Webhooks đẩy data sang Google Sheets.

---

## BỘ 2: CÔNG CỤ TỰ ĐỘNG HÓA (AUTOMATION TOOLS)
*Sử dụng khi bạn muốn AI chạy các luồng tự động (Script).*

### 🔄 Lệnh Chuẩn hóa PRD (Cập nhật Data)
> `[RUN_TOOL: @standardize-prd]`
> **Trường hợp dùng:** Khi bạn vừa sửa file Word `.docx` và muốn tự động ghi đè kiến trúc mới vào `PRD_Master.md`.
> **Hành động của AI:** AI sẽ tự động đọc file DOCX, loại bỏ các kiến trúc dư thừa (như Server-side PDF), và tự động cập nhật lại file PRD chuẩn mực mà không thay đổi định hướng Solo Dev.

### 🧪 Lệnh Auto-fill Mock Data (Dự kiến code ở Phase 2)
> `[RUN_TOOL: @autofill-mock-100]`
> **Trường hợp dùng:** Khi bạn đang code M04, M05 và cần Data 100 điểm chuẩn từ M01-M03 để test luồng (mà không muốn gõ tay).
> **Hành động của AI:** AI sẽ chạy script bơm trực tiếp Data chuẩn vào Zustand Store trên Localhost của bạn.

---
*(Lưu ý: Bạn có thể tiếp tục bổ sung thêm các Lệnh mới vào file này trong tương lai nếu phát sinh các Tool/Skill mới)*
