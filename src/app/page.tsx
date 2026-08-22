import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)'
    }}>
      <div className="glass-panel" style={{ padding: '48px', maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '2.5rem' }}>
          Export Sales Interactive Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.125rem' }}>
          Chào mừng bạn đến với hệ thống Workstation số hóa quy trình Sales Xuất khẩu B2B.
          Hệ thống được thiết kế để kết nối logic xuyên suốt từ nghiên cứu thị trường đến kế hoạch thực thi.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/m01" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.125rem' }}>
            Bắt đầu Module 01
          </Link>
        </div>
      </div>
    </div>
  );
}
