# 🚀 Stripe Integration Setup Guide

## **Quick Setup (5 Minutes)**

### **STEP 1: Create `.env.local` File**
Create a `.env.local` file in your project root with your existing Supabase variables PLUS these new Stripe variables:

```bash
# Your existing Supabase configuration (KEEP THESE)
SUPABASE_URL=your_current_supabase_url
SUPABASE_ANON_KEY=your_current_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NEW: Add these Stripe variables
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_PRICE_ID=price_1...
STRIPE_WEBHOOK_SECRET=whsec_...

# App configuration
NEXT_PUBLIC_URL=http://localhost:3000
```

### **STEP 2: Get Stripe Credentials**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Get API Keys**: 
   - Navigate: `Developers` → `API keys`
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy `Secret key` → `STRIPE_SECRET_KEY`

3. **Create Product & Price**:
   - Navigate: `Products` → `Add product`
   - Name: "DailyMood Premium"
   - Price: $7.99/month (recurring)
   - Copy the `Price ID` → `STRIPE_PRICE_ID`

4. **Setup Webhook** (Optional for now):
   - Navigate: `Developers` → `Webhooks`
   - Add endpoint: `http://localhost:3000/api/stripe/webhook`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### **STEP 3: Test The Integration**

1. **Restart Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Flow**:
   - Visit: http://localhost:3000/pricing
   - Click "Start Premium" 
   - Should redirect to login if not authenticated
   - After login, should redirect to Stripe Checkout

### **STEP 4: Verify Environment**

```bash
# Check if variables are loaded
node -e "console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Found' : 'Missing')"
```

## **Production Deployment**

Add the same environment variables to your Vercel deployment:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with production values
3. Redeploy

## **Troubleshooting**

**"Missing Stripe credentials"**: 
- Verify `.env.local` exists in project root
- Check variable names match exactly
- Restart development server

**"Invalid Price ID"**:
- Copy Price ID from Stripe Dashboard → Products
- Format: `price_1234567890abcdef`

**Webhook Issues**:
- Use ngrok for local testing: `ngrok http 3000`
- Update webhook URL in Stripe Dashboard

## **Next Steps After Setup**

The system will automatically:
✅ Handle user authentication flow  
✅ Redirect to Stripe Checkout  
✅ Process subscription webhooks  
✅ Update user premium status  

**Ready for $10K/month revenue generation! 🚀**
