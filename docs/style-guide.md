# Styling Guidelines

### Recommended IDE - Visual Studio Code

### Commits Messages

Let's follow Conventional Commits when writing our commit messages: <https://www.conventionalcommits.org/en/v1.0.0/>

Structure:

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

Example: feature(core): add submit functionality in Button.tsx

### ESLint

Run before committing:

```
npx eslint .
```

To fix automatic errors:

```
npx eslint --fix .
```

### Unused Dependencies

Run to check for unused dependencies

```
npx depcheck
```

Uninstall unused dependencies with

```
npm uninstall <dependency-name>
```

### package.json

Make sure to order the scripts alphabetically (A - Z)

### Prettier

Run to format

```
npx prettier . --write
```

Check if all files follow Prettier format

```
npx prettier . --check
```

## Writing Code

- Use function declarations - not arrow functions

### File Naming Conventions

- Components should have names capitalized (i.e. components/NavBar.ts)
- Other files such as pages should be lowercase (i.e. api/example/route.ts)
- For MongoDB schema, use camelCase (i.e. databasse/userSchema.ts)

### TypeScript Naming Conventions

- Use **camelCase** (e.g. firstName, lastName) for variables and functions
- Use **UPPER_CASE** (e.g. FIRST_NAME, LAST_NAME) with underscores between words for constants/globals
- Use **PascalCase** (e.g. FirstName, LastName) for class, interface, enum, and type names

### Variables

- Use the `const` keyword for constant variables
- Use the `let` keyword for local variables. `let` has scoping restrictions, `var`, does not.
- Do NOT use the `var` keyword for variables
- Use meaningful variable names. Better to have longer, useful names than shorter, confusing ones.
- Do not use a variable if it will only be used once.
- Booleans: don't use negative names for boolean variables (BAD: `const isNotEnabled = true`, GOOD: `const isEnabled = true`)

### Commenting

#### When to add Comments

- Include comments for intricate or non-obvious code segments
- Clarify how your code handles edge cases or exceptional scenarios
- Document workarounds due to limitations or external dependencies
- Mark areas where improvements or additional features are needed. Link to GitHub Issue, if possible.
- When partially implementing a feature, add 'TODO:' comments where functionality is missing/needed to be implemented in the future.

#### When NOT to add Comments

- Avoid redundant comments that merely repeat what the code already expresses clearly.
- If the code’s purpose is evident (e.g., simple variable assignments), skip unnecessary comments.
- Remove temporary comments used for debugging once the issue is resolved.
- Incorrect comments can mislead other developers, so ensure accuracy.

### Organize Imports

- With clean and easy to read import statements you can quickly see the dependencies of current code. Make sure you apply following good practices for import statements.
- Unused imports should be removed.
- Groups of imports are delineated by one blank line before and after.

### Use TypeScript Aliases

This will avoid long relative paths when doing imports.

Bad:

```
import { UserService } from '../../../services/UserService';
```

Good:

```
import { UserService } from '@services/UserService';
```

## Pull Request Instructions

- Set base branch to "develop"
- Add screenshots of results
- Assign Angela and Sophia to review
- Link your issue (follow the PR template)

### Best Practices to Write REST API

### 1. Test Structure

- **Integration tests** verify full request/response cycle
- **Unit tests** test business logic in isolation
- **Clean up data** in test teardown
- **Use descriptive test names** that explain behavior

### 2. Error Handling

- **Return appropriate HTTP status codes**
- **Include error details** for debugging
- **Log errors** for monitoring
- **Handle validation errors** separately from server errors

### 3. Code Organization

- **Separation of concerns**: Controller → Service → Database
- **Input validation** at controller level
- **Business logic** in service layer
- **Consistent error responses** across endpoints

### 4. Development Workflow

- **Write tests first** (TDD)
- **Run tests frequently** during development
- **Use hot reloading** for fast feedback
- **Implement CI/CD** for automated testing

```

```
