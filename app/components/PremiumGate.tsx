export default function PremiumGate({ 
  isPremium, 
  children 
}: { 
  isPremium: boolean, 
  children: React.ReactNode 
}) {
  if (!isPremium) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-xl mb-4">🔒 Premium Feature</p>
        <p className="mb-4">Upgrade to access AI predictions and more!</p>
        <button className="bg-mood-purple text-white px-6 py-2 rounded-lg">
          Upgrade Now - $7.99/month
        </button>
      </div>
    )
  }
  
  return <>{children}</>
}
