'use client';

import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  Users, 
  User, 
  Settings, 
  Calendar, 
  MapPin, 
  Building2, 
  Award,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { StudentSubmissionSummary, RubricCriteriaScore } from './mockStudentData';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentSubmissionSummary[];
  defaultCohort?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  students,
  defaultCohort = 'ALL'
}) => {
  // 1. Chế độ in: 'summary' (Bảng tổng hợp cả lớp - Landscape) hoặc 'individual' (Phiếu cá nhân - Portrait)
  const [printType, setPrintType] = useState<'summary' | 'individual'>('summary');
  const [selectedCohort, setSelectedCohort] = useState<string>(defaultCohort);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');

  // 2. Thông tin hành chính có thể tùy chỉnh nhanh trước khi in
  const today = new Date();
  const defaultDateStr = `Hà Nội, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  const [centerName, setCenterName] = useState<string>('TRUNG TÂM ĐÀO TẠO KỸ NĂNG XUẤT NHẬP KHẨU B2B');
  const [courseName, setCourseName] = useState<string>('CHƯƠNG TRÌNH ĐÀO TẠO KỸ NĂNG XUẤT KHẨU B2B THỰC CHIẾN (15 BUỔI)');
  const [batchName, setBatchName] = useState<string>('Lớp K01 - Chiến Binh B2B');
  const [instructorName, setInstructorName] = useState<string>('Nguyễn Hoàng Trung');
  const [instructorTitle, setInstructorTitle] = useState<string>('Giảng Viên Phụ Trách Chuyên Môn');
  const [centerRepTitle, setCenterRepTitle] = useState<string>('Đại Diện Ban Quản Lý Đào Tạo');
  const [centerRepName, setCenterRepName] = useState<string>('(Ký và ghi rõ họ tên)');
  const [reportDate, setReportDate] = useState<string>(defaultDateStr);

  // Lấy danh sách cohort duy nhất
  const cohorts = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.cohort) set.add(s.cohort);
    });
    return Array.from(set);
  }, [students]);

  // Danh sách học viên theo bộ lọc
  const targetStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedCohort === 'ALL') return true;
      return s.cohort === selectedCohort;
    });
  }, [students, selectedCohort]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = targetStudents.length;
    const evaluated = targetStudents.filter(s => s.isEvaluated).length;
    const totalScores = targetStudents.filter(s => s.isEvaluated).reduce((sum, s) => sum + s.totalScore, 0);
    const avgScore = evaluated > 0 ? (totalScores / evaluated).toFixed(1) : '0.0';
    const distinction = targetStudents.filter(s => s.gradeStatus === 'distinction').length;
    const passed = targetStudents.filter(s => s.gradeStatus === 'passed').length;
    const revision = targetStudents.filter(s => s.gradeStatus === 'needs_revision').length;
    const pending = targetStudents.filter(s => s.gradeStatus === 'pending').length;

    return { total, evaluated, avgScore, distinction, passed, revision, pending };
  }, [targetStudents]);

  if (!isOpen) return null;

  // Xử lý in thực tế: Mở cửa sổ in sạch hoàn toàn
  const handleTriggerPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép trình duyệt mở cửa sổ Pop-up để in báo cáo.');
      return;
    }

    let printHtml = '';

    if (printType === 'summary') {
      // BẢNG TỔNG HỢP CẢ LỚP (A4 LANDSCAPE)
      printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bảng Tổng Hợp Kết Quả Đào Tạo - ${escapeHtml(batchName)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10.5pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .header-table td {
      vertical-align: top;
      padding: 0;
      border: none;
    }
    .title-block {
      text-align: center;
      margin: 10px 0 16px;
    }
    .title-block h1 {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }
    .title-block p {
      margin: 2px 0;
      font-style: italic;
      font-size: 10pt;
    }
    .stats-bar {
      display: flex;
      justify-content: space-between;
      border: 1px solid #333;
      padding: 6px 12px;
      margin-bottom: 12px;
      font-size: 9.5pt;
      background: #fbfbfb;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000;
      padding: 5px 4px;
      text-align: center;
    }
    table.data-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    table.data-table td.name {
      text-align: left;
      padding-left: 6px;
      font-weight: bold;
    }
    table.data-table td.industry {
      text-align: left;
      padding-left: 6px;
      font-size: 9pt;
    }
    .badge-pass { font-weight: bold; }
    .footer-sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      page-break-inside: avoid;
    }
    .footer-sign-table td {
      width: 50%;
      text-align: center;
      vertical-align: top;
      border: none;
      font-size: 10.5pt;
    }
    .sign-space {
      height: 70px;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <!-- Header Quốc hiệu / Trung tâm -->
  <table class="header-table">
    <tr>
      <td style="width: 55%; text-align: left;">
        <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">${escapeHtml(centerName)}</div>
        <div style="font-size: 9.5pt; color: #333;">BAN CHUYÊN MÔN & QUẢN LÝ ĐÀO TẠO</div>
        <div style="font-size: 9pt; font-style: italic;">Chương trình Đào tạo Xuất Khẩu B2B Thực Chiến</div>
      </td>
      <td style="width: 45%; text-align: right;">
        <div style="font-size: 9.5pt; font-style: italic;">${escapeHtml(reportDate)}</div>
        <div style="font-size: 9pt; color: #555;">Mã lớp: <strong>${escapeHtml(selectedCohort === 'ALL' ? 'TOÀN KHÓA' : selectedCohort)}</strong></div>
      </td>
    </tr>
  </table>

  <!-- Tiêu đề báo cáo -->
  <div class="title-block">
    <h1>BẢNG TỔNG HỢP KẾT QUẢ ĐÀO TẠO & ĐÁNH GIÁ NĂNG LỰC HỌC VIÊN</h1>
    <div style="font-weight: bold; font-size: 11.5pt;">${escapeHtml(courseName)}</div>
    <p>Áp dụng chuẩn khung đánh giá Rubric 10 tiêu chí năng lực quốc tế & Thực hành 15 buổi học</p>
  </div>

  <!-- Thống kê chung -->
  <div class="stats-bar">
    <div><strong>Tổng số học viên:</strong> ${stats.total} học viên</div>
    <div><strong>Đã chấm điểm:</strong> ${stats.evaluated}/${stats.total}</div>
    <div><strong>Điểm trung bình lớp:</strong> ${stats.avgScore}/100</div>
    <div><strong>Xuất sắc (&ge;85đ):</strong> ${stats.distinction}</div>
    <div><strong>Đạt (&ge;70đ):</strong> ${stats.passed}</div>
    <div><strong>Cần bổ sung:</strong> ${stats.revision}</div>
  </div>

  <!-- Bảng điểm chi tiết -->
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 28px;">STT</th>
        <th style="width: 140px;">Họ và Tên Học Viên</th>
        <th style="width: 110px;">Ngành Hàng B2B</th>
        <th style="width: 48px;">M01<br><span style="font-weight: normal; font-size: 8pt;">(5đ)</span></th>
        <th style="width: 48px;">M02<br><span style="font-weight: normal; font-size: 8pt;">(15đ)</span></th>
        <th style="width: 48px;">M03<br><span style="font-weight: normal; font-size: 8pt;">(15đ)</span></th>
        <th style="width: 48px;">M04<br><span style="font-weight: normal; font-size: 8pt;">(20đ)</span></th>
        <th style="width: 48px;">M05<br><span style="font-weight: normal; font-size: 8pt;">(15đ)</span></th>
        <th style="width: 52px;">Capstone<br><span style="font-weight: normal; font-size: 8pt;">(20đ)</span></th>
        <th style="width: 48px;">PDP<br><span style="font-weight: normal; font-size: 8pt;">(10đ)</span></th>
        <th style="width: 55px;">Tổng Điểm<br><span style="font-weight: normal; font-size: 8pt;">(100đ)</span></th>
        <th style="width: 80px;">Xếp Loại</th>
        <th style="width: 130px;">Ghi Chú Đánh Giá</th>
      </tr>
    </thead>
    <tbody>
      ${targetStudents.map((st, idx) => {
        const m1 = st.modules.M01?.score !== undefined ? st.modules.M01.score : (st.modules.M01?.status !== 'not_started' ? 'Đã nộp' : '-');
        const m2 = st.modules.M02?.score !== undefined ? st.modules.M02.score : (st.modules.M02?.status !== 'not_started' ? 'Đã nộp' : '-');
        const m3 = st.modules.M03?.score !== undefined ? st.modules.M03.score : (st.modules.M03?.status !== 'not_started' ? 'Đã nộp' : '-');
        const m4 = st.modules.M04?.score !== undefined ? st.modules.M04.score : (st.modules.M04?.status !== 'not_started' ? 'Đã nộp' : '-');
        const m5 = st.modules.M05?.score !== undefined ? st.modules.M05.score : (st.modules.M05?.status !== 'not_started' ? 'Đã nộp' : '-');
        const cap = st.modules.CAPSTONE?.score !== undefined ? st.modules.CAPSTONE.score : (st.modules.CAPSTONE?.status !== 'not_started' ? 'Đã nộp' : '-');
        const pdp = st.modules.PDP?.score !== undefined ? st.modules.PDP.score : '-';

        let rankText = 'Chờ chấm';
        if (st.gradeStatus === 'distinction') rankText = '🏆 Xuất sắc';
        else if (st.gradeStatus === 'passed') rankText = '✅ Đạt';
        else if (st.gradeStatus === 'needs_revision') rankText = '⚠️ Bổ sung';

        return `
        <tr>
          <td>${idx + 1}</td>
          <td class="name">${escapeHtml(st.fullName)}</td>
          <td class="industry">${escapeHtml(st.industry)}</td>
          <td>${m1}</td>
          <td>${m2}</td>
          <td>${m3}</td>
          <td>${m4}</td>
          <td>${m5}</td>
          <td>${cap}</td>
          <td>${pdp}</td>
          <td style="font-weight: bold; font-size: 10.5pt;">${st.totalScore > 0 ? st.totalScore : '-'}</td>
          <td class="badge-pass">${rankText}</td>
          <td style="text-align: left; font-size: 8.5pt; padding: 4px;">${escapeHtml(st.instructorNote || '')}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <!-- Khối chữ ký phê duyệt 2 bên -->
  <table class="footer-sign-table">
    <tr>
      <td>
        <div style="font-weight: bold; text-transform: uppercase;">${escapeHtml(instructorTitle)}</div>
        <div style="font-style: italic; font-size: 9pt;">(Ký, ghi rõ họ tên và xác nhận năng lực)</div>
        <div class="sign-space"></div>
        <div style="font-weight: bold; font-size: 11pt;">${escapeHtml(instructorName)}</div>
      </td>
      <td>
        <div style="font-weight: bold; text-transform: uppercase;">${escapeHtml(centerRepTitle)}</div>
        <div style="font-style: italic; font-size: 9pt;">(Ký tên, đóng dấu xác nhận)</div>
        <div class="sign-space"></div>
        <div style="font-weight: bold; font-size: 11pt;">${escapeHtml(centerRepName)}</div>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    } else {
      // PHIẾU ĐÁNH GIÁ CÁ NHÂN TỪNG HỌC VIÊN (A4 PORTRAIT)
      const studentsToPrint = selectedStudentId === 'ALL'
        ? targetStudents
        : targetStudents.filter(s => s.id === selectedStudentId);

      printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Phiếu Đánh Giá Năng Lực Học Viên - ${escapeHtml(batchName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .sheet {
      page-break-after: always;
      position: relative;
    }
    .sheet:last-child {
      page-break-after: auto;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .header-table td {
      vertical-align: top;
      border: none;
      padding: 0;
    }
    .title-block {
      text-align: center;
      margin: 14px 0 18px;
    }
    .title-block h1 {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .student-info-box {
      border: 1px solid #333;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: #fafafa;
    }
    .student-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      font-size: 10.5pt;
    }
    .score-summary-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      border: 2px solid #000;
      padding: 10px;
      margin-bottom: 18px;
      background: #f8fafc;
      text-align: center;
    }
    table.rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 16px;
    }
    table.rubric-table th, table.rubric-table td {
      border: 1px solid #000;
      padding: 5px 6px;
    }
    table.rubric-table th {
      background: #f2f2f2;
      text-align: center;
      font-weight: bold;
    }
    .note-box {
      border: 1px solid #000;
      padding: 10px 12px;
      margin-bottom: 20px;
      min-height: 80px;
      font-size: 10pt;
      background: #fff;
    }
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      page-break-inside: avoid;
    }
    .sign-table td {
      width: 50%;
      text-align: center;
      border: none;
      vertical-align: top;
    }
    .sign-space { height: 65px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${studentsToPrint.map(student => {
    let rankText = 'Chờ đánh giá';
    if (student.gradeStatus === 'distinction') rankText = '🏆 XUẤT SẮC (Distinction)';
    else if (student.gradeStatus === 'passed') rankText = '✅ ĐẠT YÊU CẦU (Passed)';
    else if (student.gradeStatus === 'needs_revision') rankText = '⚠️ CẦN BỔ SUNG (Needs Revision)';

    const rubricList = (student.rubricScores && student.rubricScores.length > 0)
      ? student.rubricScores
      : [
          { name: 'Mindset & Triết lý B2B', weight: 5, score: 0 },
          { name: 'Nghiên cứu Thị trường & ICP', weight: 15, score: 0 },
          { name: 'Sàng lọc Lead & Sourcing', weight: 15, score: 0 },
          { name: 'Báo giá Đa tầng & TCO', weight: 10, score: 0 },
          { name: 'Đàm phán Give–Take & An toàn Hợp đồng', weight: 10, score: 0 },
          { name: 'Thực thi SLA & Xử lý Khủng hoảng', weight: 10, score: 0 },
          { name: 'Kế hoạch Tăng trưởng JBP', weight: 5, score: 0 },
          { name: 'Chiến lược Kênh Phân phối', weight: 5, score: 0 },
          { name: 'Quản trị Tài chính & Cashflow', weight: 5, score: 0 },
          { name: 'Final Capstone Playbook', weight: 20, score: 0 }
        ];

    return `
    <div class="sheet">
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td style="width: 60%;">
            <div style="font-weight: bold; font-size: 11pt; text-transform: uppercase;">${escapeHtml(centerName)}</div>
            <div style="font-size: 9.5pt; color: #444;">BAN ĐÀO TẠO & HỘI ĐỒNG KHẢO THÍ CHUYÊN MÔN</div>
          </td>
          <td style="width: 40%; text-align: right; font-style: italic; font-size: 9.5pt;">
            ${escapeHtml(reportDate)}
          </td>
        </tr>
      </table>

      <!-- Title -->
      <div class="title-block">
        <h1>PHIẾU ĐÁNH GIÁ NĂNG LỰC & BẢNG ĐIỂM HỌC VIÊN</h1>
        <div style="font-weight: bold; font-size: 11pt;">${escapeHtml(courseName)}</div>
      </div>

      <!-- Student Info -->
      <div class="student-info-box">
        <div class="student-info-grid">
          <div><strong>Họ và tên học viên:</strong> ${escapeHtml(student.fullName)}</div>
          <div><strong>Mã lớp / Khóa học:</strong> ${escapeHtml(student.cohort)}</div>
          <div><strong>Email:</strong> ${escapeHtml(student.email)}</div>
          <div><strong>Ngành hàng phụ trách:</strong> ${escapeHtml(student.industry)}</div>
          <div><strong>Ngày đăng ký:</strong> ${escapeHtml(student.registeredAt)}</div>
          <div><strong>Ngày hoàn tất đánh giá:</strong> ${escapeHtml(student.evaluatedAt || '2026-10-07')}</div>
        </div>
      </div>

      <!-- Score Summary Bar -->
      <div class="score-summary-bar">
        <div>
          <div style="font-size: 9.5pt; color: #555; text-transform: uppercase;">Tổng Điểm Đạt Được</div>
          <div style="font-size: 20pt; font-weight: bold;">${student.totalScore} <span style="font-size: 12pt; font-weight: normal; color: #666;">/ 100</span></div>
        </div>
        <div style="border-left: 1px solid #ccc; height: 40px;"></div>
        <div>
          <div style="font-size: 9.5pt; color: #555; text-transform: uppercase;">Xếp Loại Chung Cuộc</div>
          <div style="font-size: 14pt; font-weight: bold; color: #111;">${rankText}</div>
        </div>
      </div>

      <!-- Rubric Table -->
      <div style="font-weight: bold; margin-bottom: 6px; text-transform: uppercase; font-size: 10pt;">
        I. Bảng Chi Tiết Điểm 10 Tiêu Chí Năng Lực Thực Chiến (Rubric)
      </div>
      <table class="rubric-table">
        <thead>
          <tr>
            <th style="width: 30px;">STT</th>
            <th>Tiêu Chí Đánh Giá Năng Lực Chuyên Môn</th>
            <th style="width: 75px;">Trọng Số</th>
            <th style="width: 80px;">Điểm (0-10)</th>
            <th style="width: 85px;">Điểm Quy Đổi</th>
          </tr>
        </thead>
        <tbody>
          ${rubricList.map((r: any, rIdx: number) => {
            const rawScore = Number(r.score) || 0;
            const weight = Number(r.weight) || 10;
            const converted = Math.round((rawScore / 10) * weight * 10) / 10;
            return `
            <tr>
              <td style="text-align: center;">${rIdx + 1}</td>
              <td style="font-weight: 500;">${escapeHtml(r.name)}</td>
              <td style="text-align: center;">${weight}%</td>
              <td style="text-align: center; font-weight: bold;">${rawScore}/10</td>
              <td style="text-align: center; font-weight: bold;">${converted}đ</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Note box -->
      <div style="font-weight: bold; margin-bottom: 6px; text-transform: uppercase; font-size: 10pt;">
        II. Nhận Xét & Lộ Trình Phát Triển Thực Chiến Của Giảng Viên (PDP)
      </div>
      <div class="note-box">
        ${student.instructorNote 
          ? escapeHtml(student.instructorNote).replace(/\n/g, '<br/>') 
          : '<em>Học viên hoàn thành bài tập thực hành theo tiến độ chương trình. Cần tiếp tục duy trì kỷ luật follow-up lead và áp dụng triệt để bộ công cụ Báo giá đa tầng & Safe Order vào thực tế doanh nghiệp.</em>'}
      </div>

      <!-- Sign box -->
      <table class="sign-table">
        <tr>
          <td>
            <div style="font-weight: bold; text-transform: uppercase;">HỌC VIÊN XÁC NHẬN</div>
            <div style="font-style: italic; font-size: 9pt;">(Ký và ghi rõ họ tên)</div>
            <div class="sign-space"></div>
            <div style="font-weight: bold;">${escapeHtml(student.fullName)}</div>
          </td>
          <td>
            <div style="font-weight: bold; text-transform: uppercase;">${escapeHtml(instructorTitle)}</div>
            <div style="font-style: italic; font-size: 9pt;">(Ký và xác nhận năng lực)</div>
            <div class="sign-space"></div>
            <div style="font-weight: bold;">${escapeHtml(instructorName)}</div>
          </td>
        </tr>
      </table>
    </div>
    `;
  }).join('')}
</body>
</html>
      `;
    }

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '1100px',
        maxWidth: '96vw',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Printer size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Thiết Lập & In Bảng Điểm Gửi Trung Tâm
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Chuẩn định dạng A4 hành chính giáo dục · Tối ưu mực in & hiển thị chữ ký duyệt 2 bên
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Split 2 columns (Settings & Live Preview) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Cột trái: Cấu hình thông số (380px) */}
          <div style={{
            width: '380px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Chọn Loại Bản In */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block', marginBottom: '8px' }}>
                1. CHỌN LOẠI BẢN IN
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: printType === 'summary' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: printType === 'summary' ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="printType" 
                    checked={printType === 'summary'} 
                    onChange={() => setPrintType('summary')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Bảng Tổng Hợp Cả Lớp</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Khổ Ngang (A4 Landscape) · 12 Cột ma trận</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: printType === 'individual' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: printType === 'individual' ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="printType" 
                    checked={printType === 'individual'} 
                    onChange={() => setPrintType('individual')}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Phiếu Đánh Giá Cá Nhân</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Khổ Dọc (A4 Portrait) · 10 Rubric + Nhận xét</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Chọn Lớp & Học Viên */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                2. LỌC KHÓA / HỌC VIÊN
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select 
                  className="input-field" 
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                >
                  <option value="ALL">Toàn bộ các khóa ({students.length} học viên)</option>
                  {cohorts.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {printType === 'individual' && (
                  <select 
                    className="input-field"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                  >
                    <option value="ALL">In tất cả học viên trong lớp (Mỗi bạn 1 trang)</option>
                    {targetStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Thông tin Hành chính */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                3. THÔNG TIN HÀNH CHÍNH (TÙY CHỈNH)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Tên Trung tâm / Đơn vị Đào tạo:</div>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={centerName} 
                    onChange={(e) => setCenterName(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Tên Khóa đào tạo:</div>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={courseName} 
                    onChange={(e) => setCourseName(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Giảng viên phụ trách:</div>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={instructorName} 
                      onChange={(e) => setInstructorName(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Chức danh Giảng viên:</div>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={instructorTitle} 
                      onChange={(e) => setInstructorTitle(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Chức danh Đại diện Trung tâm:</div>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={centerRepTitle} 
                    onChange={(e) => setCenterRepTitle(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Địa điểm & Ngày ký:</div>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={reportDate} 
                    onChange={(e) => setReportDate(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Live Preview (Mô phỏng tờ giấy A4) */}
          <div style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <strong>Mô Phỏng Trang In Thực Tế (Không dính Sidebar hay Menu Web):</strong>
            </div>

            {/* Khung giả lập giấy A4 Trắng */}
            <div style={{
              width: printType === 'summary' ? '100%' : '520px',
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '24px',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: '11px',
              lineHeight: 1.35
            }}>
              {/* Header Preview */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px' }}>{centerName}</div>
                  <div style={{ fontSize: '9px', color: '#555' }}>BAN ĐÀO TẠO & HỘI ĐỒNG KHẢO THÍ CHUYÊN MÔN</div>
                </div>
                <div style={{ textAlign: 'right', fontStyle: 'italic', fontSize: '9px' }}>
                  {reportDate}
                </div>
              </div>

              {/* Title Preview */}
              <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                  {printType === 'summary' 
                    ? 'BẢNG TỔNG HỢP KẾT QUẢ ĐÀO TẠO & ĐÁNH GIÁ NĂNG LỰC HỌC VIÊN' 
                    : 'PHIẾU ĐÁNH GIÁ NĂNG LỰC & BẢNG ĐIỂM HỌC VIÊN'}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{courseName}</div>
              </div>

              {/* Stats Bar Preview for summary */}
              {printType === 'summary' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #666', padding: '4px 8px', fontSize: '9.5px', background: '#f8f8f8', marginBottom: '10px' }}>
                  <div>Sĩ số: <strong>{stats.total}</strong></div>
                  <div>Đã chấm: <strong>{stats.evaluated}</strong></div>
                  <div>Điểm TB: <strong>{stats.avgScore}/100</strong></div>
                  <div>Xuất sắc: <strong>{stats.distinction}</strong></div>
                  <div>Đạt: <strong>{stats.passed}</strong></div>
                </div>
              )}

              {/* Sample Table Preview */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>STT</th>
                    <th style={{ border: '1px solid #333', padding: '3px', textAlign: 'left' }}>Học Viên</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>Ngành Hàng</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>M01</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>M02</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>M05</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>Tổng Điểm</th>
                    <th style={{ border: '1px solid #333', padding: '3px' }}>Xếp Loại</th>
                  </tr>
                </thead>
                <tbody>
                  {targetStudents.slice(0, 4).map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', fontWeight: 'bold' }}>{s.fullName}</td>
                      <td style={{ border: '1px solid #333', padding: '3px' }}>{s.industry}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center' }}>{s.modules.M01?.status !== 'not_started' ? 'Đã làm' : '-'}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center' }}>{s.modules.M02?.status !== 'not_started' ? 'Đã làm' : '-'}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center' }}>{s.modules.M05?.status !== 'not_started' ? 'Đã làm' : '-'}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>{s.totalScore > 0 ? s.totalScore : '-'}</td>
                      <td style={{ border: '1px solid #333', padding: '3px', textAlign: 'center' }}>
                        {s.gradeStatus === 'distinction' ? '🏆 Xuất sắc' : s.gradeStatus === 'passed' ? '✅ Đạt' : '⏳ Chờ chấm'}
                      </td>
                    </tr>
                  ))}
                  {targetStudents.length > 4 && (
                    <tr>
                      <td colSpan={8} style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                        ... và {targetStudents.length - 4} học viên khác được nạp đầy đủ vào bản in ...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Signatures Preview */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9.5px' }}>{instructorTitle}</div>
                  <div style={{ height: '40px' }}></div>
                  <div style={{ fontWeight: 'bold' }}>{instructorName}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9.5px' }}>{centerRepTitle}</div>
                  <div style={{ height: '40px' }}></div>
                  <div style={{ fontWeight: 'bold' }}>{centerRepName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sẵn sàng kết xuất: <strong>{targetStudents.length} học viên</strong> ({printType === 'summary' ? 'Bảng tổng hợp Khổ Ngang' : 'Phiếu cá nhân Khổ Dọc'})
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              Đóng
            </button>

            <button 
              onClick={handleTriggerPrint}
              className="btn btn-primary"
              style={{ 
                padding: '8px 24px', 
                fontSize: '0.9rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Printer size={16} /> In Báo Cáo / Xuất PDF (A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper tránh lỗi HTML injection
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
