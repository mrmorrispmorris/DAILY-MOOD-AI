# 🧪 Complete Payment Flow Testing Guide

## **Prerequisites Checklist**

Before testing, ensure:
- [ ] `.env.local` configured with all Stripe credentials
- [ ] Run `npm run check-env` - should show "✅ ENVIRONMENT SETUP COMPLETE!"
- [ ] Development server running: `npm run dev`
- [ ] Stripe Dashboard open: https://dashboard.stripe.com

---

## **🔄 Complete Payment Flow Test**

### **STEP 1: Free User Experience**
1. **Visit Dashboard** → http://localhost:3000/dashboard
   - **Expected**: AI Insights section shows premium gate
   - **Expected**: Recent moods limited to 3 entries
   - **Expected**: Premium upgrade prompts visible

2. **Test Premium Gates**:
   - Click "Upgrade Now" on AI Insights gate
   - **Expected**: Redirects to pricing page if not logged in
   - **Expected**: Triggers Stripe checkout if logged in

### **STEP 2: Pricing Page Flow**
1. **Visit Pricing** → http://localhost:3000/pricing
   - **Expected**: Two pricing tiers (Free $0, Premium $7.99)
   - **Expected**: "Get Started Free" → login page
   - **Expected**: "Start Premium" → login or checkout

2. **Authentication Flow**:
   - Click "Start Premium" when not logged in
   - **Expected**: Redirects to `/login?redirect=pricing`
   - Enter email → receive magic link
   - **Expected**: After login, redirected back to pricing

3. **Premium Subscription Flow**:
   - Click "Start Premium" when logged in
   - **Expected**: Redirects to Stripe Checkout
   - **Expected**: Price shows $7.99/month
   - **Expected**: Customer email pre-filled

### **STEP 3: Stripe Checkout Testing**

**🧪 Test Credit Cards (Stripe Test Mode):**
```
✅ Successful Payment:    4242 4242 4242 4242
❌ Declined Payment:      4000 0000 0000 0002  
⚠️  Requires Auth:       4000 0025 0000 3155
🔄 Processing Delay:     4000 0000 0000 0259
```

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits (e.g., 123)

1. **Complete Test Payment**:
   - Use successful test card: 4242 4242 4242 4242
   - **Expected**: Payment processes successfully
   - **Expected**: Redirected to `/dashboard?success=true`

2. **Verify Premium Status**:
   - Visit dashboard after successful payment
   - **Expected**: AI Insights section shows content (no gate)
   - **Expected**: Recent moods shows up to 12 entries
   - **Expected**: No premium upgrade prompts

### **STEP 4: Webhook Verification**
1. **Check Stripe Dashboard**:
   - Go to: Developers → Webhooks → Your Endpoint
   - **Expected**: Successful webhook deliveries
   - **Expected**: Event types: `checkout.session.completed`

2. **Check Database**:
   - Open Supabase Dashboard
   - Check `users` table for updated subscription status
   - Check `subscriptions` table for new subscription record

### **STEP 5: Edge Case Testing**

1. **Payment Decline**:
   - Use declined card: 4000 0000 0000 0002
   - **Expected**: Error message, return to pricing
   - **Expected**: User remains on free plan

2. **Authentication Redirect**:
   - Logout, visit `/pricing`
   - Click premium without login
   - **Expected**: Redirects to login with proper redirect param

3. **Multiple Subscriptions**:
   - Try to subscribe again with premium user
   - **Expected**: Handle gracefully (prevent duplicate subs)

---

## **📊 Success Criteria Checklist**

### **✅ User Experience**
- [ ] Smooth login → pricing → checkout flow
- [ ] Clear premium vs free feature distinction
- [ ] Proper loading states throughout
- [ ] Error handling for failed payments

### **✅ Technical Integration**  
- [ ] Stripe checkout session creates successfully
- [ ] Webhook receives and processes events
- [ ] Database updates subscription status
- [ ] Premium features unlock immediately

### **✅ Business Logic**
- [ ] Free users see premium gates
- [ ] Premium users see full features
- [ ] Pricing displays correctly ($7.99/month)
- [ ] Revenue tracking in Stripe Dashboard

---

## **🚨 Common Issues & Solutions**

**Issue**: "Invalid Price ID"  
**Solution**: Copy exact Price ID from Stripe → Products

**Issue**: Webhook not receiving events  
**Solution**: Check endpoint URL, use ngrok for local testing

**Issue**: Premium status not updating  
**Solution**: Verify webhook secret, check database policies

**Issue**: Checkout session creation fails  
**Solution**: Verify all Stripe environment variables

---

## **🎯 Ready for Production**

Once all tests pass:
1. **Update environment variables** in Vercel with production Stripe keys
2. **Create production Stripe product** with real pricing
3. **Update webhook endpoint** to production URL
4. **Test with real payment** (small amount)

**💰 RESULT: $10K/month revenue system fully operational!**

---

## **Quick Test Command**
```bash
# Verify everything is ready
npm run check-env
npm run dev

# Open test URLs
# http://localhost:3000/pricing
# http://localhost:3000/dashboard
```
