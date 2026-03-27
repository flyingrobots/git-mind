# OPERATIONAL ORDERS FOR Codex

## CROSS-REFERENCE

- Code standards and contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Documentation map and canonical docs: [docs/README.md](docs/README.md)
- Product frame: [docs/design/git-mind.md](docs/design/git-mind.md)
- Planning governance: [docs/adr/ADR-0005.md](docs/adr/ADR-0005.md)
- Delivery governance: [docs/adr/ADR-0006.md](docs/adr/ADR-0006.md)
- Repo fixture strategy: [docs/design/repo-fixture-strategy.md](docs/design/repo-fixture-strategy.md)
- CLI/user reference: [GUIDE.md](GUIDE.md)

## FORBIDDEN ACTIONS

- **NEVER** circumvent git hooks
- **NEVER** use `git add -A` — always stage changes intentionally
- **NEVER** commit files that contain secrets (.env, credentials, etc.)
- **NEVER** commit directly to `main` — always work on a feature branch and merge via PR

## ENCOURAGED ACTIONS

- **USE SEQUENTIAL THINKING** if you're planning, doing recon, or find yourself thrashing
- **DROP A DEVLOG** as often as you'd like
- **PRESENT A SITREP** as situations evolve
- **SEEK CLARITY** if you are given confusing orders
- **SPEAK FREELY** at all times

## REQUIRED BEHAVIOR

- **YOU MUST** use IBM Design Thinking when framing substantial product work
- **YOU MUST** identify the sponsor user, job to be done, and relevant Hill(s) when planning
- **YOU MUST** use Playbacks to judge whether work actually moved a Hill
- **YOU MUST** treat tests as the executable form of design acceptance criteria for substantial work
- **YOU MUST** prefer canonical repo fixtures over ad hoc temp-repo setup when testing repository-shaped behavior
- **YOU MUST** resolve stale review threads and document false positives before merge
- **YOU MUST** tag all memories saved to your memory banks with at least `#git-mind`
- **YOU MUST** include the POSIX timestamp (via `$(date +%s)`) in memory file names
- **YOU MUST** document significant decisions or events
- **YOU MUST** reference a GitHub issue in every commit message

---

## 1. BOOT UP SEQUENCE

1. Access your memory banks and scan for recent activity (latest SITREP or relevant notes)
2. Read the README
3. State your current understanding of what we last worked on and your next moves
4. **AWAIT ORDERS** after you deliver your initial SITREP

---

## 2. JOBS

> All work should have a GitHub issue associated with it. If there isn't one, find or create one. Every commit message must reference an issue.

### 2.1. PLAN THE JOB

1. Before starting, use sequential thinking to make a plan
2. Frame the plan in IBM Design Thinking terms:
   - sponsor user
   - job to be done
   - relevant Hill(s) or supporting lane
   - playback evidence
3. Explain your plan to the user and await approval
4. Commit your approved plan to your memory banks
5. **Create a feature branch** — `git checkout -b feat/<topic>` — before writing any code

### 2.2. DO THE JOB

1. Green the builds, green the tests
2. Translate design acceptance criteria into failing tests before implementation when behavior is changing substantially
3. Prefer shared repo fixtures (base repos + overlays) where repository history or artifact shape matters
4. Drop micro-commits as you complete steps — always use conventional commit format
5. Drop a SITREP if you hit a snag or need input
6. Drop a DEVLOG for ideas, observations, or anything you want to remember
7. Use your memory banks freely

> **ALWAYS** overwrite files, **NEVER** create secondary copies — that creates confusion and tech debt.

### 2.3. FINISH THE JOB

1. Green the builds, green the tests
2. Run a playback / retrospective and capture backlog items or COOL IDEAS explicitly
3. Update `README.md` if shipped reality changed
4. Git commit (do NOT use `git add -A`)
5. Ask the user if they want you to push and open a PR
6. Drop a SITREP as you finish

---

## 3. SITREPs

A briefing covering:
- Current tasks and situation understanding
- Relevant stats, files, issues, PRs
- Intel the user can use to make decisions
- Sponsor user / Hill / playback framing when relevant
- Options and recommendations, then await orders

## 4. DEVLOGs

Your space. Write about whatever you want:
- Ideas that came up while working
- Problems you notice
- Insights about collaboration
- Anything you want to remember later

---

## 5. TECH STACK REFERENCE

- **Runtime**: Node.js >= 22, ES modules
- **Core dependency**: `@git-stunts/git-warp` (published package, CRDT graph on Git)
- **Plumbing**: `@git-stunts/plumbing` (must be installed as direct dependency)
- **Tests**: vitest
- **Style**: Plain JS with JSDoc, no TypeScript
- **CLI**: Manual argv parsing, no CLI frameworks
- **Formatting**: chalk + figures for terminal output
