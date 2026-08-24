# 📘 CẨM NANG BÀN GIAO (HANDOFF HANDBOOK)
**Dự án:** Export Sales Interactive Hub (LOS)
**Ngày cập nhật:** 22/08/2026 (Cuối phiên kiến trúc tổng thể)

Tài liệu này là "Điểm nhớ" (Save Point) tổng hợp toàn bộ Tư duy, Kết quả và Kế hoạch để bạn (hoặc bất kỳ AI Agent nào trong phiên tiếp theo) có thể tiếp nối dự án ngay lập tức mà không bị đứt gãy mạch logic.

---

## 1. 🏆 NHỮNG ĐIỂM ĐÃ LÀM ĐƯỢC (ACCOMPLISHED)
1. **Chốt hạ Kiến trúc Cốt lõi (Master PRD):**
   - Đã phân tích và chuẩn hóa xong kiến trúc Vercel Serverless + Supabase (JSONB) từ file DOCX v3.0 của dự án.
   - Thống nhất chiến lược **Tối ưu code cho Solo Developer**: Dùng Server Actions thay vì viết API thủ công, dùng Client-side PDF thay vì Server-side.
2. **Xây dựng thành công Global Store (Zustand):**
   - Đã khởi tạo `src/store/useModuleStore.ts` để Fetch toàn bộ dữ liệu 5 Module ngay khi Đăng nhập (Zero Latency).
   - Refactor thành công Hook `useAutoSave` và `M2_MarketForm` để đồng bộ dữ liệu vào Zustand và lưu ngầm lên Supabase.
3. **Quản trị Nhân sự & Thư mục:**
   - Đã tổ chức lại toàn bộ file hệ thống. Đưa các file DOCX gốc và bản `PRD_Master.md` vào gọn gàng trong folder `PRD/`.
   - Vẫn giữ nguyên phân vai Team (UI, FE, DB, DevOps) để quản lý tiến độ dễ dàng.

## 2. ⏳ NHỮNG ĐIỂM CHƯA LÀM ĐƯỢC (NEXT STEPS/PENDING)
*Đây là các Task ưu tiên cao nhất cho phiên làm việc tiếp theo:*
- **[Sprint 1.1] Module 03 (Fit Score):** Giao cho Team UI/FE thiết kế giao diện (Slider) và logic chấm điểm BANT/MEDDIC dựa trên dữ liệu kế thừa từ M02.
- **[Sprint 1.2] Khóa Rủi ro M04:** Chặn thanh toán (D/P, CAD) nếu Fit Score ở M03 thấp.
- **[Sprint 1.3] System:** Viết Logic tạo Snapshot (Reverse-flow Edit) khi sửa data cũ.

## 3. 🧠 TƯ DUY & Ý TƯỞNG CỐT LÕI (CORE MINDSET)
Bất kỳ AI nào code dự án này đều phải thấm nhuần:
1. **Cognitive Simulation (Mô phỏng tư duy):** Form không chỉ để điền chữ. Hệ thống phải liên tục "làm khó" học viên bằng các rào cản nghiệp vụ dựa trên dữ liệu họ đã nhập.
2. **Data Inheritance (Kế thừa Non-destructive):** Dữ liệu chảy từ M01 -> M05. Nếu M02 sửa đổi, tuyệt đối không xóa bài tự luận của học viên ở M03, chỉ hiện Cờ đỏ cảnh báo.
3. **JSONB Agility:** Toàn bộ form được lưu trong cột `form_data` (JSONB) của bảng `module_submissions`.

## 4. 🛠️ BỘ CÔNG CỤ TỰ ĐỘNG (SKILLS & TOOLS)
Dưới đây là công cụ (Tool) đã được nhúng thẳng vào não của tôi (AI) để phục vụ cho các lần cập nhật PRD trong tương lai của bạn.

### 🪄 Tool: `@standardize-prd` (Tự động hóa chuẩn hóa PRD)
- **Hoàn cảnh sử dụng:** Bất cứ khi nào bạn có ý tưởng mới, bạn sửa file `PRD _ Website Chuyên trang Học tập XK B2B.docx` bằng Microsoft Word. Sau khi lưu xong, bạn muốn file `PRD_Master.md` trong code được cập nhật theo ý tưởng mới đó, nhưng vẫn giữ nguyên các quy chuẩn code (như Client-side PDF).
- **Cách dùng:** Trong một phiên chat bất kỳ, bạn chỉ cần gõ lệnh:
  > *"Hãy chạy skill `@standardize-prd` để cập nhật PRD giúp tôi"*
- **Kết quả:** AI sẽ tự động đọc file DOCX của bạn, tự động loại bỏ các công nghệ không phù hợp (Server-side PDF), và tự động ghi đè file `PRD/PRD_Master.md` cực kỳ chuẩn xác chỉ trong 10 giây!

---
**💡 CÂU LỆNH MỞ ĐẦU CHO PHIÊN LÀM VIỆC TIẾP THEO:**
> *"Hãy đọc file `HANDBOOK.md` ở thư mục gốc để nắm bối cảnh, sau đó chúng ta bắt đầu kích hoạt Team Frontend code Giao diện cho Module 03 (Fit Score) nhé!"*
