# PRD Strict Compliance & Cascade Updates

This rule is mandatory for all AI agents working on the Export Sales Interactive Hub project.

## 1. Single Source of Truth (PRD-First Approach)
- **Luôn truy xuất PRD:** Trước khi viết code, thiết kế UI, hoặc sửa đổi bất kỳ logic nào, bạn PHẢI tìm kiếm và đối chiếu với tài liệu PRD (`PRD/PRD_Master.md`).
- **Không tự ý bịa đặt nội dung:** Tuyệt đối tuân thủ theo các định nghĩa, tên gọi, tiêu đề, và thuật toán ràng buộc đã được phê duyệt trong PRD. 
- **PRD là Pháp lệnh:** Nếu có sự mâu thuẫn giữa Code hiện tại và PRD, PRD luôn là chuẩn mực cao nhất. AI phải chủ động sửa Code để khớp với PRD.

## 2. Cascade Updates (Cập nhật Dây chuyền & Kế thừa)
- **Nhạy bén với sự thay đổi:** Khi có một sự thay đổi về mặt thiết kế, nội dung, hoặc cấu trúc dữ liệu ở một khu vực, bạn BẮT BUỘC phải rà soát và điều chỉnh TƯƠNG ỨNG những nội dung có liên đới.
- **Tính liên kết & Kế thừa chặt chẽ:** 
  - Cập nhật lại cấu trúc Dữ liệu gốc (Database/State/Interfaces).
  - Cập nhật lại các câu lệnh (Prompt) của Trợ lý AI nếu chúng nội suy dữ liệu đó.
  - Rà soát lại các Module học tập phía sau có tính chất kế thừa (Context-on-Demand) để đảm bảo không bị gãy luồng dữ liệu.
  - Áp dụng các kỹ thuật Fallback (Optional Chaining, Default Values) để ứng dụng không bị Crash với các dữ liệu cũ (Backward Compatibility).
