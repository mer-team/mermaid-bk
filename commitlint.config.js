module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 100],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'ci',
        'chore',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'scope-enum': [2, 'always', ['api', 'web', 'mer', 'all']],
    'scope-empty': [2, 'never'],
    'subject-case': [
      2,
      'always',
      ['sentence-case', 'start-case', 'lower-case'],
    ],
    'subject-max-length': [2, 'always', 80], // Enforce max subject length
  },
};
