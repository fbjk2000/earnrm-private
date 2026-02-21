# earnrm CRM - Product Requirements Document

## Overview
earnrm is an AI-powered CRM with the slogan "Your CRM that pAIs you back". Features automated lead generation, LinkedIn data collection, and email marketing.

## Brand Guidelines
- **Primary Color**: #A100FF | **Font**: Inter (primary), Lato (fallback)

## Access Information
- **Email**: florian@unyted.world | **Password**: DavidConstantin18 | **Role**: Super Admin

## Technical Stack
- Frontend: React, TailwindCSS, Shadcn UI
- Backend: FastAPI (Python), Motor, MongoDB
- Auth: JWT (7-day expiry) + Emergent Google OAuth
- Payments: Stripe | Email: Resend | AI: OpenAI GPT-5.2 via Emergent LLM Key
- Calling: Twilio (SID+Auth configured, phone number pending)

## What's Been Implemented
- [x] Full CRM (Leads, Deals, Tasks, Companies, Campaigns)
- [x] AI features (lead scoring, email drafting, smart search, lead summary)
- [x] Multi-user organizations, role management, customizable pipelines
- [x] Affiliate system, Support page (now renders in DashboardLayout for logged-in users)
- [x] Real-time Team Chat with contextual channels (Lead/Deal)
- [x] Team Invitations (Link, Email, CSV)
- [x] PWA Mobile App (manifest, service worker, install prompt, Settings > Mobile App tab)
- [x] Outbound Calling (Twilio integration, call recording, AI call analysis)
- [x] Call Scheduling (calendar, reminders, upcoming banner, edit/complete/cancel)
- [x] **Bug Fixes (Feb 21, 2026)**:
  - Support page no longer logs out authenticated users (uses DashboardLayout)
  - Session persists 7 days (JWT 168h, token only cleared on 401)
  - PWA install accessible from Settings > Mobile App tab

## P0 - Requires User Action
- Twilio phone number (TWILIO_PHONE_FROM) needed for live calling

## P1 - Upcoming
- E2E call flow testing once Twilio phone number provided
- Call recording transcription with AI feedback

## P2 - Future/Backlog
- AI-Powered Lead Enrichment
- Conversation Intelligence (call transcription)
- Deal Forecast AI
- AI Chatbot for website
