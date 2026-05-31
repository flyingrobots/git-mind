#!/usr/bin/env sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
fixture_name=gitmind-v5-warp14
fixture_dir="$repo_root/test/fixtures/upgrade"
docker_dir="$repo_root/scripts/upgrade-fixture"
context=$(mktemp -d "${TMPDIR:-/tmp}/gitmind-upgrade-fixture.XXXXXX")
image=

cleanup() {
  if [ -n "$image" ]; then
    docker image rm "$image" >/dev/null 2>&1 || true
  fi
  rm -rf "$context"
}

trap cleanup EXIT INT TERM

mkdir -p "$context/artifacts" "$context/fixture" "$context/runner"

package_file=$(cd "$repo_root" && npm pack --pack-destination "$context/artifacts" --silent)
mv "$context/artifacts/$package_file" "$context/artifacts/git-mind-package.tgz"

cp "$fixture_dir/$fixture_name.bundle" "$context/fixture/$fixture_name.bundle"
cp "$fixture_dir/$fixture_name.fixture.json" "$context/fixture/$fixture_name.fixture.json"
cp "$docker_dir/Dockerfile" "$context/Dockerfile"
cp "$docker_dir/run-upgrade-fixture.mjs" "$context/runner/run-upgrade-fixture.mjs"

short_sha=$(git -C "$repo_root" rev-parse --short HEAD)
image="git-mind-upgrade-fixture:$fixture_name-$short_sha"

docker build -t "$image" "$context"
docker run --rm --network none \
  -e HOME=/tmp/home \
  -e GIT_CONFIG_NOSYSTEM=1 \
  -e GIT_CONFIG_GLOBAL=/dev/null \
  -e SSH_AUTH_SOCK= \
  -e GITHUB_TOKEN= \
  -e NPM_TOKEN= \
  "$image"

