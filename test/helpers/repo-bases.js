/**
 * Base repo catalog for repository-shaped tests.
 */

export function minimalDocsAndCodeBase() {
  return async repo => {
    await repo.writeFiles({
      'README.md': '# Echo Service\n\nSee docs/overview.md and src/app.js.\n',
      'docs/overview.md': '# Overview\n\nThe service entry point lives in `src/app.js`.\n',
      'src/app.js': 'export function buildApp() {\n  return { ok: true };\n}\n',
    });
    await repo.commit('chore: scaffold minimal docs and code fixture');
  };
}

export function adrLinkedServiceBase() {
  return async repo => {
    await repo.writeFiles({
      'README.md': '# Auth Service\n\nSee docs/adr/0001-auth.md for the auth decision.\n',
      'docs/adr/0001-auth.md': '# ADR 0001: Auth\n\nWe use token-based auth in `src/auth.js`.\n',
      'src/auth.js': 'export function authenticate(token) {\n  return token === "ok";\n}\n',
    });
    await repo.commit('chore: scaffold adr-linked service fixture');
  };
}
