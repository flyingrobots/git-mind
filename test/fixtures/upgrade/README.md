# Upgrade Fixtures

This directory contains frozen repository-shaped fixtures for dependency
upgrade tests.

## gitmind-v5-warp14

`gitmind-v5-warp14.bundle` is a sanitized Git bundle captured from
`@neuroglyph/git-mind@5.0.0` on the `@git-stunts/git-warp` 14.x substrate.
It is intentionally Git-native rather than a raw working-directory tarball.

The bundle includes:

- `HEAD`
- `refs/warp/gitmind/checkpoints/head`
- `refs/warp/gitmind/writers/local`

It intentionally excludes:

- `node_modules`
- local Git config
- remotes
- hooks
- reflogs
- stash state
- host-specific paths

The companion `gitmind-v5-warp14.fixture.json` records the expected object
IDs, artifact checksum, dependency versions, graph counts, and sentinel nodes.
The Docker upgrade harness first verifies these legacy refs, then runs the
git-warp v17 checkpoint migration inside the isolated container before reading
the graph with the package under test.

## Regenerating

Regenerate this fixture only when the intended frozen source state changes.
Do not regenerate it as part of ordinary dependency updates.

```bash
git bundle create \
  test/fixtures/upgrade/gitmind-v5-warp14.bundle \
  HEAD \
  refs/warp/gitmind/checkpoints/head \
  refs/warp/gitmind/writers/local

git bundle verify test/fixtures/upgrade/gitmind-v5-warp14.bundle
shasum -a 256 test/fixtures/upgrade/gitmind-v5-warp14.bundle
```

Update the metadata file in the same commit when the bundle changes.
