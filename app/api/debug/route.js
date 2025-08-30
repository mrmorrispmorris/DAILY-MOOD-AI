// Debug endpoint for browser-based diagnostics
export async function GET() {
  try {
    const diagnostics = {
      env: process.env.NODE_ENV,
      port: process.env.PORT || 3001,
      timestamp: new Date().toISOString(),
      nextVersion: require('next/package.json').version,
      nodeVersion: process.version,
      hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasStripe: !!process.env.STRIPE_SECRET_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      envVars: {
        NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    };
    
    return Response.json(diagnostics);
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { 
      status: 500 
    });
  }
}


