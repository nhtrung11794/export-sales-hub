# 📘 CẨM NANG BÀN GIAO & TỔNG KẾT TOÀN DIỆN (HANDOFF HANDBOOK)
**Dự án:** Export Sales Interactive Hub (LOS) — Nền Tảng Học Tập Xuất Khẩu B2B Thực Chiến  
**Phiên bản:** v7.1 (Tích hợp Google Drive API, Nhúng Slide 15 Bài Học Trực Tiếp & Skill `@sync-drive-materials`)  
**Ngày cập nhật:** 28/08/2026

Tài liệu này là "Điểm nhớ" (Save Point) tổng hợp toàn bộ **Tư duy, Kết quả, Kỹ thuật, Lỗi quan trọng đã sửa, Công cụ và Skill** để người dùng hoặc bất kỳ AI Agent nào trong các phiên tiếp theo có thể tiếp nối, nâng cấp hoặc bảo trì dự án ngay lập tức mà không bao giờ bị đứt gãy mạch logic.

---

## 1. 🏆 NHỮNG ĐIỂM ĐÃ LÀM ĐƯỢC (ACCOMPLISHED)

### 1.1. Hoàn thiện 100% Hành trình 15 Buổi Học (M01 -> M05)
- **Module 01: Mindset & Foundation (B01 - B02)**:
  - B01: Radar 11 năng lực xuất khẩu B2B cốt lõi.
  - B02: Cấu trúc mục tiêu 90 ngày dạng Mad Libs 3 thành phần.
- **Module 02: Market & ICP (B03 - B06)**:
  - B03: Ma trận 6 cột Target Market & Route to Market + Tích hợp Rào cản pháp lý.
  - B04: Sơ đồ tổ chức Buyer Map kéo thả `@dnd-kit` đa tầng quyền lực.
  - B05: Discovery Matrix 5 lớp (*Context, Need, Pain, Criteria, Risk*) với Dynamic Focus Glow.
  - Trợ lý AI Cột 3: Tích hợp Gemini Spark và GPT Chuyên gia Nghiên cứu Thị trường.
- **Module 03: Lead Generation & Qualification (B07 - B08)**:
  - B06: Kênh tiếp cận & Lead Sourcing (tối đa 2 target accounts).
  - B07: Ma trận sàng lọc F-N-A-C-M (*Fit, Need, Authority, Commercials, Market Timing*) và chấm điểm Access Score.
  - B08: Kịch bản Follow-up đa kênh và quản trị Pipeline.
- **Module 04: Proposal, Negotiation & Safe Closing (B09 - B12)**:
  - B09: Trạm làm rõ yêu cầu P-B-T-P-C (*Product, Budget, Timeline, Payment, Compliance*) với Toggle tương tác và Placeholders chuyên sâu.
  - B10: Bảng tính Landed Cost (bổ sung phí kiểm định SGS/C/O) & Rào cản Chào giá Chim mồi (Decoy Pricing Gate).
  - B11: Bàn cân đàm phán Give–Take Bank (Tooltip trích xuất nỗi đau Buyer từ B05 để đòi hỏi điều kiện có lợi).
  - B12: Kiểm soát rủi ro thanh toán & Interactive Safe Order Checklist (bắt buộc tick đủ 3 bước để hoàn tất clearance M04).
- **Module 05: Execution, Recovery & Account Growth (B13 - B15)**:
  - B13: Cam kết dịch vụ nội bộ (Internal SLA Gate khóa mốc tiến độ nếu chưa đạt 4/5) & Khóa cứng mốc `Point of No Return 🔒`.
  - B14: Xử lý khủng hoảng với Crisis UX Pop-up Email giận dữ từ khách hàng + Bộ quét từ khóa pháp lý (`compensate, refund, đền bù...`) theo thời gian thực.
  - B15: Kế hoạch tăng trưởng tài khoản chiến lược (JBP), Ma trận Share of Wallet, Trust Score Gate ($<50$ khóa Up-sell) & Modal kết nối Buyer Map B04.

---

