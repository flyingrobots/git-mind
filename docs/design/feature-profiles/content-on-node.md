# Feature Profile: Content On Node

Status: active supporting-lane profile

Related:

- [Git Mind Product Frame](../git-mind.md)
- [CLI Contracts](../../contracts/CLI_CONTRACTS.md)

## IBM Design Thinking Frame

Sponsor user:

- A maintainer or agent attaching source material, notes, or generated evidence
  to graph nodes.

Job to be done:

- When a node needs attached content, store and retrieve that content through
  Git-backed graph semantics with metadata.

Lane:

- Supporting lane: content.

Playback evidence:

- A user can attach content to a node, inspect metadata, retrieve raw content,
  and delete it with JSON contracts.

## User Stories

- As a maintainer, I can attach a design excerpt or supporting file to a node.
- As an agent, I can read content metadata before fetching full content.
- As a user, I can delete attached content without deleting the node.

## Requirements

### Functional

- `content set` attaches file content to an existing node.
- `content show` retrieves content.
- `content meta` reports content state and metadata.
- `content delete` removes content metadata and blob reference.
- JSON output must validate against content schemas.

### Non-Functional

- Missing node and missing content errors must be distinct.
- Large content limits and warnings need explicit policy.
- Binary content support needs explicit encoding policy before expansion.

## Test Plan

Fixtures:

- `content-basic`
- `content-large`
- `content-binary`
- `content-missing-node`

Golden path:

- Attach text content from file.
- Show raw and metadata-wrapped content.
- Metadata includes MIME, size, hash, and presence.
- Delete removes content and is idempotent where specified.

Edge cases:

- Empty content.
- MIME override.
- File extension MIME detection.
- Node without content.
- Replacing existing content.

Known failures:

- Nonexistent file fails.
- Nonexistent node fails.
- Missing blob fails with clear error.
- Oversized content follows policy.

Fuzz:

- Generate file names, MIME types, and content bytes.
- Generate malformed node IDs.
- Generate random text encodings if binary support expands.

Stress:

- Large text content near limit.
- Many nodes with content.
- Repeated overwrite/delete loop.

Regression:

- Content JSON schemas remain valid.
- Delete does not remove node.
- Missing content reports no-content, not node-not-found.

Golden artifacts:

- JSON schema canaries.
- Metadata snapshots.
- Raw content transcripts.

Playback:

- Content enriches repository meaning where useful without turning Git Mind into
  a separate document authoring system.
