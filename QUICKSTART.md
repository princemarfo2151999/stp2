# CPMS Quick Start Guide

## 🚀 Run the Project

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Visit: **http://localhost:3000**

---

## ⚙️ Configuration Checklist

### 1. Database Setup
- [ ] Update `.env.local` with your MariaDB password
- [ ] Create database: `CREATE DATABASE cpms;`
- [ ] Run schema migrations (if SQL file exists)

### 2. Payment Gateway Setup
Navigate to **Settings → Payment** in dashboard:

**YouCan Pay:**
- [ ] Enable toggle
- [ ] Enter OAuth Client ID
- [ ] Enter Client Secret
- [ ] Test connection

**CMI Gateway:**
- [ ] Enable toggle
- [ ] Enter Store/Merchant ID
- [ ] Enter Client ID
- [ ] Enter API Secret Key
- [ ] Enter Gateway URL
- [ ] Test connection

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment configuration |
| `lib/db/mariadb.ts` | Database connection |
| `lib/payment/youcan-pay.ts` | YouCan Pay service |
| `lib/payment/cmi.ts` | CMI payment service |
| `app/api/payment/youcan/route.ts` | YouCan Pay API |
| `app/api/payment/cmi/route.ts` | CMI API |
| `components/stations-map.tsx` | Interactive map |

---

## 🧪 Test API Endpoints

### Create Payment (YouCan Pay)
```bash
curl -X POST http://localhost:3000/api/payment/youcan \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-payment",
    "sessionId": "test-123",
    "amount": 50.00,
    "customerId": "user-456"
  }'
```

### Create Payment (CMI)
```bash
curl -X POST http://localhost:3000/api/payment/cmi \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-payment",
    "sessionId": "test-123",
    "amount": 50.00,
    "email": "test@example.com"
  }'
```

---

## 🗺️ Map Features

- **Green markers** = Available stations
- **Yellow markers** = In use
- **Red markers** = Offline
- **Gray markers** = Maintenance

Click markers for station details!

---

## 🔐 Authentication

- **Login:** `/auth/login`
- **Signup:** `/auth/signup`
- Protected routes redirect to login automatically

---

## 📝 Next Steps

1. Configure payment gateways in settings
2. Add test stations via API
3. Test charging session flow
4. Verify map displays correctly
5. Test end-to-end payment

---

For detailed documentation, see [`walkthrough.md`](file:///C:/Users/WHY/.gemini/antigravity/brain/5c27ed44-9946-4a58-b90b-5714165a631b/walkthrough.md)
