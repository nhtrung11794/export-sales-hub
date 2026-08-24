---
name: standardize-prd
description: Kỹ năng tự động đọc file DOCX cập nhật và chuẩn hóa thành PRD_Master.md theo đúng tư duy Solo Dev
---

# Hướng dẫn Chuẩn hóa PRD (PRD Standardization Routine)

Khi User gọi kỹ năng này (bằng lệnh `@standardize-prd` hoặc yêu cầu "Chuẩn hóa PRD"), bạn (AI) MẶC ĐỊNH phải thực thi các bước sau một cách tự động, không cần hỏi lại:

## Bước 1: Trích xuất dữ liệu
1. Tìm file `PRD _ Website Chuyên trang Học tập XK B2B.docx` trong thư mục `PRD/`.
2. Sử dụng PowerShell (hoặc Python) để giải nén file `.docx` và đọc nội dung text bên trong `word/document.xml`.
3. Lưu nội dung thô ra một file text tạm để phân tích.

## Bước 2: Bộ lọc Tư duy (Cognitive Filter)
Bạn phải duyệt qua toàn bộ nội dung text vừa trích xuất và TỰ ĐỘNG thay đổi các chi tiết sau để ép nó về khuôn khổ dự án:
- **Kiến trúc PDF:** Bất kể file DOCX ghi là Server-side, Puppeteer, Inngest hay Vercel Edge, bạn PHẢI sửa lại thành **Client-side PDF Engine (html2pdf.js / react-pdf)**.
- **Kiến trúc API:** Bất kể file DOCX yêu cầu viết REST API, bạn PHẢI sửa lại thành **Next.js Server Actions & Direct Supabase Client**.
- **RLS & Dashboard:** Nếu file DOCX yêu cầu làm Admin Dashboard hoặc RLS chặt chẽ, hãy ghi chú vào PRD là "Đẩy sang Phase 2 (Sau khi MVP ra mắt)".
- **Tổ chức Nhân sự:** Vẫn giữ mô hình Team theo yêu cầu quản lý của User (UI/UX, Frontend, Backend, DevOps).

## Bước 3: Ghi đè PRD_Master
Sử dụng công cụ `write_to_file` hoặc `replace_file_content` để cập nhật trực tiếp vào file `PRD/PRD_Master.md`. 
Đảm bảo giữ nguyên các cấu trúc "Khung" (Frames) của bản gốc DOCX, chỉ ghi đè công nghệ.

## Bước 4: Báo cáo
Sau khi ghi đè xong, hãy trả lời User: "✅ Đã tự động chuẩn hóa PRD cập nhật theo chuẩn Solo Developer. Dữ liệu đã được lưu vào PRD_Master.md".
