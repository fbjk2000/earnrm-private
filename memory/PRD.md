# earnrm CRM - Product Requirements Document

## Overview
earnrm - "Your CRM that pAIs you back". AI-powered CRM.

## Access
- **Email**: florian@unyted.world | **Password**: DavidConstantin18

## Technical Stack
React, TailwindCSS, Shadcn UI | FastAPI, Motor, MongoDB | JWT + Google OAuth | Stripe | Resend | GPT-5.2 | Twilio (phone pending)

## Roles
- **super_admin**: Full platform access (discount codes, all admin features)
- **deputy_admin**: Same as super_admin (discount codes, admin)
- **support**: Can manage support requests
- **owner**: Organization owner
- **admin**: Organization admin
- **member**: Regular member

## Implemented Features
- [x] Full CRM (Leads, Deals, Tasks, Companies, Campaigns, Contacts)
- [x] AI: lead scoring, email drafting, smart search, lead summary, call analysis, lead enrichment
- [x] Lead detail/edit, Contact detail/edit with sales fields
- [x] Deal → Company/Contact/Lead linking
- [x] Contact CSV import + manual creation
- [x] Bulk operations (enrich, update, delete) + campaign linking
- [x] Lead → Contact conversion
- [x] Chat archive + collapsible channels
- [x] Calling, Recording, AI Analysis, Scheduling
- [x] Team Chat, Invitations, PWA, Affiliate program
- [x] **Super Admin Dashboard**: User analytics (last login, joined date), org data stats, role management (deputy_admin, support roles)
- [x] **Support Request Management**: View/update status (new, in_progress, resolved)
- [x] **Auto-Lead from Signups**: New registrations auto-create leads in super admin's org, affiliate referrals tagged
- [x] **Discount codes restricted** to super_admin + deputy_admin only
- [x] Column visibility toggles for Leads and Contacts lists

## P0 - Requires User Action
- Twilio phone number for live calling

## P2 - Future/Backlog
- Conversation Intelligence, Deal Forecast AI, AI Chatbot
