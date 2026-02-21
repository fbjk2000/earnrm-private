# earnrm CRM - Product Requirements Document

## Overview
earnrm is an AI-powered CRM. "Your CRM that pAIs you back".

## Access
- **Email**: florian@unyted.world | **Password**: DavidConstantin18 | **Role**: Super Admin

## Technical Stack
- Frontend: React, TailwindCSS, Shadcn UI | Backend: FastAPI, Motor, MongoDB
- Auth: JWT (7-day expiry) + Emergent Google OAuth | Payments: Stripe | Email: Resend
- AI: OpenAI GPT-5.2 via Emergent LLM Key | Calling: Twilio (phone number pending)

## Implemented Features
- [x] Full CRM (Leads, Deals, Tasks, Companies, Campaigns)
- [x] AI features (lead scoring, email drafting, smart search, lead summary, call analysis)
- [x] Multi-user orgs, role management, customizable pipelines
- [x] Affiliate program with HTML embed code for CMS + 3 social media assets
- [x] Support page (DashboardLayout for logged-in users)
- [x] Real-time Team Chat with contextual channels (Lead/Deal)
- [x] Team Invitations (Link, Email, CSV)
- [x] PWA Mobile App (Settings > Mobile App tab + Landing page)
- [x] Outbound Calling (Twilio), Call Recording, AI Call Analysis
- [x] Call Scheduling (calendar, reminders, upcoming banner)
- [x] Session persistence (7-day JWT, resilient to network errors)
- [x] Stripe cancel_url redirects to /settings (no logout on payment cancel)

## P0 - Requires User Action
- Twilio phone number (TWILIO_PHONE_FROM) needed for live calling

## P1 - Upcoming
- E2E call flow testing with Twilio phone number

## P2 - Future/Backlog
- AI-Powered Lead Enrichment
- Conversation Intelligence (call transcription)
- Deal Forecast AI
- AI Chatbot for website
