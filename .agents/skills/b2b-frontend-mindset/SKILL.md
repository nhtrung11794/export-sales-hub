---
name: b2b-frontend-mindset
description: "Cẩm nang (Handbook), Kỹ năng (Skill) và Công cụ (Tool) chuẩn hóa giao diện B2B Export Sales"
---

# B2B FRONTEND MINDSET

Đây là bộ não (Handbook), bộ Kỹ năng (Skill) và bộ Công cụ (Tool) được trích xuất từ phiên chuẩn hóa Front Page. 
Bất cứ khi nào tạo trang mới hoặc module mới, Agent phải đọc và tự động áp dụng các tiêu chuẩn này.

## 1. HANDBOOK (Cẩm Nang Tư Duy Thiết Kế)

*   **Ngôn ngữ thiết kế (Aesthetics):** Premium, Glassmorphism (Kính mờ), Dark Mode. Sử dụng đổ bóng (`boxShadow`), đường viền mờ (`border: 1px solid rgba(...)`) và bo góc (`borderRadius: 12px/16px`).
*   **Typography:** Bắt buộc sử dụng **"Be Vietnam Pro"** làm font chữ gốc (`var(--font-sans)`, `var(--font-heading)`) để tối ưu triệt để Tiếng Việt.
*   **Màu sắc chủ đạo:** 
    *   Nền: Các tone màu đen/xanh than đậm (`#0f172a`).
    *   Nhấn (Accent): Gradient xanh - tím (`#3b82f6` sang `#8b5cf6`), Đỏ cảnh báo (`#ef4444`).
*   **Triết lý Fail-safe (Chống lỗi dán đoạn):** Nếu gọi API (Supabase) thất bại, KHÔNG ĐƯỢC để sập giao diện. Phải có dữ liệu giả (Mockup) thay thế và hiển thị Dòng thông báo lỗi nhỏ màu đỏ ở ngay trên UI để tiện Debug.
*   **Single Source of Truth:** Text, Tên Module, Mô tả... bắt buộc phải đối chiếu và lấy từ tài liệu `PRD_Master.md`.

## 2. SKILL (Kỹ Năng Chuẩn Hóa Module)

Khi được yêu cầu "Chuẩn hóa Layout cho Module X", Agent phải tự động:
1.  **Layout 3 Cột:** Áp dụng kiến trúc Cột 1 (Đọc tài liệu/Video PiP), Cột 2 (Form/Workbook), Cột 3 (AI Tutor) giống như `ModuleLayout.tsx`.
2.  **Context-on-Demand:** Cài đặt các Collapsible Header tĩnh nằm ở Cột 2 để kế thừa dữ liệu từ bài trước (Ví dụ: Module 04 phải lấy thông tin ICP từ Module 02).
3.  **Bảo vệ Dữ liệu:** Lắng nghe sự kiện `window.addEventListener('offline', ...)` để chuyển Form sang trạng thái Khóa (Read-only) khi rớt mạng.

## 3. TOOLSET (Công Cụ Snippets Dùng Sẵn)

### 3.1. Tool Đẩy Code PowerShell (Windows Git)
Tuyệt đối không dùng dấu `\` (backslash) để add file đơn lẻ trong PowerShell. Luôn dùng khối lệnh tiêu chuẩn sau để đẩy lên Vercel:
```powershell
git add .
git commit -m "<type>: <mô_tả_chi_tiết_tiếng_anh>"
git push
```

### 3.2. Tool UI: Khối Cảnh Báo Lỗi Debug Supabase
Gắn đoạn code này vào mọi Component có gọi Database để User báo lỗi dễ dàng:
```tsx
{debugError && (
  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #ef4444', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', color: '#fca5a5', marginTop: '12px' }}>
    <strong>⚠️ Debug Supabase:</strong> {debugError}
  </div>
)}
```

### 3.3. Tool UI: Nút Gradient Chuẩn
```tsx
<button style={{ 
  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
}}>
  Lưu thông tin
</button>
```
