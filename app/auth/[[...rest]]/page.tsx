import Image from 'next/image';
import { SignIn, SignUp } from '@clerk/nextjs';

export default async function AuthPage({ params }: { params: Promise<{ rest?: string[] }> }) {
  const { rest } = await params;
  const isSignUp = rest?.[0] === 'sign-up';
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Left panel */}
      <div className="auth-left-panel" style={{
        flex: '0 0 55%',
        background: 'var(--bg-beige)',
        position: 'relative',
        padding: '3rem',
        overflow: 'hidden',
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: 1.15, maxWidth: '300px' }}>
          Curate Your Closet
        </h1>
        <Image src="/auth-1.png" alt="" width={416} height={405}
          style={{ position: 'absolute', top: '8%', right: '-4%', width: '62%', height: 'auto', transform: 'rotate(-80deg)' }} />
        <Image src="/auth-2.png" alt="" width={414} height={396}
          style={{ position: 'absolute', top: '40%', left: '2%', width: '62%', height: 'auto', transform: 'rotate(-80deg)' }} />
      </div>

      {/* Right panel */}
      <div className="auth-right-panel" style={{
        flex: '0 0 45%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '2rem', fontFamily: 'Nunito, sans-serif' }}>
            Welcome
          </h2>
          {isSignUp ? (
          <SignUp
            routing="path"
            path="/auth/sign-up"
            signInUrl="/auth"
            forceRedirectUrl="/home"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                cardBox: {
                  boxShadow: 'none',
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                },
                card: {
                  boxShadow: 'none',
                  border: 'none',
                  padding: 0,
                  background: 'transparent',
                  width: '100%',
                  gap: 0,
                },
                header: { display: 'none' },
                main: { width: '100%', gap: '0' },
                form: { width: '100%', gap: '0' },
                socialButtonsBlock: { width: '100%', marginBottom: '0.25rem' },
                socialButtonsBlockButton: {
                  background: 'var(--primary-teal)',
                  color: '#fff',
                  borderRadius: '14px',
                  border: 'none',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: '500',
                  fontSize: '1rem',
                  padding: '0.85rem 1rem',
                  marginBottom: '0.6rem',
                  width: '100%',
                  justifyContent: 'center',
                },
                socialButtonsBlockButtonText: {
                  color: '#fff',
                  fontFamily: 'Nunito, sans-serif',
                  flex: 'unset',
                },
                socialButtonsBlockButtonArrow: { display: 'none' },
                socialButtonsProviderIcon: { width: '20px', height: '20px', marginRight: '8px' },
                dividerRow: { margin: '1.25rem 0' },
                dividerText: { color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' },
                dividerLine: { background: '#e5e5e5' },
                formFields: { width: '100%', gap: '0' },
                formFieldRow: { marginBottom: '1rem', width: '100%' },
                formField: { width: '100%' },
                formFieldLabel: {
                  fontFamily: 'Nunito, sans-serif',
                  color: 'var(--text-dark)',
                  fontSize: '0.95rem',
                  marginBottom: '0.4rem',
                  display: 'block',
                },
                formFieldInput: {
                  background: 'var(--bg-beige)',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '1rem',
                  padding: '0.9rem 1.2rem',
                  boxShadow: 'none',
                  outline: 'none',
                  width: '100%',
                },
                formFieldInputShowPasswordButton: { color: 'var(--text-muted)' },
                formButtonPrimary: {
                  background: 'var(--primary-teal)',
                  borderRadius: '14px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: '500',
                  padding: '0.9rem',
                  marginTop: '0.75rem',
                  width: '100%',
                },
                footerActionText: { fontFamily: 'Nunito, sans-serif', color: 'var(--text-muted)' },
                footerActionLink: { color: 'var(--primary-teal)', fontFamily: 'Nunito, sans-serif' },
                footer: { background: 'transparent', borderTop: '1px solid #f0f0f0', marginTop: '1.25rem', paddingTop: '1rem' },
                identityPreviewText: { fontFamily: 'Nunito, sans-serif' },
                identityPreviewEditButton: { color: 'var(--primary-teal)' },
                formResendCodeLink: { color: 'var(--primary-teal)' },
                alternativeMethodsBlockButton: {
                  borderRadius: '12px',
                  fontFamily: 'Nunito, sans-serif',
                  border: '1px solid #e5e5e5',
                },
                otpCodeFieldInput: {
                  background: 'var(--bg-beige)',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Nunito, sans-serif',
                },
              },
              variables: {
                colorPrimary: '#558585',
                colorBackground: '#ffffff',
                colorInputBackground: '#F5EEE6',
                borderRadius: '12px',
                fontFamily: 'Nunito, sans-serif',
              },
            }}
          />
          ) : (
          <SignIn
            routing="path"
            path="/auth"
            signUpUrl="/auth/sign-up"
            forceRedirectUrl="/home"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                cardBox: { boxShadow: 'none', border: 'none', background: 'transparent', width: '100%' },
                card: { boxShadow: 'none', border: 'none', padding: 0, background: 'transparent', width: '100%', gap: 0 },
                header: { display: 'none' },
                main: { width: '100%', gap: '0' },
                form: { width: '100%', gap: '0' },
                socialButtonsBlock: { width: '100%', marginBottom: '0.25rem' },
                socialButtonsBlockButton: { background: 'var(--primary-teal)', color: '#fff', borderRadius: '14px', border: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: '500', fontSize: '1rem', padding: '0.85rem 1rem', marginBottom: '0.6rem', width: '100%', justifyContent: 'center' },
                socialButtonsBlockButtonText: { color: '#fff', fontFamily: 'Nunito, sans-serif', flex: 'unset' },
                socialButtonsBlockButtonArrow: { display: 'none' },
                socialButtonsProviderIcon: { width: '20px', height: '20px', marginRight: '8px' },
                dividerRow: { margin: '1.25rem 0' },
                dividerText: { color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' },
                dividerLine: { background: '#e5e5e5' },
                formFields: { width: '100%', gap: '0' },
                formFieldRow: { marginBottom: '1rem', width: '100%' },
                formField: { width: '100%' },
                formFieldLabel: { fontFamily: 'Nunito, sans-serif', color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: '0.4rem', display: 'block' },
                formFieldInput: { background: 'var(--bg-beige)', border: 'none', borderRadius: '12px', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', padding: '0.9rem 1.2rem', boxShadow: 'none', outline: 'none', width: '100%' },
                formFieldInputShowPasswordButton: { color: 'var(--text-muted)' },
                formButtonPrimary: { background: 'var(--primary-teal)', borderRadius: '14px', fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem', fontWeight: '500', padding: '0.9rem', marginTop: '0.75rem', width: '100%' },
                footerActionText: { fontFamily: 'Nunito, sans-serif', color: 'var(--text-muted)' },
                footerActionLink: { color: 'var(--primary-teal)', fontFamily: 'Nunito, sans-serif' },
                footer: { background: 'transparent', borderTop: '1px solid #f0f0f0', marginTop: '1.25rem', paddingTop: '1rem' },
                identityPreviewText: { fontFamily: 'Nunito, sans-serif' },
                identityPreviewEditButton: { color: 'var(--primary-teal)' },
                formResendCodeLink: { color: 'var(--primary-teal)' },
                alternativeMethodsBlockButton: { borderRadius: '12px', fontFamily: 'Nunito, sans-serif', border: '1px solid #e5e5e5' },
                otpCodeFieldInput: { background: 'var(--bg-beige)', border: 'none', borderRadius: '10px', fontFamily: 'Nunito, sans-serif' },
              },
              variables: { colorPrimary: '#558585', colorBackground: '#ffffff', colorInputBackground: '#F5EEE6', borderRadius: '12px', fontFamily: 'Nunito, sans-serif' },
            }}
          />
          )}
        </div>
      </div>
    </div>
  );
}
