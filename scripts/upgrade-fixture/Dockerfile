FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    g++ \
    git \
    make \
    python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /upgrade

COPY artifacts/git-mind-package.tgz /tmp/git-mind-package.tgz
RUN npm install -g /tmp/git-mind-package.tgz \
  && npm cache clean --force

COPY fixture/gitmind-v5-warp14.bundle /fixtures/gitmind-v5-warp14.bundle
COPY fixture/gitmind-v5-warp14.fixture.json /fixtures/gitmind-v5-warp14.fixture.json
COPY runner/run-upgrade-fixture.mjs /usr/local/bin/run-upgrade-fixture.mjs

ENV HOME=/tmp/home
ENV GIT_CONFIG_NOSYSTEM=1
ENV GIT_CONFIG_GLOBAL=/dev/null

CMD ["node", "/usr/local/bin/run-upgrade-fixture.mjs"]
