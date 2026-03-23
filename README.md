# earnrm — Your CRM that pAIs you back

<p align="center">
  <img src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/u9efkh3m_earnrm_logo_horizontal_light_notag_purpleword.png" alt="earnrm" height="60" />
</p>

<p align="center">
  <strong>AI-powered CRM for lead management, deal pipeline, projects, team collaboration & outbound calling</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#external-api-v1">External API</a> •
  <a href="#integrations">Integrations</a>
</p>

---

## Features

### Core CRM
- **Leads** — Import via CSV, manual creation, AI enrichment & scoring, bulk operations, column visibility
- **Contacts** — Convert from qualified leads, rich profiles (budget, timeline, decision maker, pain points)
- **Deals** — Kanban pipeline with drag-and-drop + list view, entity linking (Lead/Contact/Company), lost deals excluded from pipeline
- **Tasks** — Kanban board with assignee management, admin visibility, due dates, project linking
- **Projects** — Group tasks under deals, progress tracking, auto-created project chat channels, team members
- **Companies** — Target company management with industry, size, and contact tracking
- **Calendar** — Month/Week views with scheduled calls, task due dates, deal closes, custom events, Google Calendar sync
- **Campaigns** — Email campaigns via Resend + Kit.com, AI-powered drafting, bulk recipient management

### AI Features (GPT-5.2)
- **Lead Scoring** — AI assigns a 1-100 quality score
- **Lead Enrichment** — Fills in company info, tech stack, interests, recommended sales approach
- **Email Drafting** — Personalized sales emails with tone/purpose selection
- **Lead Summary** — Comprehensive AI profile analysis
- **Smart Search** — Natural language search across all CRM data
- **Call Analysis** — AI feedback on recorded calls (score, strengths, improvements, next steps)

### Communication
- **Outbound Calling** — Twilio integration for direct calls from the CRM
- **Inbound Calls** — Auto-greeting, voicemail recording, caller identification
- **Call Scheduling** — Calendar-based scheduling with configurable reminders
- **Google Calendar** — OAuth integration, two-way sync, events displayed in calendar view
- **Team Chat** — Real-time messaging with channels: General, Lead, Deal, Project
- **Chat Archive** — Admins can archive channels, collapsible sidebar sections

### Platform
- **Multi-tenant Organizations** — Roles: member, admin, owner, deputy_admin, support, super_admin
- **Auto Org Attribution** — Users with company emails auto-join matching organizations
- **License Management** — Super admin can override max user limits per organization
- **Team Invitations** — Invite via link, email, or CSV import
- **Affiliate Program** — HTML embed codes, social media assets, commission tracking
- **PWA** — Installable on iOS, Android, and desktop
- **API Keys & Webhooks** — Programmatic access for n8n, Notion, Zapier, and custom integrations
- **Data Explorer** — Super admin can browse all MongoDB collections
- **Subscription & Billing** — Stripe integration with discount codes and invoicing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Shadcn/UI, @hello-pangea/dnd |
| Backend | Python 3.11, FastAPI, Motor (async MongoDB) |
| Database | MongoDB |
| Auth | JWT (7-day expiry) + Emergent Google OAuth |
| AI | OpenAI GPT-5.2 via Emergent Integrations |
| Email | Resend (primary), Kit.com (optional) |
| Payments | Stripe |
| Calling | Twilio Voice API |

---

## Getting Started

### Prerequisites
- Python 3.11+, Node.js 18+, MongoDB, Yarn

### Environment Variables

**Backend** (`/backend/.env`):
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="earnrm_db"
JWT_SECRET="your_secret_key"
JWT_ALGORITHM="HS256"
JWT_EXPIRY_HOURS=168
EMERGENT_LLM_KEY="your_emergent_key"
RESEND_API_KEY="your_resend_key"
SENDER_EMAIL="noreply@earnrm.com"
KIT_API_KEY="your_kit_key"
KIT_API_SECRET=""
STRIPE_API_KEY="your_stripe_key"
SUPER_ADMIN_EMAIL="admin@yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_FROM="+1234567890"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

**Frontend** (`/frontend/.env`):
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### Installation

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
yarn install
yarn start
```

---

## API Reference

> **Base URL**: `https://yourdomain.com/api`

### Authentication

