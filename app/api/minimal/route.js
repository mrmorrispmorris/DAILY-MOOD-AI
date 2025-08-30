export async function GET() {
  console.log('🔍 Minimal endpoint called at:', new Date().toISOString())
  
  try {
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: Date.now(),
      message: 'Minimal endpoint working',
      env: process.env.NODE_ENV,
      port: process.env.PORT || 3001
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('🚨 Minimal endpoint error:', error)
    console.error('Error stack:', error.stack)
    return new Response(JSON.stringify({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      name: error.name
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}


