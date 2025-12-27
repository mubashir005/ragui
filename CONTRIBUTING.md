# Contributing to RAG Agent UI

Thank you for your interest in contributing to RAG Agent UI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rag-ui.git
   cd rag-ui
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a `.env.local`** file with your backend API URL
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `style/` - UI/styling changes

Example: `feature/add-multi-file-upload`

### Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Test your changes** thoroughly

4. **Commit your changes** with clear messages:
   ```bash
   git commit -m "feat: add multi-file upload support"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add document preview feature
fix: resolve CORS issues with backend
docs: update installation instructions
style: improve welcome screen animations
```

## Coding Standards

### TypeScript
- Use **strict mode** TypeScript
- Define interfaces for all props
- Avoid `any` types when possible
- Use meaningful variable names

### React Components
- Use **functional components** with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

Example:
```typescript
interface MyComponentProps {
  title: string;
  onAction: (id: string) => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  // Component logic
}
```

### Styling
- Use **TailwindCSS v4** syntax (`bg-linear-to-r` not `bg-gradient-to-r`)
- Follow existing color scheme (cyan/indigo/slate)
- Ensure responsive design with Tailwind breakpoints
- Use Framer Motion for animations

### File Organization
- Place components in `/components/rag/`
- Keep API logic in `/lib/api.ts`
- Use descriptive file names (e.g., `WelcomeScreenPro.tsx`)

##  Testing

Before submitting a PR:

1. **Build check**:
   ```bash
   npm run build
   ```

2. **Type check**:
   ```bash
   npx tsc --noEmit
   ```

3. **Test all user flows**:
   - Welcome screen → Pipeline → Chat
   - File upload with different formats
   - Error scenarios (CORS, timeout, etc.)

## Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Ensure all tests pass** and there are no TypeScript errors
3. **Update README.md** with details of changes if needed
4. **Request review** from maintainers
5. **Address feedback** promptly

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
```

## Reporting Bugs

Use GitHub Issues with the **bug** label:

**Include**:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Error messages from console

## Suggesting Features

Use GitHub Issues with the **enhancement** label:

**Include**:
- Clear description of the feature
- Use case / problem it solves
- Proposed solution
- Alternative solutions considered
- Impact on existing functionality

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS v4 Docs](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

Feel free to open a GitHub Discussion or reach out to [@mubashir005](https://github.com/mubashir005).

---

Thank you for contributing!
