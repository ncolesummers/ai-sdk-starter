# Health Check Endpoint Test
# Usage: hurl --test .hurl/health.hurl

GET http://localhost:3000/api/health
HTTP 200
[Asserts]
jsonpath "$.status" == "healthy"
jsonpath "$.timestamp" exists
jsonpath "$.uptime" exists
