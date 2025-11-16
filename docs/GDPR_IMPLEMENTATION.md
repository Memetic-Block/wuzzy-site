# GDPR Compliance Implementation

This document describes the GDPR-compliant analytics session management implementation for Wuzzy.

## Overview

This implementation provides a **privacy-first, GDPR-compliant** approach to analytics tracking:

- ✅ **No cookies** - All session data stored in `localStorage` only
- ✅ **Explicit consent required** - Users must accept before any tracking
- ✅ **IP anonymization** - Backend anonymizes IPs for rate limiting (GDPR compliant)
- ✅ **Client-side control** - Users can clear session data anytime via browser
- ✅ **No personal data** - No PII collected or stored
- ✅ **Transparent policies** - Comprehensive Privacy Policy and Terms of Service

## Implementation Status

### ✅ Completed (Current Iteration)

1. **Analytics Composable** (`src/composables/analytics.ts`)
   - Session management with localStorage
   - GDPR-compliant consent handling
   - Fallback session generation when API unavailable
   - Prepared for future UBI event tracking

2. **Cookie Consent Banner** (`src/components/CookieConsent.vue`)
   - Non-intrusive bottom banner
   - Accept/Decline options
   - Link to Privacy Policy
   - Only shows when consent is pending

3. **Privacy Policy** (`src/views/privacy.vue`)
   - Comprehensive GDPR compliance documentation
   - User rights explanation (access, erasure, portability, etc.)
   - Data collection transparency
   - Clear retention policies

4. **Terms of Service** (`src/views/terms.vue`)
   - Legal framework for service usage
   - Intellectual property rights
   - Liability limitations
   - Dispute resolution procedures

5. **Configuration** (`src/app-config.ts`)
   - Added `VITE_ANALYTICS_API_URL` environment variable
   - Optional analytics backend integration

6. **Routing** (`src/main.ts`)
   - `/privacy` - Privacy Policy page
   - `/terms` - Terms of Service page
   - Footer links updated in `App.vue`

### 🔄 Future Iterations

The following will be implemented in later iterations:

1. **Actual UBI Event Tracking**
   - Search query tracking (when consented)
   - Click event tracking
   - Integration with Analytics Goblin backend
   - Real-time analytics dashboard

2. **Enhanced Analytics Features**
   - Query analytics aggregation
   - Popular search trends
   - Result click-through rates
   - User behavior insights

## Architecture

### Session Flow

```
User Opens App
      ↓
Analytics.initialize()
      ↓
Load consent from localStorage
      ↓
   Consent = "pending"? ──YES──→ Show Cookie Banner
      ↓ NO                             ↓
   Consent = "accepted"?           User Accepts/Declines
      ↓ YES                             ↓
Initialize Session ID           Save to localStorage
      ↓                                 ↓
Store in localStorage         Initialize Session (if accepted)
      ↓
Ready for tracking
```

### Data Storage

| Data Type | Location | Deletable | GDPR Classification |
|-----------|----------|-----------|---------------------|
| Session ID | localStorage | Yes (client-side) | Non-PII identifier |
| Consent Status | localStorage | Yes (client-side) | User preference |
| Analytics Events | OpenSearch UBI (future) | Yes (30 day retention) | Aggregated usage data |

### Components

```
App.vue
├── CookieConsent.vue (consent banner)
├── RouterView (pages)
│   ├── privacy.vue (Privacy Policy)
│   ├── terms.vue (Terms of Service)
│   └── ... (other pages)
└── composables/
    └── analytics.ts (session management)
```

## Usage Guide

### For Developers

#### 1. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Optional: Analytics Goblin API endpoint
# Leave empty to disable analytics (still shows consent banner)
VITE_ANALYTICS_API_URL=http://localhost:3001

# For production:
# VITE_ANALYTICS_API_URL=https://analytics.wuzzy.xyz
```

#### 2. Using Analytics in Components

```typescript
import { useAnalytics } from '@/composables/analytics'

const analytics = useAnalytics()

// Check if user has consented
if (analytics.hasConsent()) {
  const clientId = analytics.getClientId()
  // Use clientId in search requests
}

// Future: Track events (placeholder for now)
analytics.trackEvent('search_performed', queryId, {
  object: { object_id: 'doc-123' }
})
```

#### 3. Testing Consent Flow

```bash
# Start dev server
npm run dev

# Visit http://localhost:5173
# You should see the cookie consent banner at the bottom
# Accept or decline to test localStorage persistence

