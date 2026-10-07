'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Printer, 
  RefreshCw, 
  Search, 
  SlidersHorizontal, 
  UserCheck, 
  X, 
  Edit3, 
  Eye, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Save,
  FileText
} from 'lucide-react';
import { 
  StudentSubmissionSummary, 
  INITIAL_MOCK_STUDENTS, 
  RubricCriteriaScore, 
  DEFAULT_RUBRIC_CRITERIA 
} from './mockStudentData';
import { createClient } from '@/lib/supabase/client';

export default function GradingHub() {
  const [students, setStudents] = useState<StudentSubmissionSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmissionSummary | null>(null);
  const [modalMode, setModalMode] = useState<'grade' | 'view'>('grade');
  const [modalTab, setModalTab] = useState<'rubric' | 'submissions'>('rubric');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Editable Rubric in Modal
  const [currentRubric, setCurrentRubric] = useState<RubricCriteriaScore[]>([]);
  const [instructorNote, setInstructorNote] = useState('');

  const supabase = useMemo(() => createClient(), []);

  // 1. Initialize data from LocalStorage or Fallback to INITIAL_MOCK_STUDENTS
  useEffect(() => {
    loadStudentsData();
  }, []);

  const loadStudentsData = async () => {
    setIsSyncing(true);
    try {
      // Check localStorage first for persisted teacher evaluations
      const localData = localStorage.getItem('sales_hub_evaluations_v1');
      let baseStudents = INITIAL_MOCK_STUDENTS;

      if (localData) {
        try {
          baseStudents = JSON.parse(localData);
        } catch (e) {
          console.warn('Lỗi đọc cache local, dùng dữ liệu gốc', e);
        }
      }

      // Try checking Supabase submissions if live DB is configured
      try {
        const { data: supaUsers } = await supabase.from('users').select('*').limit(20);
        const { data: supaSubmissions } = await supabase.from('module_submissions').select('*').limit(50);
        
        if (supaUsers && supaUsers.length > 0 && supaSubmissions && supaSubmissions.length > 0) {
          // If real users and submissions exist on Supabase, merge them!
          console.log('Tìm thấy dữ liệu thật trên Supabase:', supaUsers.length, 'users');
        }
      } catch (dbErr) {
        // Fallback silently if supabase is not connected
      }

      setStudents(baseStudents);
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 2. Open Grading Modal
  const openGradingModal = (student: StudentSubmissionSummary, mode: 'grade' | 'view') => {
    setSelectedStudent(student);
    setModalMode(mode);
    setModalTab(mode === 'view' ? 'submissions' : 'rubric');
    setCurrentRubric(student.rubricScores && student.rubricScores.length > 0 
      ? JSON.parse(JSON.stringify(student.rubricScores)) 
      : DEFAULT_RUBRIC_CRITERIA.map(c => ({ ...c }))
    );
    setInstructorNote(student.instructorNote || '');
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  // 3. Handle Score Change in Rubric
  const handleScoreChange = (criteriaId: string, val: number) => {
    const clamped = Math.max(0, Math.min(10, val));
    setCurrentRubric(prev => prev.map(c => c.id === criteriaId ? { ...c, score: clamped } : c));
  };

  const handleCriteriaNoteChange = (criteriaId: string, note: string) => {
    setCurrentRubric(prev => prev.map(c => c.id === criteriaId ? { ...c, note } : c));
  };

  // Calculate Real-time Total from currentRubric
  const modalCalculatedTotal = useMemo(() => {
    const rawSum = currentRubric.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
    return Math.round(rawSum * 10) / 10;
  }, [currentRubric]);

  const modalGradeStatus = useMemo((): 'distinction' | 'passed' | 'needs_revision' | 'pending' => {
    if (modalCalculatedTotal >= 85) return 'distinction';
    if (modalCalculatedTotal >= 70) return 'passed';
    if (modalCalculatedTotal > 0) return 'needs_revision';
    return 'pending';
  }, [modalCalculatedTotal]);

  // 4. Save Rubric Evaluation
  const handleSaveEvaluation = async () => {
    if (!selectedStudent) return;

    // Distribute scores to individual modules based on Rubric weights
    // Crit 1 -> M01 (5 max)
    const m1Score = Math.round(((currentRubric[0]?.score || 0) / 10) * 5 * 10) / 10;
    // Crit 2 -> M02 (15 max)
    const m2Score = Math.round(((currentRubric[1]?.score || 0) / 10) * 15 * 10) / 10;
    // Crit 3 -> M03 (15 max)
    const m3Score = Math.round(((currentRubric[2]?.score || 0) / 10) * 15 * 10) / 10;
    // Crit 4, 5, 6 -> M04 (20 max) (average of 3 criteria)
    const m4Avg = ((currentRubric[3]?.score || 0) + (currentRubric[4]?.score || 0) + (currentRubric[5]?.score || 0)) / 3;
    const m4Score = Math.round((m4Avg / 10) * 20 * 10) / 10;
    // Crit 7, 8, 9 -> M05 (15 max) (average of 3 criteria)
    const m5Avg = ((currentRubric[6]?.score || 0) + (currentRubric[7]?.score || 0) + (currentRubric[8]?.score || 0)) / 3;
    const m5Score = Math.round((m5Avg / 10) * 15 * 10) / 10;
    // Crit 10 -> Capstone (20 max)
    const capstoneScore = Math.round(((currentRubric[9]?.score || 0) / 10) * 20 * 10) / 10;
    // PDP score (10 max)
    const pdpScore = Math.round(((currentRubric[0]?.score || 0) * 0.3 + (currentRubric[9]?.score || 0) * 0.7) * 10) / 10;

    const updatedStudents: StudentSubmissionSummary[] = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          totalScore: modalCalculatedTotal,
          gradeStatus: modalGradeStatus,
          isEvaluated: true,
          instructorNote: instructorNote,
          evaluatedAt: new Date().toISOString().split('T')[0],
          rubricScores: currentRubric,
          modules: {
            ...s.modules,
            M01: { ...s.modules.M01, score: m1Score, status: 'reviewed' as const },
            M02: { ...s.modules.M02, score: m2Score, status: 'reviewed' as const },
            M03: { ...s.modules.M03, score: m3Score, status: 'reviewed' as const },
            M04: { ...s.modules.M04, score: m4Score, status: 'reviewed' as const },
            M05: { ...s.modules.M05, score: m5Score, status: 'reviewed' as const },
            CAPSTONE: { ...s.modules.CAPSTONE, score: capstoneScore, status: 'reviewed' as const },
            PDP: { ...s.modules.PDP, score: pdpScore, status: 'submitted' as const },
          }
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    localStorage.setItem('sales_hub_evaluations_v1', JSON.stringify(updatedStudents));

    // Also attempt saving to Supabase if table exists
    try {
      await supabase.from('evaluations').upsert({
        user_id: selectedStudent.studentId,
        module_id: 'ALL',
        rubric_scores: currentRubric,
        instructor_note: instructorNote,
        total_score: modalCalculatedTotal,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
    } catch (e) {
      console.warn('Supabase evaluation sync fallback');
    }

    showToast(`Đã lưu kết quả chấm điểm học viên ${selectedStudent.fullName} (${modalCalculatedTotal} điểm)!`);
    closeModal();
  };

  // 5. Reset to Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của Lớp K08? Các điểm số đã chỉnh sửa sẽ được đặt lại theo chuẩn demo.')) {
      setStudents(INITIAL_MOCK_STUDENTS);
      localStorage.setItem('sales_hub_evaluations_v1', JSON.stringify(INITIAL_MOCK_STUDENTS));
      showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
    }
  };

  // 6. Export to CSV / Excel
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'Email',
      'Lớp học',
      'Ngành hàng',
      'M01 (5đ)',
      'M02 (15đ)',
      'M03 (15đ)',
      'M04 (20đ)',
      'M05 (15đ)',
      'Capstone (20đ)',
      'PDP (10đ)',
      'Tổng Điểm (100đ)',
      'Xếp Loại',
      'Trạng Thái Chấm',
      'Ngày Chấm',
      'Nhận Xét Giảng Viên'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.fullName}"`,
      `"${s.email}"`,
      `"${s.cohort}"`,
      `"${s.industry}"`,
      s.modules.M01.score ?? '-',
      s.modules.M02.score ?? '-',
      s.modules.M03.score ?? '-',
      s.modules.M04.score ?? '-',
      s.modules.M05.score ?? '-',
      s.modules.CAPSTONE.score ?? '-',
      s.modules.PDP.score ?? '-',
      s.totalScore,
      s.gradeStatus === 'distinction' ? 'Xuất sắc' : s.gradeStatus === 'passed' ? 'Đạt' : s.gradeStatus === 'needs_revision' ? 'Cần bổ sung' : 'Chưa chấm',
      s.isEvaluated ? 'Đã chấm' : 'Chưa chấm',
      s.evaluatedAt || '-',
      `"${(s.instructorNote || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Diem_Hoc_Vien_Export_Sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file bảng điểm CSV thành công (Hỗ trợ mở bằng Excel chuẩn UTF-8)!');
  };

  // 7. Print Report
  const handlePrint = () => {
    window.print();
  };

  // 8. Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCohort = selectedCohort === 'ALL' || s.cohort === selectedCohort;
      const matchGrade = selectedGradeFilter === 'ALL' || s.gradeStatus === selectedGradeFilter;
      const matchStatus = selectedStatusFilter === 'ALL' 
        ? true 
        : selectedStatusFilter === 'EVALUATED' ? s.isEvaluated 
        : !s.isEvaluated;

      return matchSearch && matchCohort && matchGrade && matchStatus;
    });
  }, [students, searchQuery, selectedCohort, selectedGradeFilter, selectedStatusFilter]);

  // Cohort list
  const cohorts = useMemo(() => {
    const set = new Set(students.map(s => s.cohort));
    return Array.from(set);
  }, [students]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const evaluated = students.filter(s => s.isEvaluated).length;
    const pending = total - evaluated;
    const distinction = students.filter(s => s.gradeStatus === 'distinction').length;
    const passed = students.filter(s => s.gradeStatus === 'passed').length;
    const avgScore = total > 0 
      ? Math.round((students.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / (evaluated || 1)) * 10) / 10 
      : 0;

    return { total, evaluated, pending, distinction, passed, avgScore };
  }, [students]);

  return (
    <div className="grading-hub-container" style={{ width: '100%', color: 'var(--text-primary)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Award size={28} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Khoang Chấm Điểm & Tổng Kết Đáp Án Học Viên
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Hệ thống đối chiếu đáp án toàn diện 15 buổi học, chấm điểm theo Rubric 10 tiêu chí và xuất báo cáo kết quả khóa đào tạo.
          </p>
        </div>

        {/* Global Actions */}
        <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.9rem' }}
            title="Xuất bảng điểm ra file CSV mở được bằng Excel tiếng Việt"
          >
            <FileSpreadsheet size={16} color="#10b981" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button 
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.9rem' }}
            title="In bảng điểm khổ A4"
          >
            <Printer size={16} />
            <span>In Bản Điểm (A4)</span>
          </button>

          <button 
            onClick={handleResetDemoData}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.9rem', color: 'var(--text-muted)' }}
            title="Đặt lại dữ liệu mẫu của lớp"
          >
            <RefreshCw size={16} />
            <span>Làm Mới Dữ Liệu</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="no-print" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '28px' 
      }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Tổng Số Học Viên
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.total} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>học viên</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Khóa K08 - Xuất khẩu B2B
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Điểm Trung Bình Lớp
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981' }}>
            {stats.avgScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Dựa trên {stats.evaluated} bài đã chấm
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Tỉ Lệ Đạt & Xuất Sắc
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats.distinction + stats.passed} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.total}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            🏆 {stats.distinction} Xuất sắc • ✅ {stats.passed} Đạt
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
            Tiến Độ Chấm Bài
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#8b5cf6' }}>
            {stats.evaluated}/{stats.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats.pending > 0 ? `⚠️ Còn ${stats.pending} bài chờ chấm` : '🎉 Đã hoàn tất 100%'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print glass-panel" style={{ 
        padding: '16px 20px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Tìm theo tên học viên, email hoặc ngành hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Cohort Select */}
          <select 
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">Tất cả khóa học</option>
            {cohorts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Grade Filter */}
          <select 
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">Tất cả xếp loại</option>
            <option value="distinction">Xuất sắc (&gt;= 85đ)</option>
            <option value="passed">Đạt (70 - 84đ)</option>
            <option value="needs_revision">Cần bổ sung (&lt; 70đ)</option>
            <option value="pending">Chờ chấm</option>
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="EVALUATED">Đã chấm điểm</option>
            <option value="PENDING">Chưa chấm điểm</option>
          </select>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="glass-panel" style={{ 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)' 
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ 
                background: 'rgba(255,255,255,0.04)', 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)'
              }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, width: '45px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, minWidth: '220px' }}>Học Viên & Ngành Hàng</th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Mindset & 11 Năng lực (Trọng số 5%)">
                  M01 <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(5đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Market, ICP & Buyer Map (Trọng số 15%)">
                  M02 <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(15đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Lead Sourcing, FNACM & Access Score (Trọng số 15%)">
                  M03 <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(15đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Báo giá Đa tầng, TCO, Đàm phán & Safe Order (Trọng số 20%)">
                  M04 <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(20đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Internal SLA, Xử lý Khủng hoảng & JBP (Trọng số 15%)">
                  M05 <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(15đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '95px' }} title="Final Capstone Playbook (Trọng số 20%)">
                  Capstone <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(20đ)</span>
                </th>
                <th style={{ padding: '14px 12px', fontWeight: 700, textAlign: 'center', width: '85px' }} title="Kế hoạch 90 ngày PDP (Trọng số 10%)">
                  PDP <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(10đ)</span>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, minWidth: '130px', textAlign: 'center' }}>
                  Tổng Điểm <br/><span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>(100đ)</span>
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, minWidth: '120px', textAlign: 'center' }}>Xếp Loại</th>
                <th className="no-print" style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center', minWidth: '160px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Không tìm thấy học viên nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const m1 = student.modules.M01;
                  const m2 = student.modules.M02;
                  const m3 = student.modules.M03;
                  const m4 = student.modules.M04;
                  const m5 = student.modules.M05;
                  const capstone = student.modules.CAPSTONE;
                  const pdp = student.modules.PDP;

                  return (
                    <tr 
                      key={student.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.2s',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      {/* Index */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: student.avatarColor || 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {student.fullName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {student.email}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                              🏷️ {student.industry}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Module Scores */}
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {m1.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{m1.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {m2.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{m2.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {m3.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{m3.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {m4.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{m4.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {m5.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{m5.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {capstone.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{capstone.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {pdp.score !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{pdp.score}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* Total Score & Progress Bar */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: student.totalScore >= 85 ? '#10b981' : student.totalScore >= 70 ? 'var(--accent-primary)' : '#f59e0b' }}>
                          {student.totalScore > 0 ? student.totalScore : '-'}
                        </div>
                        {student.totalScore > 0 && (
                          <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '4px auto 0', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${Math.min(100, student.totalScore)}%`, 
                              height: '100%', 
                              background: student.totalScore >= 85 ? '#10b981' : student.totalScore >= 70 ? 'var(--accent-primary)' : '#f59e0b',
                              borderRadius: '3px'
                            }} />
                          </div>
                        )}
                      </td>

                      {/* Grade Status Badge */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {student.gradeStatus === 'distinction' && (
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            🏆 Xuất sắc
                          </span>
                        )}
                        {student.gradeStatus === 'passed' && (
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            background: 'rgba(59, 130, 246, 0.15)', 
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                          }}>
                            ✅ Đạt
                          </span>
                        )}
                        {student.gradeStatus === 'needs_revision' && (
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            background: 'rgba(245, 158, 11, 0.15)', 
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            ⚠️ Cần bổ sung
                          </span>
                        )}
                        {student.gradeStatus === 'pending' && (
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 600, 
                            background: 'rgba(255, 255, 255, 0.08)', 
                            color: 'var(--text-muted)',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                          }}>
                            ⏳ Chờ chấm
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="no-print" style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => openGradingModal(student, 'grade')}
                            className="btn btn-primary"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontWeight: 600
                            }}
                            title="Mở phiếu chấm điểm Rubric"
                          >
                            <Edit3 size={14} /> Chấm Điểm
                          </button>

                          <button 
                            onClick={() => openGradingModal(student, 'view')}
                            className="btn btn-secondary"
                            style={{ 
                              padding: '6px 10px', 
                              fontSize: '0.8rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                            title="Xem chi tiết các câu trả lời học viên đã nộp"
                          >
                            <Eye size={14} /> Xem Bài
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CHẤM ĐIỂM RUBRIC & XEM ĐÁP ÁN HỌC VIÊN                           */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '1000px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: selectedStudent.avatarColor || 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#ffffff'
                }}>
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {selectedStudent.fullName}
                    </h2>
                    <span style={{
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: 'var(--accent-primary)'
                    }}>
                      {selectedStudent.cohort}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedStudent.email} • Ngành: <strong style={{ color: 'var(--text-secondary)' }}>{selectedStudent.industry}</strong>
                  </div>
                </div>
              </div>

              {/* Live Score Counter in Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Tổng Điểm Rubric
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: modalCalculatedTotal >= 85 ? '#10b981' : modalCalculatedTotal >= 70 ? 'var(--accent-primary)' : '#f59e0b' }}>
                    {modalCalculatedTotal} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                </div>

                <button 
                  onClick={closeModal}
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
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div style={{
              display: 'flex',
              padding: '0 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0,0,0,0.2)',
              gap: '24px'
            }}>
              <button 
                onClick={() => setModalTab('rubric')}
                style={{
                  padding: '12px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'rubric' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: modalTab === 'rubric' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: modalTab === 'rubric' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Award size={16} /> Phiếu Chấm Điểm Rubric (10 Tiêu Chí)
              </button>

              <button 
                onClick={() => setModalTab('submissions')}
                style={{
                  padding: '12px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'submissions' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: modalTab === 'submissions' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: modalTab === 'submissions' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={16} /> Toàn Bộ Đáp Án Học Viên Đã Nộp
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {modalTab === 'rubric' ? (
                /* TAB 1: RUBRIC EVALUATION FORM */
                <div>
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    marginBottom: '20px',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)'
                  }}>
                    💡 <strong>Hướng dẫn chấm:</strong> Thang điểm chuẩn 100 điểm phân bổ đều cho 10 nhóm năng lực cốt lõi (mỗi tiêu chí tối đa 10 điểm). Điểm số các Module (M01 $\rightarrow$ M05, Capstone, PDP) sẽ được tự động quy đổi theo đúng tỷ trọng của giáo trình.
                  </div>

                  {/* Rubric Criteria Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {currentRubric.map((item, i) => (
                      <div 
                        key={item.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          borderRadius: '10px',
                          padding: '14px 18px',
                          display: 'grid',
                          gridTemplateColumns: '35px 1fr 180px',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1rem' }}>
                          #{i + 1}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {item.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                              {item.relatedSheet}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {item.description}
                          </div>

                          {/* Optional criteria note input */}
                          <input 
                            type="text"
                            placeholder="Ghi chú cụ thể cho tiêu chí này (tùy chọn)..."
                            value={item.note || ''}
                            onChange={(e) => handleCriteriaNoteChange(item.id, e.target.value)}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text-primary)',
                              fontSize: '0.8rem'
                            }}
                          />
                        </div>

                        {/* Score Input & Slider */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="number"
                              min={0}
                              max={10}
                              step={0.5}
                              value={item.score}
                              onChange={(e) => handleScoreChange(item.id, parseFloat(e.target.value) || 0)}
                              style={{
                                width: '64px',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid var(--accent-primary)',
                                color: '#10b981',
                                fontWeight: 800,
                                fontSize: '1rem',
                                textAlign: 'center'
                              }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10</span>
                          </div>

                          <input 
                            type="range"
                            min={0}
                            max={10}
                            step={0.5}
                            value={item.score}
                            onChange={(e) => handleScoreChange(item.id, parseFloat(e.target.value) || 0)}
                            style={{ width: '120px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructor Note Textarea */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      💬 Nhận Xét & Đánh Giá Tổng Thể Của Giảng Viên:
                    </label>
                    <textarea 
                      rows={4}
                      value={instructorNote}
                      onChange={(e) => setInstructorNote(e.target.value)}
                      placeholder="Ghi nhận xét chi tiết về tư duy ngoại thương, điểm mạnh, rủi ro cần khắc phục và định hướng phát triển thực chiến cho học viên..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* TAB 2: DETAILED SUBMISSION ANSWERS */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Module 1 */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                      Module 01: Mindset & 11 Năng Lực Nền Tảng (B01 - B02)
                    </h3>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mục tiêu 90 ngày (Mad Libs 3 thành phần):</div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {selectedStudent.modules.M01.formData?.mad_libs ? (
                          <>
                            <strong>Vị thế:</strong> {selectedStudent.modules.M01.formData.mad_libs.input1} <br/>
                            <strong>Mục tiêu:</strong> {selectedStudent.modules.M01.formData.mad_libs.input2} <br/>
                            <strong>Cam kết:</strong> {selectedStudent.modules.M01.formData.mad_libs.input3}
                          </>
                        ) : 'Học viên chưa hoàn tất phần Mad Libs.'}
                      </div>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                      Module 02: Nghiên Cứu Thị Trường & Chân Dung Buyer (B03 - B06)
                    </h3>
                    {selectedStudent.modules.M02.formData?.targetMarkets ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                        {selectedStudent.modules.M02.formData.targetMarkets.map((m: any, idx: number) => (
                          <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>🌍 {m.country}</div>
                            <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}><strong>Phân khúc:</strong> {m.segment}</div>
                            <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}><strong>Thuế FTA:</strong> {m.tariffs}</div>
                            <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}><strong>Rào cản:</strong> {m.barriers}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Dữ liệu thị trường mẫu chưa có.</div>
                    )}
                  </div>

                  {/* Module 3 */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                      Module 03: Sàng Lọc Lead & Access Score (B06 - B08)
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Accounts:</div>
                        <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>
                          {selectedStudent.modules.M03.formData?.targetAccounts?.join(', ') || 'Chưa chọn'}
                        </div>
                      </div>
                      <div style={{ width: '140px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Access Score:</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                          {selectedStudent.modules.M03.formData?.accessScore || 0}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module 4 */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                      Module 04: Báo Giá Đa Tầng, TCO & Đàm Phán Give–Take (B09 - B12)
                    </h3>
                    {selectedStudent.modules.M04.formData?.clarification && (
                      <div style={{ marginBottom: '14px', fontSize: '0.88rem', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '6px', color: '#60a5fa' }}>Trạm làm rõ 5 yêu cầu P-B-T-P-C:</div>
                        <div>📦 <strong>Product:</strong> {selectedStudent.modules.M04.formData.clarification.product}</div>
                        <div>💰 <strong>Budget:</strong> {selectedStudent.modules.M04.formData.clarification.budget}</div>
                        <div>⏱️ <strong>Timeline:</strong> {selectedStudent.modules.M04.formData.clarification.timeline}</div>
                        <div>💳 <strong>Payment:</strong> {selectedStudent.modules.M04.formData.clarification.payment}</div>
                        <div>📜 <strong>Compliance:</strong> {selectedStudent.modules.M04.formData.clarification.compliance}</div>
                      </div>
                    )}

                    {selectedStudent.modules.M04.formData?.tcoCalculation && (
                      <div style={{ marginBottom: '14px', fontSize: '0.88rem', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '6px', color: '#10b981' }}>Tính toán Landed Cost & Tiết kiệm ròng TCO:</div>
                        <div>Landed Cost chào bán: <strong>${selectedStudent.modules.M04.formData.tcoCalculation.totalLandedCost}/MT</strong> | Đối thủ: ${selectedStudent.modules.M04.formData.tcoCalculation.competitorLandedCost}/MT | Tiết kiệm: <strong style={{ color: '#10b981' }}>{selectedStudent.modules.M04.formData.tcoCalculation.netSavingsPercent}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Module 5 */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '12px' }}>
                      Module 05: Thực Thi SLA, Khủng Hoảng & Kế Hoạch JBP (B13 - B15)
                    </h3>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Cam kết SLA nội bộ:</strong> {selectedStudent.modules.M05.formData?.internalSLA || 'Chưa thiết lập'}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Phương án xử lý khủng hoảng:</strong> {selectedStudent.modules.M05.formData?.crisisPlan || 'Chưa thiết lập'}
                      </div>
                      <div>
                        <strong>Kế hoạch tăng trưởng JBP:</strong> {selectedStudent.modules.M05.formData?.jbpStrategy || 'Chưa thiết lập'}
                      </div>
                    </div>
                  </div>

                  {/* PDP Reflection */}
                  <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a78bfa', marginBottom: '12px' }}>
                      Kế Hoạch Phát Triển Cá Nhân 90 Ngày (PDP Reflection)
                    </h3>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem' }}>
                      "{selectedStudent.modules.PDP.reflectionText || 'Chưa có bản tự đánh giá'}"
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                        <strong>30 Ngày:</strong> {selectedStudent.modules.PDP.plan30Days || '-'}
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                        <strong>60 Ngày:</strong> {selectedStudent.modules.PDP.plan60Days || '-'}
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                        <strong>90 Ngày:</strong> {selectedStudent.modules.PDP.plan90Days || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedStudent.isEvaluated 
                  ? `Đã chấm ngày ${selectedStudent.evaluatedAt || 'gần đây'}` 
                  : 'Học viên chưa được chấm điểm chính thức'}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={closeModal}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Đóng
                </button>

                {modalTab === 'rubric' && (
                  <button 
                    onClick={handleSaveEvaluation}
                    className="btn btn-primary"
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: '0.9rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontWeight: 700
                    }}
                  >
                    <Save size={16} /> Lưu Kết Quả Chấm Điểm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
