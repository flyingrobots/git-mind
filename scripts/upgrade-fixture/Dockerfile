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
COPY artifacts/package-lock.json /tmp/package-lock.json
RUN mkdir -p /opt/git-mind \
  && tar -xzf /tmp/git-mind-package.tgz -C /opt/git-mind --strip-components=1 \
  && cp /tmp/package-lock.json /opt/git-mind/package-lock.json \
  && cd /opt/git-mind \
  && npm ci --omit=dev \
  && ln -s /opt/git-mind/bin/git-mind.js /usr/local/bin/git-mind \
  && npm cache clean --force

COPY fixture/gitmind-v5-warp14.bundle /fixtures/gitmind-v5-warp14.bundle
COPY fixture/gitmind-v5-warp14.fixture.json /fixtures/gitmind-v5-warp14.fixture.json
COPY runner/run-upgrade-fixture.mjs /usr/local/bin/run-upgrade-fixture.mjs

ENV HOME=/tmp/home
ENV GIT_MIND_PACKAGE_ROOT=/opt/git-mind
ENV GIT_CONFIG_NOSYSTEM=1
ENV GIT_CONFIG_GLOBAL=/dev/null

CMD ["node", "/usr/local/bin/run-upgrade-fixture.mjs"]
