# Hurl Test Suite

This directory contains [Hurl](https://hurl.dev/) test files for API testing.

## Installation

```bash
# macOS
brew install hurl

# Linux (Debian/Ubuntu)
sudo apt-get install hurl

# Or download from https://github.com/Orange-OpenSource/hurl/releases
```

## Running Tests

### Quick Start (Automated)

All tests are now fully automated! No manual session token extraction required.

```bash
# Run all tests
hurl --test .hurl/*.hurl

# Or use npm scripts (recommended)
pnpm test:api              # Run all API tests
pnpm test:api:health       # Health check only
pnpm test:api:auth         # Auth tests only
pnpm test:api:chat         # Chat tests only
```

### Individual Test Suites

#### Health Check
```bash
hurl --test .hurl/health.hurl
```

#### Authentication
```bash
hurl --test .hurl/auth.hurl
```

#### Chat API
```bash
# Now fully automated - no manual token needed!
hurl --test .hurl/chat.hurl
```

### Legacy Manual Method (Fallback)

If you need to test with a specific session token:

```bash
# Get session token from browser DevTools → Application → Cookies
hurl --test .hurl/chat.hurl --variable sessionToken=YOUR_SESSION_TOKEN_HERE
```

## Test Organization

- `health.hurl` - Health check endpoint (no auth required)
- `auth.hurl` - Authentication flows (test-login, magic link)
- `chat.hurl` - Chat API with automated authentication

### How Automated Authentication Works

The chat tests now use the `/api/auth/test-login` endpoint to automatically obtain session tokens:

1. Test suite sends POST request to `/api/auth/test-login` with email
2. Endpoint creates/finds test user and generates valid session
3. Hurl captures the session token from the response
4. Subsequent tests use the captured token automatically

**Security:** The test-login endpoint only works in development/test environments and returns 403 in production.

## Verbose Output

For detailed request/response information:
```bash
hurl --test --verbose .hurl/health.hurl
```

## JSON Output

For CI/CD integration:
```bash
hurl --test --json .hurl/health.hurl
```

## Expected Results

All tests should pass when:
- Dev server is running (`pnpm dev`)
- Database is migrated (`pnpm db:migrate`)
- Ollama is running with models installed
- `NODE_ENV` is NOT set to `production` (for test-login endpoint)

## Adding New Tests

Create a new `.hurl` file following the format:

```hurl
# Test description
GET http://localhost:3000/api/endpoint
HTTP 200
[Asserts]
jsonpath "$.field" == "expected value"
```

See [Hurl documentation](https://hurl.dev/docs/tutorial/your-first-hurl-file.html) for more examples.
