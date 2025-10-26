# Chat API Tests
# Usage: hurl --test .hurl/chat.hurl
#
# This test suite automatically authenticates using the test-login endpoint.
# No manual session token extraction required!

# Setup: Get test session token
POST http://localhost:3000/api/auth/test-login
Content-Type: application/json
{
  "email": "test@example.com"
}
HTTP 200
[Captures]
sessionToken: jsonpath "$.sessionToken"
[Asserts]
jsonpath "$.success" == true
jsonpath "$.sessionToken" exists
jsonpath "$.user.email" == "test@example.com"

# Test 1: Qwen3 Chat Model
POST http://localhost:3000/api/chat
Content-Type: application/json
Cookie: better-auth.session_token={{sessionToken}}
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "role": "user",
    "parts": [
      {
        "type": "text",
        "text": "What is 2+2?"
      }
    ]
  },
  "selectedChatModel": "chat-model",
  "selectedVisibilityType": "private"
}
HTTP 200
[Asserts]
header "Content-Type" contains "text/event-stream"

# Test 2: GPT-OSS Model
POST http://localhost:3000/api/chat
Content-Type: application/json
Cookie: better-auth.session_token={{sessionToken}}
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440022",
    "role": "user",
    "parts": [
      {
        "type": "text",
        "text": "What is 3+3?"
      }
    ]
  },
  "selectedChatModel": "gpt-oss:20b",
  "selectedVisibilityType": "private"
}
HTTP 200
[Asserts]
header "Content-Type" contains "text/event-stream"

# Test 3: Unauthorized request (no cookie)
POST http://localhost:3000/api/chat
Content-Type: application/json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440033",
    "role": "user",
    "parts": [
      {
        "type": "text",
        "text": "This should fail"
      }
    ]
  },
  "selectedChatModel": "chat-model",
  "selectedVisibilityType": "private"
}
HTTP 401
[Asserts]
jsonpath "$.code" == "unauthorized:chat"

# Test 4: Invalid model ID
POST http://localhost:3000/api/chat
Content-Type: application/json
Cookie: better-auth.session_token={{sessionToken}}
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440044",
    "role": "user",
    "parts": [
      {
        "type": "text",
        "text": "Test with invalid model"
      }
    ]
  },
  "selectedChatModel": "nonexistent-model",
  "selectedVisibilityType": "private"
}
HTTP 400
