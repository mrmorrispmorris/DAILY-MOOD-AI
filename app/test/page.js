// Minimal test page with zero dependencies
export default function TestPage() {
  return (
    <div>
      <h1>🎯 MINIMAL TEST PAGE</h1>
      <p>If you see this, basic Next.js routing works</p>
      <p>Timestamp: {new Date().toString()}</p>
      <ul>
        <li>✅ Next.js App Router</li>
        <li>✅ Server-side rendering</li>
        <li>✅ Basic React components</li>
      </ul>
    </div>
  );
}


