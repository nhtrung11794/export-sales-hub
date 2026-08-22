import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <AuthForm />
    </div>
  );
}
