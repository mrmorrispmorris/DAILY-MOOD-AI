# Google Ads Campaign Setup Guide
## DailyMood AI - Paid Acquisition Channel

### 📊 Campaign Overview
- **Daily Budget:** $50/day ($1,500/month)
- **Expected CAC:** $25-40 per trial signup
- **Target ROAS:** 300% (3:1 return)
- **Geographic Targeting:** US, Canada, UK, Australia

---

## 🎯 Campaign Structure

### Campaign 1: Search Campaign - Mood Tracking
- **Campaign Type:** Search Network
- **Bidding Strategy:** Target CPA ($35)
- **Budget:** $40/day

#### Ad Group 1: Exact Match - High Intent
**Keywords:**
- [mood tracker] - $2.50 max bid
- [mood tracker app] - $3.00 max bid  
- [daily mood tracker] - $2.25 max bid
- [mood tracking app] - $2.75 max bid
- [mental health tracker] - $2.00 max bid

**Ad Copy A:**
```
Headline 1: AI-Powered Mood Tracker
Headline 2: Track & Improve Mental Health
Description: Get personalized insights with our smart mood tracking app. Free 14-day trial, no credit card required.
Landing Page: /ads/mood-tracker
```

**Ad Copy B:**
```
Headline 1: Best Mood Tracking App 2025
Headline 2: Understand Your Emotions
Description: Join 10,000+ users improving mental wellness. AI insights, beautiful charts, complete privacy.
Landing Page: /ads/mood-tracker
```

#### Ad Group 2: Broad Match - Discovery
**Keywords:**
- mental health app - $1.75 max bid
- depression tracker - $2.25 max bid
- anxiety tracker - $2.00 max bid
- emotional wellness app - $1.50 max bid
- mood journal app - $1.90 max bid

**Landing Page:** /ads/mental-health

#### Ad Group 3: Competitor Targeting
**Keywords:**
- "daylio alternative" - $3.50 max bid
- "mood meter alternative" - $2.75 max bid
- "better than daylio" - $4.00 max bid

**Landing Page:** /ads/daylio-alternative

---

## 📈 Conversion Tracking Setup

### Conversion Actions
1. **Trial Signup** 
   - Value: $1.00
   - Category: Sign-up
   - Attribution: 30 days view, 1 day click

2. **Subscription Purchase**
   - Value: $10.00 
   - Category: Purchase
   - Attribution: 30 days view, 30 days click

3. **First Mood Logged**
   - Value: $2.00
   - Category: Custom
   - Attribution: 7 days view, 1 day click

### Implementation Code
```javascript
// In layout.tsx head section:
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script>

// Conversion tracking calls:
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXXX/trial_signup',
  'value': 1.0,
  'currency': 'USD'
});
```

---

## 🎨 Ad Extensions

### Sitelink Extensions
- **Free Trial** → /login
- **Features** → /features  
- **Pricing** → /pricing
- **Blog** → /blog

### Callout Extensions
- Free 14-Day Trial
- No Credit Card Required
- AI-Powered Insights
- HIPAA Compliant
- 4.9/5 Rating
- 10,000+ Users

### Structured Snippets
- **Features:** AI Insights, Pattern Recognition, Data Export, Privacy Protection
- **Platforms:** Web App, Mobile Responsive, Offline Access

---

## 📊 Performance Monitoring

### Key Metrics to Track Daily
1. **CTR (Click-Through Rate)** - Target: >2%
2. **CPC (Cost Per Click)** - Target: <$2.50
3. **Conversion Rate** - Target: >3%
4. **CPA (Cost Per Acquisition)** - Target: <$35
5. **Quality Score** - Target: 7+

### Weekly Optimization Tasks
- [ ] Review Search Terms Report
- [ ] Add negative keywords
- [ ] Adjust bids based on performance
- [ ] Test new ad copy
- [ ] Analyze landing page metrics

### Monthly Reviews
- [ ] Campaign budget reallocation
- [ ] Audience insights analysis
- [ ] Competitor landscape review
- [ ] Landing page A/B test results
- [ ] Attribution model optimization

---

## 🚫 Negative Keywords List

### General Negatives
- free
- download
- cheap
- torrent
- crack
- pirate
- reddit

### Health-Specific Negatives
- crisis
- suicide
- emergency
- therapy
- counseling
- medication
- doctor
- hospital
- bipolar disorder
- schizophrenia

### Competitor Negatives (if not targeting)
- daylio free
- mood meter free
- sanvello
- talkspace
- betterhelp

---

## 📱 Landing Page Optimization

### A/B Test Elements
1. **Headlines**
   - Emotional vs Rational
   - Benefit vs Feature-focused
   - Urgency vs Comfort

2. **Call-to-Action**
   - "Start Free Trial" vs "Begin Your Journey"
   - Button color: Blue vs Green vs Purple
   - Button size and placement

3. **Social Proof**
   - Number of users (10,000+ vs 10K+)
   - Star ratings vs testimonials
   - Company logos vs individual reviews

### Performance Targets
- **Page Load Speed:** <3 seconds
- **Bounce Rate:** <50%
- **Conversion Rate:** >3%
- **Time on Page:** >60 seconds

---

## 💡 Optimization Strategies

### Week 1-2: Learning Phase
- Let Google's algorithm gather data
- Monitor for obvious issues (high CPC, low QS)
- Ensure conversion tracking works

### Week 3-4: Initial Optimizations  
- Pause underperforming keywords
- Increase bids on top performers
- Add negative keywords from search terms
- Test new ad copy variants

### Month 2+: Advanced Optimization
- Implement audience targeting
- Test landing page variants
- Expand to high-performing keywords
- Consider Display remarketing

---

## 📋 Daily Checklist

### Morning (10 minutes)
- [ ] Check overnight performance
- [ ] Review any alerts or notifications
- [ ] Quick budget/spend check
- [ ] Note any anomalies

### Evening (20 minutes)  
- [ ] Review day's performance vs targets
- [ ] Check conversion tracking
- [ ] Review search terms report
- [ ] Plan tomorrow's optimizations

---

## 🎯 Success Metrics (Monthly)

### Month 1 Targets
- **Conversions:** 50 trial signups
- **CPA:** <$30
- **ROAS:** >200%
- **Quality Score:** >6

### Month 3 Targets  
- **Conversions:** 150 trial signups
- **CPA:** <$25
- **ROAS:** >300%
- **Quality Score:** >8

### Scale-Up Criteria
- Consistent CPA <$25 for 2 weeks
- Quality Scores >7 across campaigns
- Landing page conversion rate >4%
- Budget fully utilized daily

---

## 📞 Emergency Protocols

### High CPA Alert (>$50)
1. Pause campaign immediately
2. Review search terms for irrelevant clicks
3. Check landing page functionality
4. Verify conversion tracking

### Low Impressions (<1000/day)
1. Increase keyword bids by 25%
2. Expand keyword match types
3. Review keyword relevance scores
4. Check geographic targeting

### Account Suspension
1. Review Google Ads policies
2. Check landing page compliance
3. Submit appeal with corrections
4. Contact Google support

---

**Campaign Manager:** Marketing Team  
**Last Updated:** January 29, 2025  
**Next Review:** February 5, 2025


