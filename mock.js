/* Mock layer — powers the public shareable demo when no backend is present.
   Uses a FICTIONAL agency/repo (no real client data) with a realistic social-app scenario. */
(function () {
  function agents() {
    return [
      { mono: 'P', name: 'Planner', color: '#4f46e5', desc: 'Judges buildability, writes the plan + definition of done.', enabled: true, locked: true },
      { mono: 'I', name: 'Implementer', color: '#2563eb', desc: 'Writes code + tests on a feature branch.', enabled: true },
      { mono: 'T', name: 'Test gate', color: '#0a8f5b', desc: 'Runs the suite. Hard pass/fail — never "makes it pass".', enabled: true },
      { mono: 'R', name: 'Reviewer', color: '#b45309', desc: 'Adversarial diff review with fresh context.', enabled: true },
      { mono: 'S', name: 'Security reviewer', color: '#7c3aed', desc: 'Threat-models changes on sensitive paths.', enabled: true }
    ];
  }
  var T = Date.now();
  var state = {
    workspace: { name: 'Acme Digital', type: 'Agency' },
    setupComplete: true, setupStep: 7,
    github: { connected: true, account: 'acme-digital', orgs: ['acme-digital'] },
    slack: { connected: true, channel: '#eng' },
    model: { provider: 'Claude Code', ready: true },
    project: { repo: 'acme-digital/connect-app', owner: 'acme-digital', name: 'connect-app', branch: 'main', language: 'TypeScript', clonedAt: T },
    context: {
      deriving: false, ready: true,
      stack: 'Vite + React + TypeScript, shadcn/ui, Tailwind, Supabase (auth + Postgres + RLS), TanStack Query',
      testCmd: 'npm run lint && npx vitest run',
      sensitive: 'src/components/AuthProvider.tsx, supabase/**, anything touching auth, profiles, messages',
      conventions: 'shadcn/ui in src/components/ui, pages in src/pages, Supabase client in src/integrations; PRs target main.',
      summary: 'A social discovery app: users create a profile, browse and connect with others, send connection requests, and chat. Vite + React + TS front end on a Supabase backend (auth, Postgres, RLS).'
    },
    gate: { requireHumanMerge: true, strictness: 'Balanced', writeEnabled: false },
    agents: agents(),
    secrets: [
      { name: 'VITE_SUPABASE_URL', masked: '••••••••', addedAt: T },
      { name: 'VITE_SUPABASE_ANON_KEY', masked: '••••••••', addedAt: T }
    ],
    tickets: [],
    mode: 'demo'
  };

  var heroStages = [
    { key: 'planner', name: 'Planner', mono: 'P', color: '#4f46e5', verdict: 'BUILDABLE', durationMs: 96000, costUsd: 0.21, cardStatus: 'planning',
      body: "Buildable. The app already has Supabase auth (`src/components/AuthProvider.tsx`), a profile surface (`src/components/ProfileCard.tsx`), and a migrations folder (`supabase/migrations/`). There is **no** `reports` table or admin role yet, so this adds one table + a small dialog.\n\n**Plan**\n1. New migration `supabase/migrations/<ts>_user_reports.sql` — `user_reports(id, reporter_id, reported_user_id, reason, details, status default 'open', created_at)` + RLS.\n2. `src/components/ReportUserDialog.tsx` — shadcn `Dialog` + reason `Select` + details `Textarea`.\n3. Wire a \"Report\" item into the `ProfileCard` overflow menu.\n4. `src/hooks/useReportUser.ts` — wraps the Supabase insert + toast.\n\n**Definition of done**\n- [ ] Report control appears on the profile card\n- [ ] Submitting writes a row to `user_reports` via Supabase\n- [ ] A reason is captured (enum) + optional details\n- [ ] Duplicate submit within 60s is blocked client-side\n\n**Files likely to change**\n`ProfileCard.tsx`, new `ReportUserDialog.tsx`, new migration, new `useReportUser.ts`\n\n**Risks**\n- RLS must prevent a reporter from reading others' reports.\n- Keep scope to user reports only (no moderation queue in v1)." },
    { key: 'impl', name: 'Implementer', mono: 'I', color: '#2563eb', verdict: 'READY', durationMs: 168000, costUsd: 0.44, cardStatus: 'in_progress',
      body: "Implemented on `feat/report-user` (design mode — not committed).\n\n**`supabase/migrations/<ts>_user_reports.sql`** (new)\n```sql\ncreate table public.user_reports (\n  id uuid primary key default gen_random_uuid(),\n  reporter_id uuid not null references auth.users(id),\n  reported_user_id uuid not null references auth.users(id),\n  reason text not null,\n  details text,\n  status text not null default 'open',\n  created_at timestamptz not null default now()\n);\nalter table public.user_reports enable row level security;\ncreate policy \"insert own report\" on public.user_reports\n  for insert with check (auth.uid() = reporter_id);\ncreate policy \"read own reports\" on public.user_reports\n  for select using (auth.uid() = reporter_id);\n```\n\n**`src/hooks/useReportUser.ts`** (new)\n```ts\nexport function useReportUser() {\n  const { user } = useAuth();\n  return async (reportedId: string, reason: string, details?: string) => {\n    const { error } = await supabase.from('user_reports').insert({\n      reporter_id: user.id, reported_user_id: reportedId, reason, details,\n    });\n    if (error) throw error;\n  };\n}\n```\n\n**`src/components/ProfileCard.tsx`** — add an overflow `DropdownMenuItem` that opens `ReportUserDialog`.\n\n**Tests added:** `src/components/__tests__/ReportUserDialog.test.tsx` (renders, requires reason, calls insert once, blocks double-submit)." },
    { key: 'test', name: 'Test gate', mono: 'T', color: '#0a8f5b', verdict: 'PASS', durationMs: 54000, costUsd: 0.12, cardStatus: 'test_gate',
      body: "**Command:** `npm run lint && npx vitest run`\n\nThe change is unit-testable to green. Component tests colocate under `__tests__`.\n\n**New test cases**\n- renders the dialog from the profile card menu\n- submit disabled until a reason is selected\n- calls `supabase.insert` exactly once on submit (mock client)\n- double-click within 60s does not insert twice\n- error toast on insert failure" },
    { key: 'review', name: 'Reviewer', mono: 'R', color: '#b45309', verdict: 'APPROVE (round 2)', durationMs: 78000, costUsd: 0.17, cardStatus: 'in_progress',
      body: "**Round 1 — REQUEST_CHANGES:** the insert path didn't constrain `reported_user_id` to a distinct user — a client could report themselves or a non-existent id. Add `check (reported_user_id <> reporter_id)`.\n\n**Round 2 — APPROVE:** constraint added; duplicate-submit guard is client-side only (acceptable for v1, flagged for a follow-up DB unique index on `(reporter_id, reported_user_id, date_trunc('minute', created_at))`). Scope is clean, no unrelated edits." },
    { key: 'security', name: 'Security reviewer', mono: 'S', color: '#7c3aed', verdict: 'APPROVE · NOTE', durationMs: 61000, costUsd: 0.14, cardStatus: 'in_progress',
      body: "Touches a sensitive surface (`supabase/**`, user data). Threat model:\n\n- ✅ RLS enabled; insert restricted to `auth.uid() = reporter_id`; select restricted to own rows.\n- ✅ No service-role key in client; uses the anon key + RLS (correct for this app).\n- ✅ No new network egress; no secrets in code or logs.\n- ⚠️ **Note for human:** reports are write-only for users with no moderation surface yet — confirm that's intended for v1. Consider basic server-side rate-limiting to prevent report spam." },
    { key: 'pr', name: 'Pull request', mono: '↗', color: '#0b0c0e', verdict: 'AWAITING REVIEW', cardStatus: 'review',
      body: "**Branch:** `feat/report-user` → `main`\n\n**✅ Proposed:** Add a Report-user action to the profile card (dialog + `user_reports` table with RLS + insert hook + tests).\n\n**➡️ Next action:** Human review → enable write mode to open a draft PR on `acme-digital/connect-app` → merge after review. Confirm the v1 no-moderation-queue decision." }
  ];

  function ticket(id, ref, status, priority, title, fields) {
    return Object.assign({ id: id, ref: ref, status: status, priority: priority, title: title, runnable: status === 'inbox' || status === 'planning', run: null }, fields);
  }
  state.tickets = [
    ticket('hero', 'APP-142', 'inbox', 'high', 'Add a Report-user action to the profile card', {
      problem: 'Users cannot report another user. Add a "Report" action on the profile card that records a report (reporter, reported user, reason, timestamp) to Supabase.',
      located: 'Frontend profile card + a new Supabase table.',
      attempted: 'None yet — verify the schema does not already have a reports table.',
      success: 'A Report control appears on the profile card; submitting writes a row to a user_reports table via Supabase with RLS; a reason is captured; no duplicate spam within a short window.',
      info: 'Keep scope to user reports only (no moderation queue in v1).'
    }),
    ticket('done1', 'APP-138', 'done', 'medium', 'Fix connection request not clearing after accept', {
      problem: 'Accepted connection requests stayed in the Requests list until refresh.', located: 'src/pages/Requests.tsx', success: 'Accepting a request removes it from the list optimistically and on refetch.',
      done: { pr: 138, fixed: 'Invalidate the requests query on accept and drop the row optimistically.', ai: '22m', human: '4m' }
    }),
    ticket('rev1', 'APP-134', 'review', 'high', 'Rate-limit profile likes to prevent spam', {
      problem: 'No limit on like/pass actions; a script can spam interactions.', located: 'src/pages/Home.tsx + interactions insert', success: '30 interactions / 5 min per user; gentle UI message on limit.',
      pr: { num: 135, base: 'main', title: 'Rate-limit interaction inserts (30 / 5 min)', fixed: 'Sliding-window guard on the like/pass mutation; toast on limit.', next: 'Human review → merge to main.' }
    }),
    ticket('wip1', 'APP-130', 'in_progress', 'low', 'Show last-active time on the profile card', {
      problem: 'Profile cards do not show how recently a user was active.', located: 'src/components/ProfileCard.tsx', success: 'Each card shows a relative last-active time.', stage: 'Implementer is writing code — 2 of 5 stages complete.'
    })
  ];

  window.MOCK = { state: state, heroStages: heroStages };
})();
