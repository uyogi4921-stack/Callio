# Callio - Product Architecture

## Overview
Callio is an AI-powered accountability app for procrastinators. Voice-first task capture, smart reminders, simulated accountability calls, and private journaling.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | Claude API (Anthropic) |
| Voice Input | Web Speech API (browser-native) |
| Voice Output | Web Speech Synthesis API |
| Call Simulation | In-app modal with TTS |
| State | React Context + Supabase Realtime |
| Deployment | Vercel |

---

## 2. Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, from Supabase Auth |
| name | text | Display name |
| email | text | Unique |
| avatar_url | text | Profile image |
| timezone | text | For reminder scheduling |
| plan | enum | 'free' / 'premium' |
| created_at | timestamptz | |

### `tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users |
| title | text | Task name |
| description | text | Optional details |
| status | enum | 'pending' / 'in_progress' / 'done' / 'overdue' |
| priority | enum | 'low' / 'medium' / 'high' / 'urgent' |
| due_date | timestamptz | When it's due |
| completed_at | timestamptz | When marked done |
| source | enum | 'voice' / 'text' / 'ai_extracted' |
| created_at | timestamptz | |

### `reminders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| task_id | uuid | FK -> tasks |
| user_id | uuid | FK -> users |
| remind_at | timestamptz | Scheduled time |
| type | enum | 'push' / 'call' / 'in_app' |
| status | enum | 'pending' / 'sent' / 'dismissed' |
| created_at | timestamptz | |

### `accountability_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users |
| task_id | uuid | FK -> tasks |
| question | text | What Callio asked |
| response | text | User's answer |
| reason_not_done | text | Why it wasn't completed |
| mood | enum | 'motivated' / 'neutral' / 'struggling' |
| created_at | timestamptz | |

### `journal_entries`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users |
| content | text | Encrypted journal text |
| mood | enum | Optional mood tag |
| source | enum | 'voice' / 'text' |
| is_private | boolean | Always true, enforced |
| created_at | timestamptz | |

### `daily_plans`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users |
| date | date | The plan date |
| plan_text | text | "What's your plan for today?" response |
| tasks_planned | uuid[] | Task IDs planned for today |
| created_at | timestamptz | |

---

## 3. Main User Flows

### Flow 1: Morning Check-in
```
User opens app
  -> Callio greets: "Hey [name], what's your plan for today?"
  -> User speaks/types tasks
  -> Claude extracts individual tasks
  -> Tasks saved with due dates
  -> Daily plan created
```

### Flow 2: Voice Task Capture (anytime)
```
User taps mic button
  -> Speaks task(s)
  -> Web Speech API transcribes
  -> Claude parses into structured task(s)
  -> User confirms/edits
  -> Tasks saved
```

### Flow 3: Accountability Call (overdue task)
```
Task passes due date
  -> Reminder triggered (in-app notification)
  -> If still not done after grace period
  -> Simulated "call" modal appears
  -> TTS voice: "Hey [name], your task [title] is overdue. What happened?"
  -> User responds via voice/text
  -> If not done: "What stopped you?" -> stores reason
  -> If done: marks complete, celebrates
  -> Log saved to accountability_logs
```

### Flow 4: Journal Entry
```
User navigates to Journal
  -> Taps "New Entry"
  -> Speaks or types reflection
  -> Optional mood tag
  -> Saved privately
  -> Never shared, never used in accountability
```

### Flow 5: Task Management
```
User views task list
  -> Filter by: all / today / overdue / done
  -> Tap task to edit/complete/delete
  -> Swipe to mark done (mobile)
  -> Progress stats visible
```

---

## 4. Screen List

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 1 | Splash / Landing | `/` | App intro, sign up CTA |
| 2 | Auth | `/auth` | Login / Sign up |
| 3 | Dashboard | `/dashboard` | Today's plan, stats, quick actions |
| 4 | Tasks | `/tasks` | Full task list with filters |
| 5 | Voice Input | Modal overlay | Mic button, live transcript |
| 6 | Task Detail | `/tasks/[id]` | Single task view/edit |
| 7 | Accountability Call | Modal overlay | Simulated call screen |
| 8 | Journal | `/journal` | Journal entries list |
| 9 | New Journal Entry | `/journal/new` | Voice/text entry |
| 10 | Profile / Settings | `/settings` | Name, timezone, theme, plan |
| 11 | Streak / Progress | `/progress` | Completion stats, streaks |

---

## 5. API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register (handled by Supabase) |
| POST | `/api/auth/login` | Login (handled by Supabase) |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List user's tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Delete task |
| POST | `/api/tasks/extract` | Send voice transcript -> Claude extracts tasks |

### Accountability
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/accountability/overdue` | Get overdue tasks for call |
| POST | `/api/accountability/log` | Save accountability conversation |
| POST | `/api/accountability/checkin` | Morning check-in flow |

### Journal
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/journal` | List journal entries |
| POST | `/api/journal` | Create entry |
| DELETE | `/api/journal/[id]` | Delete entry |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/extract-tasks` | Parse voice/text into tasks |
| POST | `/api/ai/accountability` | Generate accountability questions |
| POST | `/api/ai/daily-greeting` | Generate personalized greeting |

### Daily Plan
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/plan/today` | Get today's plan |
| POST | `/api/plan/today` | Save today's plan |

---

