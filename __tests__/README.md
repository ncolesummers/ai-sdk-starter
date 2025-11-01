# Vitest Testing Setup

This directory contains unit and integration tests for the Next.js application using Vitest.

## Overview

Vitest is configured to test React components, utility functions, and other application code. The setup includes:

- **Vitest** - Fast unit test runner with hot module reloading
- **React Testing Library** - React component testing utilities
- **Happy DOM** - Lightweight DOM implementation for testing
- **jest-dom** - Custom matchers for DOM assertions

## Running Tests

```bash
# Run tests in watch mode (recommended for development)
pnpm test

# Run all tests once
pnpm test:unit

# Run tests with UI interface
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Test Organization

Tests should be organized in the `__tests__` directory following this structure:

```
__tests__/
├── components/          # React component tests
│   └── button.test.tsx
├── lib/                # Utility function tests
│   └── utils.test.ts
└── README.md           # This file
```

## Writing Tests

### Testing Utility Functions

```typescript
import { describe, expect, it } from "vitest";
import { myFunction } from "@/lib/my-module";

describe("myFunction", () => {
  it("should return expected result", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should handle user interactions", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking Next.js Features

Common Next.js features are mocked in `vitest.setup.ts`:

- `next/navigation` - Router, pathname, search params
- `next/headers` - Headers and cookies
- Environment variables

To add custom mocks for specific tests:

```typescript
import { vi } from "vitest";

vi.mock("@/lib/my-module", () => ({
  myFunction: vi.fn(() => "mocked result")
}));
```

## Configuration

### vitest.config.ts

Main configuration file that sets up:
- React plugin for JSX support
- Happy DOM environment
- Path aliases (`@/` imports)
- Coverage settings
- Test file patterns

### vitest.setup.ts

Global test setup that includes:
- Testing Library jest-dom matchers
- Automatic cleanup after each test
- Next.js router and headers mocks
- Console error suppression for noise

### tsconfig.json

TypeScript is configured to recognize:
- Vitest global functions (describe, it, expect)
- jest-dom custom matchers
- Test file patterns

## Best Practices

### DO

- Write descriptive test names that explain the expected behavior
- Use Testing Library queries that match user behavior (getByRole, getByLabelText)
- Test user interactions, not implementation details
- Mock external dependencies (API calls, database queries)
- Use `userEvent` for simulating user interactions
- Clean up side effects in tests

### DON'T

- Test implementation details (internal state, private methods)
- Use `getByTestId` unless necessary (prefer semantic queries)
- Test third-party library functionality
- Make tests dependent on each other
- Mock too much (only mock what's necessary)

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
pnpm test:coverage
```

Coverage thresholds can be configured in `vitest.config.ts`:

```typescript
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "json", "html"],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
}
```

## Troubleshooting

### Tests fail with import errors

Make sure all dependencies are installed:
```bash
pnpm install
```

### Tests fail with type errors

Ensure TypeScript types are included in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Playwright tests run with Vitest

Vitest is configured to only run tests in `__tests__/` directory. Playwright E2E tests are in `tests/` directory and should be run with:
```bash
pnpm test:e2e
```

## Examples

See the example test files:
- `__tests__/lib/utils.test.ts` - Utility function testing
- `__tests__/components/button.test.tsx` - React component testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)