import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    maxWorkers: 4,
    minWorkers: 1,
    testTimeout: 30_000,
    poolOptions: {
      forks: {
        execArgv: ['--disable-warning=DEP0169'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
    },
  },
});
