# Authentication Flow Tests
# Usage: hurl --test .hurl/auth.hurl

# Test 1: Test login with valid email (development only)
POST http://localhost:3000/api/auth/test-login
Content-Type: application/json
{
  "email": "test@example.com"
}
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.sessionToken" exists
jsonpath "$.user.email" == "test@example.com"
jsonpath "$.user.id" exists
jsonpath "$.expiresAt" exists

# Test 2: Test login without email (should fail)
POST http://localhost:3000/api/auth/test-login
Content-Type: application/json
{
  "email": ""
}
HTTP 400
[Asserts]
jsonpath "$.code" == "bad_request:test-auth"

# Test 3: Request magic link (should succeed)
POST http://localhost:3000/api/auth/sign-in/magic-link
Content-Type: application/json
{
  "email": "test@example.com",
  "callbackURL": "http://localhost:3000"
}
HTTP 200
[Asserts]
jsonpath "$.status" == true

# Test 4: Get session without auth (should return null)
GET http://localhost:3000/api/auth/get-session
HTTP 200
[Asserts]
body == "null"
