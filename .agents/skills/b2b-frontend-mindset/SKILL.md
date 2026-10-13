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
*   **Kiến trúc CSS Tập trung (Centralized vs Inline Styles):** Quản lý tập trung mọi nút điều hướng quan trọng trong Design System (`globals.css`) thông qua các class như `.btn-header-action`. CẤM dùng inline style phân mảnh `padding/fontSize`.
*   **Thẩm mỹ Khóa Bài (Locked UX):** Dùng thanh Status Bar kính mờ (`Online` + badge hổ phách `🔒 Đã Nộp & Khóa Sửa`), làm mờ nhẹ form `opacity: 0.7` và khóa chuột `pointerEvents: none`. Triệt tiêu hoàn toàn khung viền đỏ nét đứt gây đứt gãy thị giác.
*   **Single Source of Truth:** Text, Tên Module, Mô tả... bắt buộc phải đối chiếu và lấy từ tài liệu `PRD_Master.md`.

## 2. SKILL (Kỹ Năng Chuẩn Hóa Module)

Khi được yêu cầu "Chuẩn hóa Layout cho Module X", Agent phải tự động:
1.  **Layout 3 Cột:** Áp dụng kiến trúc Cột 1 (Đọc tài liệu/Video PiP), Cột 2 (Form/Workbook), Cột 3 (AI Tutor) giống như `ModuleLayout.tsx`.
2.  **Context-on-Demand:** Cài đặt các Collapsible Header tĩnh nằm ở Cột 2 để kế thừa dữ liệu từ bài trước (Ví dụ: Module 04 phải lấy thông tin ICP từ Module 02).
3.  **Bảo vệ Dữ liệu:** Lắng nghe sự kiện `window.addEventListener('offline', ...)` để chuyển Form sang trạng thái Khóa (Read-only) khi rớt mạng.
4.  **Kiểm soát Status Bar Độc quyền:** Thẻ `#status-bar` do `useAutoSave.ts` và handler submit/unlock quản lý. Tuyệt đối KHÔNG viết `useEffect` cục bộ ghi đè chữ "Bản nháp" khi re-render.
5.  **Chuẩn hóa Header Action:** Bắt buộc gắn `headerActionNode` với class `.btn-header-action` kèm `.btn-primary` (Nộp bài) hoặc `.btn-warning` (Mở khóa) để kích thước luôn đồng bộ tuyệt đối trên toàn bộ hệ thống.

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

### 3.4. Tool UI: Nút Header Action Chuẩn Hóa (.btn-header-action)
Áp dụng cho mọi nút hành động tại Cột 2 `ModuleLayout`:
```tsx
headerActionNode={
  isLocked ? (
    <button
      onClick={handleUnlock}
      disabled={isSubmitting}
      className="btn-header-action btn-warning"
    >
      {isSubmitting ? 'Đang mở khóa...' : 'Mở Khóa để Sửa'}
    </button>
  ) : (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="btn-header-action btn-primary"
    >
      {isSubmitting ? 'Đang nộp...' : 'Xác nhận Nộp bài'}
    </button>
  )
}
```

### 3.5. Tool UI: Thanh Status Header Bar Kính Mờ & Badge Khóa Bài
```tsx
<div style={{
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 20px', background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '12px', border: '1px solid var(--border-color)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
      <Wifi size={16} /> Online
    </span>
    {isLocked && (
      <span style={{ marginLeft: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
        🔒 Đã Nộp & Khóa Sửa
      </span>
    )}
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
    {status === 'saving' && <span style={{ color: 'var(--accent-primary)' }}><CloudUpload size={16} /> Đang lưu...</span>}
    {status === 'saved' && <span style={{ color: '#10b981' }}><CheckCircle2 size={16} /> Đã lưu tự động</span>}
  </div>
</div>
```