All internal endpoints require: `Authorization: Bearer <jwt_token>`

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "password" }
```
**Response**: `{ "user_id", "email", "name", "organization_id", "role", "token" }`

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "name": "John Doe",
  "organization_name": "Acme Corp",  // optional - creates org
  "invite_code": "abc123"             // optional - joins existing org
}
```

#### Google OAuth Session
```http
POST /api/auth/session
Content-Type: application/json

{ "session_id": "<session_id_from_oauth_redirect>" }
```

#### Current User
```http
GET /api/auth/me
```

---

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads. Params: `status`, `source` |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/{lead_id}` | Get single lead |
| PUT | `/api/leads/{lead_id}` | Update lead |
| DELETE | `/api/leads/{lead_id}` | Delete lead |
| POST | `/api/leads/import-csv` | Import from CSV (multipart/form-data) |
| POST | `/api/leads/{lead_id}/convert-to-contact` | Convert to contact. Param: `deal_id` |

#### Create Lead
```json
{
  "first_name": "John",       // required
  "last_name": "Doe",         // required
  "email": "john@acme.com",
  "phone": "+44123456789",
  "company": "Acme Corp",
  "job_title": "CTO",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "source": "manual"          // manual, csv_import, signup, affiliate:{code}, google_signup
}
```

**CSV columns**: `first_name, last_name, email, phone, company, job_title, linkedin_url, source`

---

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/{contact_id}` | Get single contact |
| PUT | `/api/contacts/{contact_id}` | Update contact |
| DELETE | `/api/contacts/{contact_id}` | Delete contact |
| POST | `/api/contacts/import-csv` | Import from CSV |

#### Create Contact
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@corp.com",
  "phone": "+44987654321",
  "company": "Corp Inc",
  "job_title": "VP Sales",
  "linkedin_url": "https://linkedin.com/in/janesmith",
  "website": "https://corp.com",
  "location": "London, UK",
  "industry": "Technology",
  "company_size": "51-200",
  "decision_maker": true,
  "budget": "€50,000",
  "timeline": "Q2 2026",
  "pain_points": "Manual lead tracking, no pipeline visibility",
  "preferred_contact_method": "email",
  "lead_id": "lead_xxx",      // if converted from lead
  "deal_id": "deal_xxx"       // linked deal
}
```

---

### Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List deals. Params: `stage`, `tag`, `assigned_to` |
| POST | `/api/deals` | Create deal |
| PUT | `/api/deals/{deal_id}` | Update deal |
| DELETE | `/api/deals/{deal_id}` | Delete deal |
| GET | `/api/deals/tags` | List all tags |

#### Create Deal
```json
{
  "name": "Enterprise License",
  "value": 50000,
  "currency": "EUR",
  "stage": "qualified",          // lead, qualified, proposal, negotiation, won, lost
  "probability": 60,             // 0-100
  "lead_id": "lead_xxx",        // optional link
  "contact_id": "contact_xxx",  // optional link
  "company_id": "company_xxx",  // optional link
  "expected_close_date": "2026-06-30T00:00:00Z",
  "tags": ["enterprise", "q2"],
  "notes": "Decision expected by end of month",
  "task_title": "Follow up call",        // creates initial task (required)
  "task_owner_id": "user_xxx",           // required
  "task_description": "Discuss pricing",
  "task_due_date": "2026-04-01T00:00:00Z"
}
```

> **Note**: Lost deals are excluded from pipeline value calculations.

---

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects (includes task_count, progress) |
| POST | `/api/projects` | Create project (auto-creates chat channel) |
| GET | `/api/projects/{project_id}` | Get project with tasks, deal, members |
| PUT | `/api/projects/{project_id}` | Update project |
| DELETE | `/api/projects/{project_id}` | Delete project (archives chat) |

#### Create Project
```json
{
  "name": "Q2 Enterprise Onboarding",
  "description": "Onboard Acme Corp to enterprise plan",
  "status": "active",           // active, on_hold, completed
  "deal_id": "deal_xxx",       // optional linked deal
  "members": ["user_xxx"]      // team member user_ids
}
```

**Response includes**: `project_id`, auto-created chat channel `proj_chat_{project_id}`

> Tasks linked to a project use `project_id` field in the task payload.

---

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks. Params: `status`, `assigned_to` |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{task_id}` | Update task |
| DELETE | `/api/tasks/{task_id}` | Delete task |

