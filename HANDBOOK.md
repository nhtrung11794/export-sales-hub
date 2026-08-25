# 📘 CẨM NANG BÀN GIAO (HANDOFF HANDBOOK)
**Dự án:** Export Sales Interactive Hub (LOS)
**Ngày cập nhật:** 25/08/2026 (Chốt hạ Module 02 & Hệ thống Phân quyền Học viên/Admin)

Tài liệu này là "Điểm nhớ" (Save Point) tổng hợp toàn bộ Tư duy, Kết quả và Kế hoạch để bạn (hoặc bất kỳ AI Agent nào trong phiên tiếp theo) có thể tiếp nối dự án ngay lập tức mà không bị đứt gãy mạch logic.

---

## 1. 🏆 NHỮNG ĐIỂM ĐÃ LÀM ĐƯỢC (ACCOMPLISHED)
1. **Kiến trúc Cốt lõi & Phân quyền (Auth & RBAC v6.0):**
   - **Tự đăng ký & Phê duyệt (Self-signup with Admin Approval):** Người dùng tự đăng ký không cần xác thực email. Tài khoản mới tạo mặc định mang trạng thái `approval_status = 'pending'` và bị điều hướng sang trang chuyên biệt `/pending-approval` (ẩn toàn bộ thanh công cụ học tập).
   - **Admin Dashboard (`/admin`):** Trang quản trị riêng biệt cho `role = 'admin'` với giao diện duyệt/từ chối học viên đăng ký mới bằng một cú click.
   - **Chế độ Khóa Module cho Học viên (Student Pilot Lock):**
     - Mở khóa hoàn toàn **M01 và M02** cho học viên thử nghiệm.
     - Tạm khóa **M03, M04, M05** đối với học viên (`role = 'user'`), hiển thị huy hiệu `🔒 Sắp ra mắt` trên Dashboard & Sidebar, chặn click và tự động đẩy về trang chủ nếu gõ trực tiếp URL.
     - Tài khoản **Admin** vẫn mở khóa toàn bộ 5 Module để tiếp tục lập trình và nghiệm thu.

2. **Giao diện & Logic Module 02 (Hoàn thiện 100%):**
   - **B03 (Target Market & Route to Market):** Nhập liệu ma trận 6 cột, đồng bộ dữ liệu vào Zustand store.
   - **B04 (Buyer Map Org Chart):** Tích hợp kéo thả `@dnd-kit` mượt mà, hỗ trợ flex-wrap tự co giãn kích thước thẻ phòng ban.
   - **B05 (Discovery Insight Matrix):** 
     - 5 lớp thông tin chuẩn: *Context, Need, Pain, Criteria, Risk/Concern*.
     - **Dynamic Design:** Hiệu ứng `:focus-within` làm sáng viền Primary và đổ bóng Glow khi gõ; tự động thu gọn hiệu ứng khi đã hoàn thành; làm mờ các hàng đang khóa.
     - **Typography:** Căn giữa các cột nhập liệu, font-size nhãn lớp thông tin chuẩn `1rem` cân đối.

3. **Chống sập ứng dụng (Graceful Degradation):**
   - Áp dụng triệt để cơ chế Fallback `(data || '').trim()` trên toàn bộ Form và Matrix, giải quyết dứt điểm lỗi crash trang trắng khi schema thay đổi.

---

## 2. ⏳ NHỮNG ĐIỂM CHƯA LÀM ĐƯỢC (NEXT STEPS/PENDING)
*Đây là các Task ưu tiên cao nhất cho Sprint tiếp theo:*
- **[Sprint 2.1] Chuẩn hóa UI/UX Module 03 (Pipeline & Fit Score):** Áp dụng Skill `module-ui-architect` để xây dựng giao diện chấm điểm Fit Score và quản trị cơ hội theo chuẩn M02.
- **[Sprint 2.2] Xây dựng Module 04 (Proposal, Negotiation & L/C Guard):** Lập trình cơ chế chặn rủi ro thanh toán nếu Fit Score M03 thấp.
- **[Sprint 2.3] Xây dựng Module 05 (Execution & Capstone PDF):** Tích hợp công cụ xuất báo cáo PDF cuối khóa.
- **[Sprint 2.4] Tích hợp AI Gemini Spark:** Kết nối API Gemini thật cho các nút gợi ý AI trong form.

---

## 3. 🧠 TƯ DUY & Ý TƯỞNG CỐT LÕI (CORE MINDSET)
Bất kỳ AI nào code dự án này đều phải tuân thủ nghiêm ngặt:
1. **Dynamic Design (Giao diện sống động & Phản hồi xúc giác):** Mọi tương tác nhập liệu đều phải có phản hồi thị giác (Focus Glow, Dimming, Status Badges).
2. **Strict RBAC & Non-intrusive Guard:** Phân tách rõ ràng giữa Admin và Học viên. Mọi cơ chế khóa phải có thông báo thân thiện và chuyển hướng an toàn.
3. **Data Inheritance & Graceful Fallbacks:** Dữ liệu kế thừa xuyên suốt qua Zustand store, luôn có giá trị mặc định để chống sập giao diện.

---

## 4. 🛠️ BỘ CÔNG CỤ TỰ ĐỘNG (SKILLS & TOOLS)
Hệ thống đã được tích hợp sẵn 2 công cụ chuyên biệt trong thư mục `.agents/skills/`:
- **`@standardize-prd`:** Tự động đồng bộ PRD_Master từ file DOCX.
- **`@module-ui-architect`:** Tự động thiết kế, lập trình và chuẩn hóa UI/UX cho các Module (M03, M04, M05) theo đúng triết lý Dynamic Design và State Management đã chốt ở Module 02.

---
**💡 CÂU LỆNH MỞ ĐẦU CHO SPRINT TIẾP THEO:**
> *"Hãy sử dụng skill `@module-ui-architect` để bắt đầu thiết kế và lập trình giao diện chuẩn cho Module 03 (Bài 06 và Bài 07) nhé!"*
