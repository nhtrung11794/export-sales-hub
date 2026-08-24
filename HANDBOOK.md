# 📘 CẨM NANG BÀN GIAO (HANDOFF HANDBOOK)
**Dự án:** Export Sales Interactive Hub (LOS)
**Ngày cập nhật:** 24/08/2026 (Chốt hạ Đội ngũ Nhân sự v5.0)

Tài liệu này là "Điểm nhớ" (Save Point) tổng hợp toàn bộ Tư duy, Kết quả và Kế hoạch để bạn (hoặc bất kỳ AI Agent nào trong phiên tiếp theo) có thể tiếp nối dự án ngay lập tức mà không bị đứt gãy mạch logic.

---

## 1. 🏆 NHỮNG ĐIỂM ĐÃ LÀM ĐƯỢC (ACCOMPLISHED)
1. **Kiến trúc Cốt lõi (Master PRD v5.0):**
   - Đã chuẩn hóa kiến trúc Next.js App Router + Supabase (JSONB).
   - Chốt sử dụng **Server Actions** thay vì REST API.
   - Chốt sử dụng **Client-side PDF (html2pdf)** thay vì Vercel Chromium.
2. **Giao diện & Logic (UI/UX):**
   - Xây dựng thành công Global Store (`useModuleStore.ts`).
   - Xây dựng hook `useAutoSave` (Debounce 3s) liên kết mượt mà với Supabase.
   - Đã hoàn thiện **Module 01, 02, và 03**. Trong đó M03 đã có thanh trượt Fit Score (Cognitive Simulation) và lấy dữ liệu thành công từ M02.
3. **Định nghĩa Đội ngũ (Agent Roles v5.0):**
   - **Dev Agents:** FE-01 (Frontend), DB-02 (Backend/JSONB), DevOps-03.
   - **AI Tutors:** 
     - *NotebookLM Agent:* Dùng cơ chế Click-to-copy prompt và nhảy tab (Miễn phí, an toàn).
     - *Sanity Check Agent:* Thuật toán Frontend/Backend. Nếu gõ rác (<50 từ) thì vẫn cho Auto-save nhưng sẽ **khóa nút xuất PDF** ở chặng cuối.

## 2. ⏳ NHỮNG ĐIỂM CHƯA LÀM ĐƯỢC (NEXT STEPS/PENDING)
*Đây là các Task ưu tiên cao nhất cho Sprint tiếp theo:*
- **[Sprint 1.2] Khóa Rủi ro M04:** Chặn thanh toán (D/P, CAD) nếu Fit Score ở M03 thấp. Ép học viên phải chọn L/C an toàn.
- **[Sprint 1.3] System (Reverse-flow Edit):** Viết Logic tạo Snapshot history khi học viên sửa data M02 cũ để không làm gãy data M03, M04.

## 3. 🧠 TƯ DUY & Ý TƯỞNG CỐT LÕI (CORE MINDSET)
Bất kỳ AI nào code dự án này đều phải thấm nhuần:
1. **Cognitive Simulation (Mô phỏng tư duy):** Form không chỉ để điền chữ. Hệ thống phải liên tục "làm khó" học viên bằng các rào cản nghiệp vụ dựa trên dữ liệu họ đã nhập.
2. **Data Inheritance (Kế thừa Non-destructive):** Dữ liệu chảy từ M01 -> M05. Nếu M02 sửa đổi, tuyệt đối không xóa bài tự luận của học viên ở M03, chỉ hiện Cờ đỏ cảnh báo.
3. **JSONB Agility:** Toàn bộ form được lưu trong cột `form_data` (JSONB) của bảng `module_submissions`.

## 4. 🛠️ BỘ CÔNG CỤ TỰ ĐỘNG (SKILLS & TOOLS)
Hãy tham khảo file **`AI_TOOLS_LIBRARY.md`** ở thư mục gốc để lấy các câu lệnh thần chú (System Commands) kích hoạt các AI Agents. Nổi bật nhất là lệnh:
> `[RUN_TOOL: @standardize-prd]` - Tự động cập nhật PRD_Master nếu bạn sửa file Word.

---
**💡 CÂU LỆNH MỞ ĐẦU CHO SPRINT TIẾP THEO:**
> *"Hãy đóng vai `FE-01` và `DB-02`, bắt đầu code Giao diện và Logic cho Module 04. Nhớ áp dụng cơ chế chặn rủi ro thanh toán nếu Fit Score M03 thấp nhé!"*