#### Create Task
```json
{
  "title": "Follow up with client",
  "description": "Discuss pricing options",
  "status": "todo",                // todo, in_progress, done
  "priority": "high",              // low, medium, high
  "due_date": "2026-04-01T10:00:00Z",
  "assigned_to": "user_xxx",
  "related_lead_id": "lead_xxx",
  "related_deal_id": "deal_xxx",
  "project_id": "proj_xxx"        // links task to project
}
```

---

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List companies |
| POST | `/api/companies` | Create company |
| GET | `/api/companies/{company_id}` | Get single company |

#### Create Company
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "size": "51-200",
  "description": "Enterprise SaaS company"
}
```

---

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/score-lead/{lead_id}` | AI score (1-100) |
| POST | `/api/ai/enrich-lead/{lead_id}` | AI enrichment (company, tech, interests) |
| POST | `/api/ai/draft-email` | AI email drafting |
| POST | `/api/ai/lead-summary/{lead_id}` | AI lead summary |
| GET | `/api/ai/search` | Smart search. Param: `q` |

#### Draft Email
```http
POST /api/ai/draft-email?lead_id=xxx&purpose=introduction&tone=professional
```
**Purposes**: `introduction`, `follow_up`, `proposal`, `check_in`, `meeting_request`, `thank_you`
**Tones**: `professional`, `friendly`, `casual`, `formal`
**Response**: `{ "subject", "content", "lead_name", "company_name", "purpose", "tone" }`

#### Enrich Lead Response
```json
{
  "lead_id": "lead_xxx",
  "enrichment": {
    "company_description": "...",
    "industry": "Technology",
    "company_size": "51-200",
    "website": "https://...",
    "technologies": ["React", "AWS", "PostgreSQL"],
    "interests": ["Sales automation", "AI"],
    "recommended_approach": "Lead with ROI data..."
  },
  "lead": { /* updated lead object */ }
}
```

---

### Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calls/initiate` | Make outbound call |
| GET | `/api/calls` | List calls. Param: `lead_id` |
| GET | `/api/calls/{call_id}` | Get call detail |
| POST | `/api/calls/{call_id}/analyze` | AI analysis |
| GET | `/api/calls/stats/overview` | Call statistics |
| POST | `/api/calls/schedule` | Schedule a call |
| GET | `/api/calls/scheduled` | List scheduled calls |
| GET | `/api/calls/scheduled/upcoming` | Next 7 days |
| PUT | `/api/calls/scheduled/{id}` | Update scheduled call |
| DELETE | `/api/calls/scheduled/{id}` | Cancel scheduled call |
| POST | `/api/calls/scheduled/check-reminders` | Trigger reminders |

#### Initiate Call
```json
{ "lead_id": "lead_xxx", "message": "Thanks for your interest" }
```

#### Schedule Call
```json
{
  "lead_id": "lead_xxx",
  "scheduled_at": "2026-04-01T14:00:00Z",
  "notes": "Discuss enterprise pricing",
  "reminder_minutes": 15       // 5, 15, 30, 60, 1440
}
```

#### Twilio Webhooks
| Endpoint | Purpose |
|----------|---------|
| `POST /api/webhooks/twilio/inbound` | Handle incoming calls |
| `POST /api/webhooks/twilio/call-status` | Call status updates |
| `POST /api/webhooks/twilio/recording-status` | Recording ready |

---

### Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/events` | All events (calls, tasks, deals, custom, Google) |
| POST | `/api/calendar/events` | Create custom event. Params: `title`, `date`, `notes`, `color` |
| DELETE | `/api/calendar/events/{event_id}` | Delete custom event |

#### Calendar Event Types
| Type | Source | Color |
|------|--------|-------|
| `call` | Scheduled calls | Purple `#A100FF` |
| `task` | Tasks with due dates | Amber `#f59e0b` (green if done) |
| `deal` | Deals with close dates | Indigo `#6366f1` |
| `event` | Custom events | Configurable |
| `google` | Google Calendar sync | Blue `#4285f4` |

---

### Google Calendar Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/google/auth-url` | Get Google OAuth consent URL |
| GET | `/api/auth/google/callback` | OAuth callback (automatic redirect) |
| GET | `/api/calendar/google/status` | Check if connected |
| GET | `/api/calendar/google/events` | Fetch Google Calendar events (30 days past, 90 days future) |
| DELETE | `/api/calendar/google/disconnect` | Disconnect Google Calendar |