### 1.2. Khoang Final Capstone Độc Lập & Cỗ Máy Xuất Bản 3 Playbook
- **Tách Khoang Độc Lập (`/capstone`)**: Tách bài 16 thành Khoang Capstone riêng biệt, bao quát toàn bộ 15 buổi học.
- **Zone 01 (Deep-linking Split-View)**: 5 Thẻ Module tương tác, bấm thẻ nào mở ngay ngăn kéo Split-View focus vào tab đó (Zero-context-switching).
- **Zone 02 (Closed-loop Mindset Shift)**: Callout `[📌 Nhìn lại: Mục tiêu 90 ngày viết ở Buổi 02]` hiển thị nguyên văn câu Mad Libs ban đầu đối chiếu với Kế hoạch 90 ngày mới.
- **Zone 03 (Actionable Garbage Filter & Gamified Preview)**:
  - Các dòng lỗi Garbage Filter là Hyperlinks nhảy thẳng đến Module cần sửa trong Split-View.
  - Nút `[👁️ Xem trước (Preview)]` luôn mở được bản nháp Playbook có Watermark mờ kích thích học viên hoàn thiện dữ liệu.
  - Bộ xuất bản in ấn kết xuất chuẩn hóa **Bộ 03 Playbook Xuất Khẩu B2B**:
    1. *Playbook 01: Market & Outreach (M01–M03)*
    2. *Playbook 02: Commercial Deal Desk (M04)*
    3. *Playbook 03: Execution & JBP Growth (M05)*
- **Trực Quan Hóa Ngăn Kéo Split-View**: Thay thế 100% mã JSON thô bằng Lưới thanh tiến độ Năng lực Radar 1-5 ⭐ (M01), Thẻ Thị trường & ICP (M02), Bảng F-N-A-C-M (M03), Bảng P-B-T-P-C (M04), Thẻ CAPA 3 bước (M05) và nút `[✏️ Sửa tại Module]`.

---

### 1.3. Hạ Tầng Chống Sập & Khắc Phục Lỗi Runtime
- **React ErrorBoundary (`src/components/common/ErrorBoundary.tsx`)**: Bọc an toàn các module và Capstone, bắt chính xác lỗi React và hiển thị hộp thoại khắc phục thay vì màn hình đen "This page couldn't load".
- **Sửa Lỗi React Child Object (`Minified React error #31`)**: Viết hàm `formatM01Goal` và `formatPain` để bóc tách an toàn object `{ input1, input2, input3 }` của Mad Libs thành câu hoàn chỉnh, triệt tiêu lỗi render object trực tiếp.
- **Route Protection Middleware (`src/proxy.ts`)**: Bổ sung `/capstone` và `/admin` vào danh sách route yêu cầu xác thực.
- **Dọn Dẹp Xung Đột Route**: Xóa thư mục trùng lặp `(modules)/capstone` tránh xung đột Next.js App Router.

---

### 1.4. Tích Hợp Google Drive API & Trình Đọc Slide Nhúng 15 Buổi Học (Zero-Context Switching)
- **Xác thực Service Account**: Tích hợp `googleapis` kết nối thông qua file `credentials.json` an toàn (đã cấu hình `.gitignore`).
- **Trích xuất ID & Bỏ qua lỗi Quota**: Quét toàn bộ thư mục bài giảng bằng regex nhận diện bài `B01` - `B15`, trích xuất File ID trực tiếp và gắn link `https://drive.google.com/file/d/{fileId}/preview` vào `src/lib/courseMaterials.ts`.
- **Trình đọc Slide Split-View**: Tích hợp Google Drive PDF Reader trực tiếp vào cột 1 của `ModuleLayout` cho toàn bộ 5 Module, cho phép học viên đọc slide mà không bao giờ phải rời khỏi giao diện học tập.

---

## 2. ⏳ NHỮNG ĐIỂM CẦN LƯU Ý & CẢI TIẾN TIẾP THEO (PENDING / NEXT STEPS)

1. **Khóa Supabase Enum Constraint**:
   - Khi chạy `submitModule('CAPSTONE')`, nếu bảng `module_submissions` trong Supabase có ràng buộc `CHECK (module_id IN ('M01','M02','M03','M04','M05'))` thì cần chạy lệnh SQL trên Supabase:
     ```sql
     ALTER TABLE module_submissions DROP CONSTRAINT IF EXISTS module_submissions_module_id_check;
     ALTER TABLE module_submissions ADD CONSTRAINT module_submissions_module_id_check 
       CHECK (module_id IN ('M01', 'M02', 'M03', 'M04', 'M05', 'CAPSTONE'));
     ```
2. **Video Hosting Dự Phòng**:
   - Khi tải lên các video bài giảng thực tế dung lượng lớn (>50MB), ưu tiên dùng YouTube Unlisted / Vimeo và nhúng qua thẻ `<iframe>` trong component PiP player.
3. **Mở Rộng Dữ Liệu Demo**:
   - Cho phép giáo viên / admin nạp bộ dữ liệu mẫu (Seed Data) để học viên mới có thể bấm xem thử trọn vẹn 1 Deal hoàn chỉnh từ M01 đến M05.
