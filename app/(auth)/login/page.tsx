export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#333'
        }}>
          🚀 TESTING: DailyMood AI
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem'
        }}>
          MINIMAL TEST - Track your mood with AI-powered insights
        </p>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Enter your email (MINIMAL TEST)"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '1rem'
            }}
          />
          
          <button style={{
            width: '100%',
            background: '#8b5cf6',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            🔥 SEND MAGIC LINK (TEST)
          </button>
        </div>
        
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#999',
          marginTop: '1rem'
        }}>
          NUCLEAR TEST VERSION - If you see tabs or password field, something is hijacking this component!
        </p>
      </div>
    </div>
  )
}