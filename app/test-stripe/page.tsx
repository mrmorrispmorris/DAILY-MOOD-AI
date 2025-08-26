'use client'

export default function TestStripePage() {
  const testPayment = async () => {
    try {
      console.log('🧪 Testing Stripe checkout with bypass...')
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user-123' }),
      });
      
      const result = await response.json();
      console.log('Stripe API Response:', result);
      
      if (result.url) {
        console.log('✅ SUCCESS: Stripe checkout URL received')
        window.location.href = result.url;
      } else {
        console.log('❌ ERROR: No checkout URL in response')
        alert('Error: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed: ' + error);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🧪 STRIPE PAYMENT TEST</h1>
      <p>Authentication Bypass - Direct Stripe Integration Test</p>
      <button
        onClick={testPayment}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🚀 TEST STRIPE CHECKOUT
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        This bypasses authentication to test Stripe integration directly
      </p>
    </div>
  );
}