4. **Cú pháp Lệnh Shell trên Windows**:
   - Dùng dấu `;` thay vì `&&` khi chuỗi lệnh trong PowerShell (ví dụ: `git add . ; git commit -m "..." ; git push`).

---

## 3. 🧠 TƯ DUY & Ý TƯỞNG CỐT LÕI (CORE MINDSET & PHILOSOPHY)

1. **Tư Duy Máy Ép Kỷ Luật (Gating System)**:
   - Không cho phép học viên điền tắt hoặc điền bừa. Mọi bước đi đều có chốt chặn logic:
     - Chưa qua SLA $\rightarrow$ Khóa Timeline & Kanban (B13).
     - Chưa có SGS $\rightarrow$ Khóa cam kết đền bù pháp lý (B14).
     - Trust Score thấp $\rightarrow$ Khóa Up-sell, ép tập trung vào Repeat Order (B15).
     - Chưa qua Garbage Filter $\rightarrow$ Khóa tải PDF chính thức (Capstone).
2. **Tư Duy Đóng Kín Vòng Lặp (Closed-Loop Data Inheritance)**:
   - Dữ liệu không biến mất mà luôn chảy xuyên suốt từ bài trước sang bài sau:
     - Nỗi đau Buyer B05 $\rightarrow$ Gợi ý TAKE trong Đàm phán B11.
     - Buyer Map B04 $\rightarrow$ Danh sách họp QBR B15.
     - Mục tiêu ban đầu B02 $\rightarrow$ Đối chiếu Kế hoạch 90 ngày Capstone.
3. **Phản Hồi Xúc Giác & Động Lực (Gamification & Tactile UX)**:
   - Bấm mở xem trước Playbook bị làm mờ (Blur + Watermark) tạo động lực hoàn thành dữ liệu.
   - Thao tác nhấp lỗi đỏ tự động dẫn đến đúng vị trí cần sửa (Zero friction).
4. **Phòng Vệ Dữ Liệu Tuyệt Đối (Bulletproof Defensive Coding)**:
   - Luôn kiểm tra `Array.isArray()`, `typeof === 'object'`, fallback chuỗi rỗng `(val || '')`, bọc `ErrorBoundary` ở mọi cấp.

---

## 4. 🛠️ BỘ CÔNG CỤ TỰ ĐỘNG HÓA (SKILLS & TOOLS)

| Công cụ / Skill | Đường dẫn | Công dụng & Cách kích hoạt |
| :--- | :--- | :--- |
| **`@sync-drive-materials`** | [`.agents/skills/sync-drive-materials/SKILL.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Website%20Chuy%C3%AAn%20trang%20H%E1%BB%8Dc%20t%E1%BA%ADp%20XK%20B2B/.agents/skills/sync-drive-materials/SKILL.md) | Tự động quét Google Drive bằng Service Account, lấy File ID và nhúng 15 Slide bài giảng vào `courseMaterials.ts`. |
| **`@module-ui-architect`** | [`.agents/skills/module-ui-architect/SKILL.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Website%20Chuy%C3%AAn%20trang%20H%E1%BB%8Dc%20t%E1%BA%ADp%20XK%20B2B/.agents/skills/module-ui-architect/SKILL.md) | Tự động thiết kế, lập trình và chuẩn hóa UI/UX các Module theo đúng chuẩn Dynamic Design, Gating, State Management & ErrorBoundary. |
| **`@standardize-prd`** | [`.agents/skills/standardize-prd/SKILL.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Website%20Chuy%C3%AAn%20trang%20H%E1%BB%8Dc%20t%E1%BA%ADp%20XK%20B2B/.agents/skills/standardize-prd/SKILL.md) | Đọc file Word `.docx` mới và đồng bộ tự động vào `PRD_Master.md`. |
| **1-Click Chuẩn Hóa Tool** | [`🚀_1_CLICK_CAP_NHAT_CHUAN_HOA.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/Website%20Chuy%C3%AAn%20trang%20H%E1%BB%8Dc%20t%E1%BA%ADp%20XK%20B2B/%F0%9F%9A%80_1_CLICK_CAP_NHAT_CHUAN_HOA.md) | File lệnh mẫu 1-click dán vào chat để AI tự động kiểm tra, rà soát và chuẩn hóa toàn bộ hệ thống. |

---

## 5. 💡 HƯỚNG DẪN KÍCH HOẠT NHANH PHIÊN TIẾP THEO

Khi bắt đầu phiên làm việc mới, bạn chỉ cần gõ:
> *"Đọc file `HANDBOOK.md` và sử dụng skill `@module-ui-architect` hoặc `@sync-drive-materials` để tiếp tục chuẩn hóa và kiểm thử hệ thống."*