## 6. Reminder / Call Flow

```
                    Task Created (with due_date)
                            |
                            v
                    +-----------------+
                    | Schedule Reminder|
                    | (30 min before)  |
                    +-----------------+
                            |
                            v
                    +-----------------+
                    | In-App Toast     |
                    | "Task X due soon"|
                    +-----------------+
                            |
                     (task still pending after due_date)
                            |
                            v
                    +-----------------+
                    | Grace Period     |
                    | (15 min)         |
                    +-----------------+
                            |
                     (still not done)
                            |
                            v
                    +----------------------+
                    | ACCOUNTABILITY CALL   |
                    | (Simulated Modal)     |
                    |                      |
                    | Ring animation       |
                    | "Incoming call from  |
                    |  Callio..."          |
                    |                      |
                    | User answers:        |
                    | -> TTS greeting      |
                    | -> "What happened    |
                    |    with [task]?"     |
                    | -> User responds     |
                    | -> AI follow-up      |
                    | -> Log saved         |
                    +----------------------+
```

### Call Simulation UI
- Full-screen modal with dark overlay
- Phone ring animation + sound
- "Answer" / "Snooze" buttons
- Once answered: conversation interface
- TTS speaks the accountability question
- User responds via mic or text
- AI processes response and follows up
- Conversation logged

---

## 7. Journal Flow

```
Journal Screen
    |
    +-- List of past entries (date, mood, preview)
    |
    +-- "New Entry" FAB
            |
            v
        +------------------+
        | Voice or Text?   |
        | [Mic] [Keyboard] |
        +------------------+
            |
            v
        +------------------+
        | Record/Type      |
        | entry content    |
        +------------------+
            |
            v
        +------------------+
        | Tag mood?        |
        | (optional)       |
        +------------------+
            |
            v
        +------------------+
        | Save privately   |
        | (encrypted, RLS) |
        +------------------+
```

### Privacy guarantees:
- Supabase RLS: users can only read their own entries
- Journal data never sent to AI endpoints
- No journal data in accountability flows
- Optional: client-side encryption before storage

---

## 8. MVP Build Plan (48-Hour Hackathon)

### Hour 0-4: Foundation
- [x] Next.js + Tailwind + Supabase scaffold
- [x] Auth flow (email signup/login)
- [x] Database schema deployed
- [x] Dark/light mode toggle

### Hour 4-10: Core Task Loop
- [ ] Dashboard with greeting
- [ ] Voice input (Web Speech API)
- [ ] Claude task extraction
- [ ] Task CRUD UI
- [ ] Task list with filters

### Hour 10-16: The Money Feature - Accountability Calls
- [ ] Overdue task detection
- [ ] Call simulation modal (ring animation, TTS)
- [ ] Accountability conversation (Claude-powered)
- [ ] Response logging
- [ ] "Why wasn't it done?" flow

### Hour 16-22: Journal + Polish
- [ ] Journal entry (voice + text)
- [ ] Journal list view
- [ ] Mood tagging
- [ ] Streak/progress stats

### Hour 22-30: UX Polish
- [ ] Animations (Framer Motion)
- [ ] Responsive design (mobile-first)
- [ ] Loading states, error handling
- [ ] Sound effects for call

### Hour 30-36: Demo Prep
- [ ] Seed demo data
- [ ] Happy path walkthrough
- [ ] Edge case fixes
- [ ] Performance pass

### Hour 36-48: Buffer
- [ ] Bug fixes
- [ ] Final polish
- [ ] Deploy to Vercel
- [ ] Demo recording

---

## 9. Implementation Order

| Phase | Feature | Priority | Effort |
|-------|---------|----------|--------|
| 1 | Project setup + auth | P0 | 2h |
| 2 | Dashboard + greeting | P0 | 2h |
| 3 | Voice input + task extraction | P0 | 4h |
| 4 | Task CRUD + list | P0 | 3h |
| 5 | Accountability call simulation | P0 | 4h |
| 6 | Reminder/overdue detection | P1 | 2h |
| 7 | Journal (voice + text) | P1 | 3h |
| 8 | Progress/streaks | P2 | 2h |
| 9 | Dark/light mode polish | P2 | 1h |
| 10 | Responsive + animations | P2 | 3h |

---

## 10. Freemium Split

### Free (70%)
- Voice task capture (unlimited)
- Up to 20 active tasks
- Daily check-in greeting
- Basic accountability calls (3/day)
- Journal (5 entries/month)
- Light/dark mode
- Basic progress stats

### Premium ($9.99/mo)
- Unlimited tasks
- Unlimited accountability calls
- Unlimited journal entries
- Advanced AI insights ("You tend to procrastinate on X")
- Custom reminder schedules
- Priority support
- Export data
- Team accountability (future)

---

## 11. Key Technical Decisions

1. **No real phone calls in MVP** - Simulated in-app calls with TTS. Feels premium without Twilio complexity.
2. **Web Speech API** - Browser-native, zero cost, works well on Chrome/Edge. Fallback to text.
3. **Claude for intelligence** - Task extraction, accountability conversations, greeting personalization.
4. **Supabase RLS** - Row-level security for journal privacy. No backend needed for auth.
5. **App Router** - Next.js 14 app router for modern patterns, server components where possible.
6. **No WebSocket** - Supabase Realtime for live updates if needed, but polling is fine for MVP.
