# earnrm CRM - Product Requirements Document

## Overview
earnrm is an AI-powered CRM with the slogan "Your CRM that pAIs you back". Features automated lead generation, LinkedIn data collection, and email marketing. Designed to run marketing and sales departments with simplicity and teamwork focus.

## Brand Guidelines
- **Primary Color**: #A100FF (Earnrm Purple)
- **Black**: #111111
- **Dark Background**: #0B0B0B
- **Font**: Inter (primary), Lato (fallback)
- **Slogan**: "Your CRM that pAIs you back"

## Logo Assets
- Horizontal logo: https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/u9efkh3m_earnrm_logo_horizontal_light_notag_purpleword.png

## Access Information
- **Email**: florian@unyted.world
- **Password**: DavidConstantin18
- **Role**: Super Admin

## Technical Stack
- Frontend: React, TailwindCSS, Shadcn UI
- Backend: FastAPI (Python), Motor
- Database: MongoDB
- Auth: JWT + Emergent Google OAuth
- Payments: Stripe
- Email: Resend
- AI: OpenAI GPT-5.2 via Emergent LLM Key
- Calling: Twilio (credentials added, phone number pending)

## What's Been Implemented
- [x] Full CRM (Leads, Deals, Tasks, Companies, Campaigns)
- [x] AI-powered lead scoring, email drafting, smart search, lead summary
- [x] Multi-user organizations with role management
- [x] Customizable deal pipeline stages
- [x] Affiliate system, Support page, Rebrand to earnrm
- [x] Real-time Team Chat with contextual channels (Lead/Deal)
- [x] Team Invitations (Link, Email, CSV)
- [x] PWA Mobile App (manifest, service worker, install prompt)
- [x] Outbound Calling (Twilio integration, call recording, AI call analysis)
- [x] **Call Scheduling (Feb 21, 2026)**:
  - Schedule calls with leads at specific dates/times
  - Calendar date picker with time slot selection
  - Configurable reminders (5m, 15m, 30m, 1h, 1 day before)
  - Notes/talking points for each scheduled call
  - Upcoming Calls banner with Today/Tomorrow labels
  - Tabbed view: Call History / Scheduled
  - Edit, complete, and cancel scheduled calls
  - Automated reminder notifications via existing notification system
  - Stats card showing scheduled count

## Integrations
- Resend (Email), Kit.com (Email Marketing), Stripe (Payments)
- Emergent LLM Key (AI - GPT-5.2)
- Twilio (Calling - SID+Auth configured, phone number pending)

## P0 - Requires User Action
- Twilio phone number (TWILIO_PHONE_FROM) needed to enable live calling

## P1 - Upcoming
- End-to-end call flow testing once Twilio phone number is provided
- Call recording transcription with AI feedback

## P2 - Future/Backlog
- AI-Powered Lead Enrichment
- Conversation Intelligence (call transcription)
- Deal Forecast AI
- AI Chatbot for website
