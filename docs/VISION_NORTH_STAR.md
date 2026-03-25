# Git Mind North Star

## Queryable Repository Meaning With Receipts

---

## 1) North Star Statement

Git Mind is a Git-native semantic intelligence layer for software repositories.

It should let a human or agent point at a repository and obtain useful, reviewable, provenance-backed knowledge about how code, docs, ADRs, tasks, reviews, issues, commits, and other project artifacts relate over time.

The system should make repository meaning explicit without requiring an external database or heavy manual curation before value appears.

---

## 2) Identity

**Git Mind is:**

- a repo-semantic inference and association engine
- a provenance-aware graph substrate
- a query surface over repository meaning
- a review loop for inferred semantic relationships
- a deterministic contract layer for humans and agents

**Git Mind is not:**

- a personal thought-capture tool
- a reflective dialogue product
- a manually maintained project wiki
- a generic note app
- a provenance demo without a concrete repository job to do

---

## 3) Core Product Thesis

Repository understanding is usually reconstructed from:

- file layout
- grep
- issue links
- commit history
- naming conventions
- memory

Git stores history well, but not the semantic structure of a project.

Git Mind should close that gap by:

1. ingesting repository artifacts
2. inferring entities and relationships
3. surfacing high-value semantic views and answers
4. attaching provenance and confidence to what it claims
5. letting humans and agents review and refine the map over time

If Git Mind cannot provide useful understanding of a repository with low setup and low ongoing manual effort, it is not doing its job.

---

## 4) Platform Model

### 4.1 Substrate

Git + WARP provide:

- causal history
- deterministic replay
- mergeable graph state
- time-scoped materialization
- provenance-carrying mutation history

### 4.2 Git Mind Core

Git Mind adds:

- artifact ingestion
- entity extraction
- relationship inference
- query and view surfaces
- reviewable suggestion flows
- semantic diff and historical replay

### 4.3 Supporting Layers

These remain important, but they are supporting layers, not the center of the product story:

- graph-backed authored content
- extension/runtime machinery
- materialization
- trust-aware operations

They matter when they make repo understanding and workflow adoption better.

---

## 5) Primary Product Promise

The strongest promise Git Mind can make is:

> Point me at a repository and help me understand what matters, how it connects, and how it evolved.

That promise should be testable through questions like:

- what implements this spec?
- what ADR explains this area?
- what tasks and reviews shaped this code path?
- what changed semantically between these commits?
- where are the missing or weakly connected parts of the project knowledge graph?

---

## 6) Key Capabilities

### A) Low-Input Semantic Bootstrap

Ingest repository artifacts and produce a useful first-pass semantic map without expecting users to hand-author everything.

### B) Queryable Semantic Answers

Let humans and agents ask repository questions and receive provenance-backed answers with visible confidence.

### C) Reviewable Inference

Inferred structure should be reviewable, refinable, and capable of improving over time without requiring users to build the map from scratch.

### D) Historical Replay

The system should support semantic diff and time-aware inspection so repository meaning can be examined across change, not just at the latest state.

### E) Agent-Native Contracts

Machine-readable interfaces should make Git Mind useful as a contract boundary for autonomous agents, not just a human-facing dashboard.

---

## 7) Adoption Rule

Git Mind should not ask users to become graph curators before it becomes useful.

Adoption depends on three things:

1. low setup
2. immediate semantic value
3. trustworthy receipts

If it behaves like a project wiki with extra steps, it will fail.

---

## 8) Boundary With Think

This boundary should remain explicit.

`think` owns:

- personal capture
- re-entry
- reflection dialogue
- x-ray over a person's own evolving thought

Git Mind owns:

- semantic extraction from repository artifacts
- repository-scoped relationship inference
- provenance and replay over project meaning
- queryable repository intelligence

---

## 9) Strategic Consequence

The next meaningful hill for Git Mind is not more platform breadth.

It is proving that low-input semantic bootstrap and provenance-backed repository querying are genuinely useful on real repositories.

Everything else should be judged by whether it helps that hill land.
