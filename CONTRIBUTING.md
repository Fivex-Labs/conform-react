# Contributing to @fivexlabs/conform-react

Thank you for your interest in contributing to `@fivexlabs/conform-react`! We appreciate your help in making this library better.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/fivexlabs/conform-react.git
   cd conform-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Run tests**
   ```bash
   npm test
   # or
   yarn test
   ```

## 📝 Development Workflow

### Code Style

We use ESLint and TypeScript for code quality. Please ensure your code follows these guidelines:

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

Examples:
feat(validation): add async validation support
fix(fields): resolve checkbox default value issue
docs(readme): update installation instructions
test(utils): add tests for conditional logic
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Maintenance tasks

### Branch Naming

Please use descriptive branch names:

```
feature/add-async-validation
fix/checkbox-default-value
docs/update-readme
test/conditional-logic
```

## 🧪 Testing

We strive for high test coverage. Please include tests for any new functionality:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/utils/validation.test.ts
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for components
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

Example test:
```typescript
describe('evaluateCondition', () => {
  it('should return true when field equals expected value', () => {
    const condition = { field: 'name', operator: 'equals', value: 'John' };
    const formValues = { name: 'John' };
    
    expect(evaluateCondition(condition, formValues)).toBe(true);
  });
});
```

## 📚 Documentation

Documentation is crucial for library adoption. Please:

- Update README.md for new features
- Add JSDoc comments to public APIs
- Include usage examples
- Update TypeScript type definitions

### API Documentation Format

```typescript
/**
 * Evaluates a conditional logic rule against form values
 * 
 * @param condition - The conditional logic to evaluate
 * @param formValues - Current form values
 * @returns Whether the condition is met
 * 
 * @example
 * ```typescript
 * const condition = { field: 'age', operator: 'greaterThan', value: 18 };
 * const isValid = evaluateCondition(condition, { age: 25 });
 * console.log(isValid); // true
 * ```
 */
export function evaluateCondition(
  condition: ConditionalLogic,
  formValues: Record<string, any>
): boolean {
  // Implementation...
}
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Minimal steps to reproduce the bug
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Environment**: OS, Node version, browser (if applicable)
6. **Code example**: Minimal code that demonstrates the issue

Use this template:

```markdown
**Bug Description**
A clear and concise description of the bug.

**To Reproduce**
1. Create a form with schema: `{ ... }`
2. Set initial values: `{ ... }`
3. Trigger the issue by: `...`

**Expected Behavior**
The form should...

**Actual Behavior**
Instead, the form...

**Environment**
- OS: macOS 12.0
- Node: 18.0.0
- Package version: 1.0.0

**Code Example**
```typescript
// Minimal example that reproduces the issue
const schema = { ... };
```

## ✨ Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** - why is this feature needed?
3. **Provide examples** - how would the API look?
4. **Consider alternatives** - are there other ways to solve this?

Use this template:

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Describe the problem this feature would solve.

**Proposed API**
```typescript
// Example of how the feature might work
const schema = {
  fields: [
    {
      name: "example",
      type: "newFieldType",
      // new properties...
    }
  ]
};
```

**Alternatives Considered**
Other approaches you've considered.
```

## 🔧 Pull Request Process

1. **Create an issue first** for significant changes
2. **Fork the repository** and create a feature branch
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Run the test suite** to ensure everything works
7. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
**Description**
Brief description of the changes.

**Related Issue**
Fixes #123

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

## 📋 Code Review Guidelines

When reviewing pull requests, we look for:

- **Correctness**: Does the code work as intended?
- **Style**: Does it follow our coding standards?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security implications?
- **Documentation**: Is the code well-documented?
- **Tests**: Are there adequate tests?

## 📞 Getting Help

If you need help:

1. **Check the documentation** in README.md
2. **Search existing issues** on GitHub
3. **Ask questions** in GitHub Discussions
4. **Contact us** at hello@fivexlabs.com

## 🏢 About Fivex Labs

This project is maintained by [Fivex Labs](https://fivexlabs.com). We're passionate about building developer-friendly tools and welcome contributions from the community.

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://fivexlabs.com">Fivex Labs</a></p>
</div> 