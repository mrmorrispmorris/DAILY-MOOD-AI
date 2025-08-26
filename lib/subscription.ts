import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Premium check error:', error);
      return false;
    }
    
    return data?.subscription_status === 'premium';
  } catch (error) {
    console.error('Premium check failed:', error);
    return false;
  }
}

export async function requirePremium(userId: string): Promise<void> {
  const isPremium = await checkPremiumStatus(userId);
  if (!isPremium) {
    throw new Error('Premium subscription required');
  }
}
