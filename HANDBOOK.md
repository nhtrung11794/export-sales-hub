# 📘 CẨM NANG BÀN GIAO (HANDOFF HANDBOOK)
**Dự án:** Export Sales Interactive Hub (LOS)  
**Ngày cập nhật:** 27/08/2026 (Chốt hạ toàn diện Module 01 -> Module 04, RBAC, AI Assistant & Tooling)

Tài liệu này là "Điểm nhớ" (Save Point) tổng hợp toàn bộ Tư duy, Kết quả, Công cụ và Kế hoạch để bạn hoặc bất kỳ AI Agent nào trong phiên tiếp theo có thể tiếp nối dự án ngay lập tức mà không bị đứt gãy mạch logic.

---

## 1. 🏆 NHỮNG ĐIỂM ĐÃ LÀM ĐƯỢC (ACCOMPLISHED)

### 1.1. Kiến trúc Cốt lõi & Phân quyền (Auth & RBAC v6.0)
- **Tự đăng ký & Phê duyệt (Self-signup with Admin Approval):** Người dùng tự đăng ký không cần xác thực email. Trạng thái mặc định `approval_status = 'pending'`, tự động chuyển hướng tới `/pending-approval` để bảo vệ tài nguyên học tập.
- **Admin Dashboard (`/admin`):** Giao diện quản trị viên 1-click phê duyệt/từ chối học viên.
- **Chế độ Khóa Module (Student Pilot Lock):**
  - Mở quyền trải nghiệm thực tế cho học viên ở **M01 và M02**.
  - Tạm khóa các Module sau đối với tài khoản học viên thường (`role = 'user'`) kèm huy hiệu `🔒 Sắp ra mắt`.
  - Tài khoản `role = 'admin'` mở toàn quyền truy cập để phát triển và nghiệm thu.

### 1.2. Hoàn thiện 100% Giao diện & Logic Nghiệp vụ các Module:
- **Module 01: Export Sales Strategy & Foundation:** Chuẩn hóa form mục tiêu doanh thu, sản phẩm xuất khẩu và năng lực lõi.
- **Module 02: Market & Customer Understanding (ICP):**
  - B03: Ma trận 6 cột Target Market & Route to Market.
  - B04: Sơ đồ tổ chức Buyer Map với kéo thả `@dnd-kit` mượt mà.
  - B05: Ma trận 5 lớp Discovery Insight (*Context, Need, Pain, Criteria, Risk/Concern*), căn giữa bảng và Dynamic Focus Glow.
  - **Bổ sung Trợ lý AI:** Tích hợp cả **Gemini Spark** lẫn **GPT Chuyên gia Nghiên cứu Thị trường & Đối thủ** trực tiếp tại Cột 3.
- **Module 03: Lead Generation & Qualification:**
  - B06: Kênh tiếp cận & Lead Sourcing.
  - B07: Ma trận sàng lọc F-N-A-C-M (Fit, Need, Authority, Commercial, Mindset) và chấm điểm Access Score.
  - B08: Lead Enrichment & Chiến lược tạo cơ hội.
- **Module 04: Proposal, Negotiation & Safe Closing ("Máy ép kỷ luật thương mại"):**
  - B09: Ma trận P-B-T-P-C (*Product, Business, Transport, Payment, Compliance*) với **Go/No-go Gate**.
  - B10: **TCO Calculator** tính Landed Cost tự động & Rào cản định giá 3 tùy chọn (Pricing Anchoring).
  - B11: **Trade-off Gate (Bàn cân đàm phán)**: Báo đỏ 🔴 và chặn nhượng bộ miễn phí nếu có GIVE mà không có TAKE.
  - B12: **Payment Risk Gate**: Tự động bôi xám các phương thức rủi ro (O/A, D/P) nếu điểm tín nhiệm từ B07 thấp; bắt buộc viết Giải trình rủi ro (Bypass Rule) và hoàn thành Safe Order Checklist.

### 1.3. Đóng gói Công cụ & Tự động hóa (Tools & Skills)
- Đóng gói file công cụ **[`PRD/🚀_1_CLICK_CHUAN_HOA_PRD.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Website%20Chuy%C3%AAn%20trang%20H%E1%BB%8Dc%20t%E1%BA%ADp%20XK%20B2B/PRD/%F0%9F%9A%80_1_CLICK_CHUAN_HOA_PRD.md)** giúp kích hoạt skill `@standardize-prd` bằng một thao tác dán lệnh.
- Hệ thống đã vượt qua kiểm tra `npx tsc --noEmit` (0 lỗi) và tự động Deploy thành công lên **Vercel**.

---

## 2. ⏳ NHỮNG ĐIỂM CHƯA LÀM ĐƯỢC (NEXT STEPS / PENDING)

- **[Sprint Cuối] Xây dựng Module 05 (Execution, Recovery & Account Growth - B13 đến B16):**
  - B13: Quản trị thực thi đơn hàng & Xử lý sự cố phát sinh (Dispute & Claim Management).
  - B14: Quy trình chăm sóc & Mở rộng tài khoản khách hàng (Account Expansion / Cross-selling).
  - B15: Tổng kết chiến lược & Đánh giá năng lực Sales.
  - B16: **Capstone Project & Xuất Báo cáo PDF:** Cơ chế tổng hợp dữ liệu xuyên suốt từ M01 -> M05 thành bản Kế hoạch Kinh doanh Xuất khẩu hoàn chỉnh.
- **Tối ưu hóa Video Hosting:** Sẵn sàng chuyển đổi trình phát PiP sang `<iframe>` để nhúng video YouTube Unlisted / Vimeo nếu có video bài giảng dài (>50MB).

---

## 3. 🧠 TƯ DUY & Ý TƯỞNG CỐT LÕI (CORE MINDSET)

1. **Dynamic Design & Touch Feedback:** Luôn có phản hồi thị giác tức thời (`:focus-within`, Glow, Row Dimming cho hàng khóa, Badges màu phân loại).
2. **Kỷ luật thương mại thông qua Rào cản (Gating System):** Không để học viên điền bừa; hệ thống bắt buộc phải tính toán TCO, đánh đổi Give-Take và giải trình rủi ro thanh toán.
3. **Data Inheritance & Defensive Fallbacks:** Kế thừa dữ liệu giữa các bài qua Zustand store, luôn bọc `(data || '').trim()` để đảm bảo không bao giờ sập giao diện khi có thay đổi schema.
4. **Tối ưu chi phí hạ tầng:** Tận dụng triệt để Supabase Free Tier + Giải pháp Embed YouTube/Drive/iLovePDF cho tài nguyên đa phương tiện nặng.

---

## 4. 🛠️ BỘ CÔNG CỤ TỰ ĐỘNG (SKILLS & TOOLS)

| Tên Tool / Skill | Vị trí | Công dụng & Cách gọi |
| :--- | :--- | :--- |
| **`@standardize-prd`** | `.agents/skills/standardize-prd` | Tự động đọc file `.docx` mới và đồng bộ vào `PRD_Master.md`. Dùng nhanh qua file `PRD/🚀_1_CLICK_CHUAN_HOA_PRD.md`. |
| **`@module-ui-architect`** | `.agents/skills/module-ui-architect` | Tự động thiết kế và code giao diện chuẩn hóa (Dynamic Design, 3-column layout, Gates, Fallbacks). |

---

**💡 CÂU LỆNH MỞ ĐẦU CHO PHIÊN TIẾP THEO:**
> *"Hãy sử dụng skill `@module-ui-architect` để thiết kế và lập trình giao diện cho Module 05 (Module cuối cùng) nhé!"*
