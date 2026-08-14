# Contributing to Player Stack Audio

Thanks for contributing to Player Stack Audio! :heart:

---

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/) (>= 18)
- [Git](https://git-scm.com/)
- npm

### Fork & Clone

```bash
git clone https://github.com/{your-username}/audio.git
cd audio
npm install
```

To keep your fork up to date:

```bash
git remote add upstream git@github.com:playerstack/audio.git
git fetch upstream
git branch --set-upstream-to=upstream/main main
git pull upstream --rebase
```

---

## Branch Naming Convention

Format: \`<type>/<description-kebab-case>\`

| Type | Usage |
|------|-------|
| \`feat/\` | New feature |
| \`fix/\` | Bug fix |
| \`refactor/\` | Refactoring |
| \`chore/\` | Maintenance |
| \`docs/\` | Documentation only |
| \`test/\` | Tests only |

---

## Commit Convention

Format: \`<type>(<scope>): <description>\`

Reference: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

---

## Testing

```bash
npm test          # Run Jest once
npm run test:cov  # With coverage report
```

Framework: Jest 29 + jsdom + @testing-library/react. Tests in \`test/**/*.spec.js\`.

---

## Linting

```bash
npm run lint
```

---

## Checklist before requesting review

- [ ] \`npm run build\` compiles without errors
- [ ] \`npm run test\` passes
- [ ] \`npm run lint\` has no new errors
