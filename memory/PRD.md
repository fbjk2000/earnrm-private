# upmuch CRM - Product Requirements Document

## Overview
upmuch is an AI-powered CRM with automated lead generation engine for LinkedIn data collection and emailing. Designed to run marketing and sales departments with simplicity and teamwork focus.

## Access Information

### Super Admin Access
- **URL**: https://saleslead-hub.preview.emergentagent.com
- **Email**: florian@unyted.world
- **Password**: DavidConstantin18
- **Role**: Owner (full system access)

### Backend API
- **Base URL**: https://saleslead-hub.preview.emergentagent.com/api
- **Health Check**: /api/health
- **Documentation**: All endpoints prefixed with /api

### Integrations
- **Kit.com**: API Key `Opx5UQNfHpfg54YenT9V7Q` / Secret configured
- **Resend**: API Key `re_X94fatTj_...` (TEST MODE - only sends to verified emails)
- **Stripe**: Using `sk_test_emergent` test key

## What's Been Implemented (Feb 2026)

### Core CRM Features
- ✅ Lead Management (CRUD, CSV import, AI scoring)
- ✅ Deal Pipeline (6-stage Kanban with probability, expected close date, tags)
- ✅ Task Manager (Kanban with priorities, owner, deal linking)
- ✅ Companies Management
- ✅ Email Campaigns (with Kit.com integration)
- ✅ Dashboard with KPIs
- ✅ Pipeline Report (stage summaries with values and weighted values)

### Deal Enhancements
- ✅ Probability % field (0-100%) for each deal
- ✅ Expected Close Date field
- ✅ Tags system on deals for categorization
- ✅ Mandatory Task creation when creating a deal
- ✅ Task Owner assignment required
- ✅ Filters by stage, tag, and owner
- ✅ Weighted Value calculation (value × probability)

### Task Enhancements
- ✅ Filters by status and owner
- ✅ Deal Linking - tasks linked to deals show indicator
- ✅ Owner Display on task cards

### Pipeline Report
- ✅ Stage Summaries with deal count, total value, weighted value
- ✅ Admin View - admins see all deals in organization
- ✅ User View - regular users see only their own deals
- ✅ Team Summary tab (admin only) - per-member performance

### Support Page
- ✅ FAQ Section with common questions
- ✅ Training Section with placeholders
- ✅ Contact Form with email sending via Resend

### Admin Settings
- ✅ Support Email - configurable
- ✅ Stripe API Key - editable by super admin
- ✅ PayPal Credentials - Client ID & Secret editable
- ✅ Crypto Wallet Address - ETH wallet for payments
- ✅ UK VAT Rate - configurable (default: 20%)
- ✅ Deal Stages - configurable stage names
- ✅ Task Stages - configurable stage names

### 🆕 Stripe Payment Integration (Feb 6, 2026)
- ✅ **Subscription Plans**: Monthly (€15/user) and Annual (€144/year = €12/month)
- ✅ **Checkout Flow**: Stripe Checkout with plan selection
- ✅ **User Count Pricing**: Pay per additional user (first 3 free)
- ✅ **Discount Codes**: Apply percentage discounts at checkout
- ✅ **Crypto Payments**: 5% discount when paying with ETH/USDC via Stripe
- ✅ **UK VAT Calculation**: 20% VAT added to all invoices
- ✅ **Payment Status Polling**: Real-time payment confirmation
- ✅ **Webhook Support**: `/api/webhook/stripe` for payment events

### 🆕 Invoice System (Feb 6, 2026)
- ✅ **Auto Invoice Generation**: Created on successful payment
- ✅ **Invoice Numbering**: Sequential INV-XXXXX format
- ✅ **VAT Breakdown**: Shows subtotal, discount, VAT (20%), and total
- ✅ **PDF-ready HTML**: Printable invoice format
- ✅ **Email Delivery**: Invoice + T&C sent via Resend
- ✅ **Billing History**: View all invoices in Settings → Billing tab
- ✅ **Company Details**: Fintery Ltd. legal information included