# Check localStorage in DevTools:
# - wuzzy_analytics_consent: "accepted" | "declined"
# - wuzzy_analytics_session_id: "sess_..." or "fallback-..."
```

### For Users

#### How to Clear Session Data

1. **Chrome/Edge:**
   - Open DevTools (F12)
   - Go to "Application" tab → "Local Storage"
   - Select the Wuzzy domain
   - Delete `wuzzy_analytics_consent` and `wuzzy_analytics_session_id`

2. **Firefox:**
   - Open DevTools (F12)
   - Go to "Storage" tab → "Local Storage"
   - Select the Wuzzy domain
   - Delete entries

3. **All Browsers:**
   - Use "Clear browsing data" feature
   - Select "Site data" or "Cookies and site data"

## GDPR Compliance Checklist

### ✅ Implemented

- [x] **Consent before tracking** - Cookie banner with Accept/Decline
- [x] **No cookies** - Only localStorage (client-controlled)
- [x] **IP anonymization** - Backend removes last IP octet (IPv4) or 4 segments (IPv6)
- [x] **Privacy Policy** - Comprehensive documentation at `/privacy`
- [x] **Terms of Service** - Legal framework at `/terms`
- [x] **Data minimization** - Only collect session ID and consent status
- [x] **Transparent processing** - Privacy Policy explains all data collection
- [x] **Right to erasure** - Users can clear localStorage anytime
- [x] **No third-party tracking** - No Google Analytics, no external scripts

### ⚠️ TODO (Before Production)

- [ ] **Update email addresses** - Replace placeholder emails in Privacy Policy and Terms:
  - `privacy@wuzzy.xyz`
  - `legal@wuzzy.xyz`
  - `dmca@wuzzy.xyz`
- [ ] **Add jurisdiction** - Specify governing law in Terms of Service (Section 12.1)
- [ ] **Configure retention** - Set up OpenSearch ILM policy for 30-day retention (future)
- [ ] **Data export** - Implement GDPR data export API (if needed, future)
- [ ] **Cookie policy** - Add cookie policy page (optional, we don't use cookies)

## File Reference

### New Files Created

```
src/
├── composables/
│   └── analytics.ts              # GDPR-compliant session management
├── components/
│   └── CookieConsent.vue         # Consent banner component
└── views/
    ├── privacy.vue               # Privacy Policy page
    └── terms.vue                 # Terms of Service page

.env.example                      # Environment variable template
docs/
└── GDPR_IMPLEMENTATION.md        # This file
```

### Modified Files

```
src/
├── app-config.ts                 # Added analyticsApiUrl
├── App.vue                       # Added CookieConsent component, footer links
└── main.ts                       # Added /privacy and /terms routes
```

## Analytics Backend Integration

This implementation is designed to work with the **Analytics Goblin** backend service (see attached README).

### Backend Features

- **Session Management** - Generates session IDs for client-side storage
- **Rate Limiting** - IP-based limits with GDPR-compliant anonymization
- **UBI Analytics** - OpenSearch User Behavior Insights integration
- **Health Checks** - Redis and OpenSearch health monitoring

### Integration Points (Future)

When analytics tracking is implemented in a future iteration:

1. **Session Init** - Frontend calls `/session/init` to get session ID
2. **Search Queries** - Include `client_id` in search API requests
3. **Events** - Send UBI events to backend (clicks, scrolls, etc.)
4. **Analytics** - Query aggregated data from `/analytics/*` endpoints

### Current Behavior

- If `VITE_ANALYTICS_API_URL` is set, session init attempts to contact backend
- If backend is unavailable, generates fallback session ID (still functional)
- Consent banner always shows (even without backend configured)
- No actual event tracking yet (placeholder logging only)

## Testing

### Build Testing

```bash
npm run build
# Should compile without errors
# Check dist/ for generated HTML with privacy/terms pages
```

### Manual Testing

1. **First Visit** - Should show cookie consent banner
2. **Accept** - Banner hides, localStorage has "accepted" status
3. **Decline** - Banner hides, localStorage has "declined" status
4. **Privacy Page** - Navigate to `/privacy`, should render policy
5. **Terms Page** - Navigate to `/terms`, should render ToS
6. **Footer Links** - Click Privacy/Terms links in footer
7. **Clear Storage** - Delete localStorage, reload, banner shows again

### Browser Compatibility

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

All browsers support `localStorage` and should work correctly.

## Security Considerations

### No Server-Side Sessions

- All session data stored client-side
- Server never stores session information
- Reduces attack surface and privacy risks

### IP Anonymization

- Backend anonymizes IPs before rate limiting
- IPv4: `192.168.1.123` → `192.168.1.0`
- IPv6: `2001:db8::1234` → `2001:db8::`

### CORS Configuration

Ensure Analytics Goblin backend has correct CORS headers:

```bash
# Backend .env
CORS_ORIGINS=https://wuzzy.xyz,http://localhost:5173
```

## Customization

### Consent Banner Styling

Edit `src/components/CookieConsent.vue`:

```vue
<div class="fixed bottom-0 left-0 right-0 z-50">
  <!-- Modify banner appearance here -->
</div>
```

### Privacy Policy Updates

Edit `src/views/privacy.vue`:

- Update effective date
- Add/remove sections as needed
- Update contact information
- Customize for your jurisdiction

### Analytics Configuration

Edit `src/composables/analytics.ts`:

```typescript
const CLIENT_NAME = 'wuzzy-site'      // Must match backend whitelist
const CLIENT_VERSION = '1.0.0'        // Semantic versioning
const SESSION_STORAGE_KEY = 'wuzzy_analytics_session_id'
const CONSENT_STORAGE_KEY = 'wuzzy_analytics_consent'
```

## Support and Maintenance

### Common Issues

**Q: Consent banner shows every time?**
A: Check localStorage is not being cleared by browser settings or extensions.

**Q: Session init fails?**
A: Check `VITE_ANALYTICS_API_URL` is correct and backend is running. Fallback session will be generated automatically.

**Q: Build errors with Tailwind?**
A: Ensure scoped styles don't use `@apply` with Tailwind v4. Use inline utility classes instead.

### Updating Privacy Policy

1. Edit `src/views/privacy.vue`
2. Update "Last Updated" date
3. Document changes in a changelog (optional)
4. Redeploy application

### Updating Terms

1. Edit `src/views/terms.vue`
2. Update "Last Updated" date
3. Notify users of significant changes (recommended)
4. Redeploy application

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [OpenSearch UBI Specification](https://github.com/opensearch-project/user-behavior-insights)

## License

This GDPR implementation follows the same license as the main Wuzzy project.

---

**Questions?** Open an issue on [GitHub](https://github.com/Memetic-Block/wuzzy-site/issues)