#### Setup
1. Create OAuth 2.0 credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable **Google Calendar API**
3. Set authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`
4. Add to backend `.env`:
```env
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```
5. Users connect via **Calendar page → Connect Google** or **Settings → Integrations**

---

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/channels` | List channels (excludes archived) |
| POST | `/api/chat/channels` | Create channel |
| PUT | `/api/chat/channels/{id}/archive` | Archive channel (admin only) |
| GET | `/api/chat/channels/{id}/messages` | Get messages |
| POST | `/api/chat/messages` | Send message |
| PUT | `/api/chat/messages/{id}` | Edit message |
| DELETE | `/api/chat/messages/{id}` | Delete message |
| POST | `/api/chat/messages/{id}/react` | Toggle reaction |

**Channel types**: `general`, `lead`, `deal`, `project`

---

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/{id}/send` | Send via Resend or Kit.com |

---

### Bulk Operations

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/bulk/delete` | `{ "entity_type": "lead", "entity_ids": ["id1", "id2"] }` |
| POST | `/api/bulk/update` | `{ "entity_type": "lead", "entity_ids": [...], "updates": { "status": "contacted" } }` |
| POST | `/api/bulk/enrich` | `{ "entity_type": "lead", "entity_ids": [...] }` |
| POST | `/api/bulk/add-to-campaign` | `{ "campaign_id": "xxx", "entity_type": "lead", "entity_ids": [...] }` |

**Entity types**: `lead`, `contact`, `company`, `deal`

---

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/organizations` | Create org |
| GET | `/api/organizations/current` | Get current user's org |
| GET | `/api/organizations/{id}/members` | List members |
| PUT | `/api/organizations/settings` | Update org settings |
| POST | `/api/invites/link` | Generate invite link |
| POST | `/api/invites/email` | Send email invites |
| POST | `/api/invites/csv` | Import invites via CSV |

---

### Admin (Super Admin / Deputy Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/{id}/role` | Change user role |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/organizations` | All organizations |
| PUT | `/api/admin/organizations/{id}` | Edit org (name, plan, max_users, email_domain) |
| DELETE | `/api/admin/organizations/{id}` | Delete organization |
| GET | `/api/admin/analytics/users` | User analytics with org data |
| GET | `/api/admin/contact-requests` | Support requests |
| PUT | `/api/admin/contact-requests/{id}/status` | Update support status |
| GET | `/api/admin/discount-codes` | List discount codes |
| POST | `/api/admin/discount-codes` | Create discount code |
| GET | `/api/admin/affiliates` | List affiliates |
| GET | `/api/admin/data-explorer` | List collections |
| GET | `/api/admin/data-explorer/{collection}` | Browse collection |

#### Edit Organization (License Override)
```http
PUT /api/admin/organizations/{org_id}
Content-Type: application/json

{ "max_users": 50, "plan": "enterprise", "email_domain": "acme.com" }
```

---

## External API (v1)

For **n8n**, **Notion**, **Zapier**, and custom integrations.

### Authentication

```
X-API-Key: earnrm_your_key_here
```
or
```
Authorization: Bearer earnrm_your_key_here
```

Generate keys at **Settings → API & Webhooks**.

### Endpoints

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/leads` | `limit`, `status` | List leads |
| POST | `/api/v1/leads` | — | Create lead (same payload as internal) |
| GET | `/api/v1/contacts` | `limit` | List contacts |
| GET | `/api/v1/deals` | `limit`, `stage` | List deals |
| GET | `/api/v1/companies` | `limit` | List companies |
| GET | `/api/v1/tasks` | `limit`, `status` | List tasks |
| POST | `/api/v1/tasks` | — | Create task |
| POST | `/api/v1/notion/sync` | `entity_type` | Notion-formatted export |
| GET | `/api/v1/docs` | — | API documentation |

### Example: Fetch Leads
```bash
curl -H "X-API-Key: earnrm_abc123..." \
  "https://earnrm.com/api/v1/leads?limit=10&status=qualified"
```

### Example: Create Lead via API
```bash
curl -X POST -H "X-API-Key: earnrm_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane@corp.com","company":"Corp Inc"}' \
  "https://earnrm.com/api/v1/leads"
```

---

## Webhooks

Register webhook URLs to receive real-time event notifications.

