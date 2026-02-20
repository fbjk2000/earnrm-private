# earnrm CRM - Product Requirements Document

## Overview
earnrm is an AI-powered CRM with the slogan "Your CRM that pAIs you back". Features automated lead generation, LinkedIn data collection, and email marketing. Designed to run marketing and sales departments with simplicity and teamwork focus.

## Brand Guidelines
- **Primary Color**: #A100FF (Earnrm Purple)
- **Black**: #111111
- **Dark Background**: #0B0B0B
- **Gray**: #444444
- **Font**: Inter (primary), Lato (fallback)
- **Slogan**: "Your CRM that pAIs you back" (AI highlighted in purple)

## Logo Assets
- Horizontal logo: https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/u9efkh3m_earnrm_logo_horizontal_light_notag_purpleword.png
- With tagline: https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/vhcjdzuc_earnrm_logo_horizontal_light_tagline_purpleword.png

## Access Information

### Super Admin Access
- **Email**: florian@unyted.world
- **Password**: DavidConstantin18
- **Role**: Super Admin (full system access)

### Backend API
- **Base URL**: /api
- **Health Check**: /api/ returns "earnrm CRM API"

## Rebrand Status (Feb 20, 2026)
- ✅ All upmuch references replaced with earnrm
- ✅ Logo updated across all pages
- ✅ Color scheme updated to #A100FF purple
- ✅ Slogan "Your CRM that pAIs you back" implemented
- ✅ Footer updated with support@earnrm.com
- ✅ API returns "earnrm CRM API"

## Core Features
- Lead Management with AI scoring
- Deal Pipeline (6 stages, customizable per org)
- Task Management (Kanban)
- Email Campaigns with Kit.com integration
- Company/Contact Management
- Affiliate Program (self-enrollment)
- Multi-tier subscription (Free, Pro, Enterprise)

## Integrations
- Resend (Email - domain: earnrm.com pending verification)
- Kit.com (Email Marketing)
- Stripe (Payments)
- Emergent LLM Key (AI features)

## Technical Stack
- Frontend: React, TailwindCSS
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT + Emergent Google OAuth

## What's Been Implemented
- [x] Full CRM functionality (Leads, Deals, Tasks, Companies, Campaigns)
- [x] AI-powered lead scoring and email drafting
- [x] Multi-user organizations with role management
- [x] Customizable deal pipeline stages per organization
- [x] Affiliate self-enrollment system
- [x] Support page with FAQ and contact form
- [x] Complete rebrand to earnrm (Feb 2026)
- [x] **AI Quick Wins (Feb 20, 2026)**:
  - Smart Search: Natural language search across CRM data (leads, deals, tasks, companies)
  - AI Email Drafting: Generate personalized sales emails with purpose/tone selection
  - Lead Summary Generation: AI-powered analysis of lead profiles with engagement assessment

## Upcoming Features (User Requested)
- **Team Chat**: Real-time collaboration on leads and opportunities within organizations
- **Mobile Apps**: iOS/Android apps downloadable from landing page

## Future/Backlog Features
- AI-Powered Lead Enrichment (LinkedIn data)
- Conversation Intelligence (call recordings)
- Deal Forecast AI
- AI Chatbot for website
- Outbound call service integration
- Recording and analytics with AI feedback on calls

## Next Action Items
- Configure earnrm.com domain DNS
- Verify Resend domain for email sending
- Test affiliate signup flow end-to-end