### 🆕 Resend Email Integration (Feb 6, 2026)
- ✅ **Contact Form Emails**: Sends to configurable support email
- ✅ **Confirmation Emails**: Auto-reply to form submitters
- ✅ **Invoice Emails**: Sends invoice with Terms & Conditions
- ⚠️ **TEST MODE**: Currently only sends to florian@unyted.world (domain verification pending)

### Authentication
- ✅ JWT custom auth (email/password)
- ✅ Google OAuth (Emergent Auth)
- ✅ Session management

### Discount Code System
- ✅ Create discount codes (percentage based)
- ✅ Set validity periods
- ✅ Max uses limit
- ✅ Activate/deactivate codes
- ✅ Apply at checkout with validation

### Three-Tier Affiliate System
- ✅ Tier 1: Direct Referral (20% default)
- ✅ Tier 2: Sub-Referral (10% default)
- ✅ Tier 3: Sub-Sub-Referral (5% default)
- ✅ Referral tracking and earnings

## Pricing Structure
- **Free**: Up to 3 users
- **Pro Monthly**: €15/user/month + 20% UK VAT
- **Pro Annual**: €12/user/month (20% discount) + 20% UK VAT
- **Crypto Discount**: Additional 5% off when paying with ETH/USDC

## API Endpoints Summary

### Subscriptions & Payments (NEW)
- **GET /api/subscriptions/plans** - Get available plans
- **POST /api/subscriptions/checkout** - Create Stripe checkout
- **GET /api/subscriptions/status/{session_id}** - Check payment status
- **POST /api/webhook/stripe** - Stripe webhook handler

### Invoices (NEW)
- **GET /api/invoices** - Get user invoices
- **GET /api/invoices/{invoice_id}** - Get specific invoice
- **GET /api/invoices/{invoice_id}/html** - Get printable HTML invoice
- **GET /api/admin/invoices** - Get all invoices (admin)
- **GET /api/admin/transactions** - Get all transactions (admin)

### Support
- **POST /api/support/contact** - Submit contact form (sends email via Resend)

### Admin Settings
- **GET /api/admin/settings** - Get platform settings
- **PUT /api/admin/settings** - Update settings (Stripe, PayPal, Crypto, VAT, etc.)

### Pipeline Report
- **GET /api/pipeline/report** - Pipeline summary (admin sees all, users see own)
- **GET /api/pipeline/team-summary** - Team performance (admin only)

### Deals
- **GET /api/deals** - List deals (with stage, tag, owner filters)
- **GET /api/deals/tags** - Get all unique tags
- **POST /api/deals** - Create deal (requires mandatory task)
- **PUT /api/deals/{id}** - Update deal (permission-based)

### Tasks
- **GET /api/tasks** - List tasks (with status, owner filters)
- **POST /api/tasks** - Create task
- **PUT /api/tasks/{id}** - Update task

## Known Limitations

### Resend Email (TEST MODE)
- ⚠️ Currently only sends to verified email: `florian@unyted.world`
- **To fix**: Verify domain at https://resend.com/domains
- Once verified, update `SENDER_EMAIL` in backend/.env to use your domain

### Stripe (TEST MODE)
- Using test key `sk_test_emergent`
- For production: Update `STRIPE_API_KEY` in admin settings

## Next Tasks (P1/P2)
1. **P1**: Verify domain on Resend for production email sending
2. **P1**: PayPal checkout integration
3. **P1**: ETH wallet direct payment integration
4. **P2**: Team invitation system
5. **P2**: LinkedIn web scraping queue
6. **P2**: Email templates library

## Tech Stack
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Auth**: JWT + Emergent Google OAuth
- **Email**: Resend (transactional), Kit.com (marketing)
- **Payments**: Stripe (cards, crypto)
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key

## Test Reports
- /app/test_reports/iteration_1.json
- /app/test_reports/iteration_2.json
- /app/test_reports/iteration_3.json
- /app/test_reports/iteration_4.json
- /app/test_reports/iteration_5.json (latest - all tests pass)

## Legal Information
**Fintery Ltd.**
71-75 Shelton Street, Covent Garden
London, WC2H 9JQ, United Kingdom
UK Registered Company