### Register
```http
POST /api/webhooks?url=https://your-server.com/hook&events=lead.created&events=deal.stage_changed&name=My+Hook
Authorization: Bearer <token>
```

### Events
| Event | Trigger |
|-------|---------|
| `lead.created` | New lead added |
| `lead.updated` | Lead modified |
| `deal.created` | New deal created |
| `deal.stage_changed` | Deal moved to new stage |
| `contact.created` | New contact added |
| `task.created` | New task created |

### Payload Format
```json
{
  "event": "lead.created",
  "data": { "lead_id": "lead_xxx", "first_name": "John", "email": "john@acme.com", ... },
  "timestamp": "2026-03-23T12:00:00Z"
}
```

### Manage Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks` | List registered webhooks |
| POST | `/api/webhooks` | Register new webhook |
| DELETE | `/api/webhooks/{id}` | Remove webhook |

---

## Integrations

### n8n.io
1. Generate API key at **Settings → API & Webhooks**
2. Use **HTTP Request** node: `GET https://earnrm.com/api/v1/leads`
3. Set header: `X-API-Key: earnrm_your_key`
4. For triggers: Register webhook → use n8n **Webhook Trigger** node URL

### Notion
```bash
POST /api/v1/notion/sync?entity_type=leads
X-API-Key: earnrm_your_key
```
Returns data formatted for Notion database API.

### Resend
Primary email service. Configure `RESEND_API_KEY` and `SENDER_EMAIL` in backend `.env`.

### Google Calendar
Two-way calendar sync. Configure in [Google Cloud Console](https://console.cloud.google.com):
1. Enable **Google Calendar API**
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add redirect URI: `https://yourdomain.com/api/auth/google/callback`
4. Add to backend `.env`:
```env
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```
Users connect via **Calendar page → Connect Google** button.

### Twilio
Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM` in backend `.env`.
Set inbound webhook: `https://yourdomain.com/api/webhooks/twilio/inbound`

### Stripe
Configure `STRIPE_API_KEY` in backend `.env`.

---

## API Keys

### Generate
```http
POST /api/api-keys?name=my_integration
Authorization: Bearer <token>

Response: { "key": "earnrm_abc123...", "key_id": "key_xxx" }
```
> Save the key immediately — it won't be shown again.

### List
```http
GET /api/api-keys
```

### Revoke
```http
DELETE /api/api-keys/{key_id}
```

---

## Roles & Permissions

| Role | Scope |
|------|-------|
| `super_admin` | Full platform access, Data Explorer, delete users/orgs, discount codes, license override |
| `deputy_admin` | Same as super_admin |
| `support` | View & manage support requests |
| `owner` | Full org access, manage members, billing |
| `admin` | Org management, archive channels, pipeline visibility |
| `member` | Own leads, deals, tasks, contacts |

---

## Database Collections

| Collection | Description |
|-----------|-------------|
| `users` | User accounts with roles and last_login |
| `organizations` | Multi-tenant orgs with license limits and email_domain |
| `leads` | Sales leads with AI scoring & enrichment |
| `contacts` | Converted leads with sales profiles |
| `deals` | Pipeline deals with stage tracking |
| `tasks` | Team tasks with project linking |
| `projects` | Multi-task projects linked to deals |
| `companies` | Target companies |
| `campaigns` | Email campaigns |
| `calls` | Call logs (inbound & outbound) |
| `scheduled_calls` | Scheduled call reminders |
| `chat_channels` | Team chat channels (general, lead, deal, project) |
| `messages` | Chat messages with reactions |
| `api_keys` | External API keys (bcrypt hashed) |
| `webhooks` | Registered webhook endpoints |
| `affiliates` | Affiliate program members |
| `affiliate_referrals` | Referral tracking |
| `discount_codes` | Promotional codes |
| `invoices` | Payment invoices |
| `payment_transactions` | Stripe transactions |
| `contact_requests` | Support form submissions |
| `notifications` | User notifications |
| `calendar_events` | Custom calendar events |
| `google_calendar_tokens` | Google OAuth tokens for Calendar sync |
| `google_calendar_states` | OAuth state verification |

---

## License

Proprietary — earnrm by Finerty Ltd. All rights reserved.

Canbury Works, Units 6 and 7, Canbury Business Park, Elm Crescent, Kingston upon Thames, Surrey, KT2 6HJ, UK
