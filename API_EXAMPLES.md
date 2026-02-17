# RAG Chatbot API Examples

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZG9lIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDEwODE2MDB9.abc123...",
  "type": "Bearer",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "ROLE_USER",
  "expiresAt": "2026-02-17T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "username": "Username is already taken"
  }
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "ROLE_USER",
  "expiresAt": "2026-02-17T10:30:00"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 401,
  "error": "Authentication Failed",
  "message": "Invalid username or password"
}
```

---

### 3. Validate Token

**Endpoint:** `GET /api/auth/validate`

**Request:**
```bash
curl -X GET http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "valid": true,
  "username": "johndoe",
  "userId": 1
}
```

**Error Response (401 Unauthorized):**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

---

## Chat Endpoints (Authenticated)

### 4. Send Chat Message

**Endpoint:** `POST /api/chat`

**Request:**
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main topics in my documents?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "maxResults": 5,
    "similarityThreshold": 0.7
  }'
```

**Response (200 OK):**
```json
{
  "response": "Based on your documents, the main topics include machine learning, natural language processing, and deep learning architectures. Your documents discuss various transformer models and their applications in text generation.",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "modelUsed": "openai",
  "tokensUsed": 350,
  "chunksUsed": 3,
  "sourceDocuments": [
    "ml-research-paper.pdf",
    "nlp-guide.txt",
    "transformer-architecture.md"
  ],
  "timestamp": "2026-02-16T10:30:00"
}
```

---

### 5. Get Chat History

**Endpoint:** `GET /api/chat/history?limit=10`

**Request:**
```bash
curl -X GET "http://localhost:8080/api/chat/history?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "userMessage": "What is attention mechanism?",
    "assistantResponse": "The attention mechanism is a key component...",
    "modelUsed": "openai",
    "tokensUsed": 250,
    "createdAt": "2026-02-16T10:25:00"
  },
  {
    "id": 4,
    "userMessage": "Explain transformers",
    "assistantResponse": "Transformers are a type of neural network architecture...",
    "modelUsed": "openai",
    "tokensUsed": 300,
    "createdAt": "2026-02-16T10:20:00"
  }
]
```

---

### 6. Get Session History

**Endpoint:** `GET /api/chat/session/{sessionId}`

**Request:**
```bash
curl -X GET http://localhost:8080/api/chat/session/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userMessage": "Hello, what can you help me with?",
    "assistantResponse": "I can help you find information from your uploaded documents...",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-02-16T10:15:00"
  },
  {
    "id": 2,
    "userMessage": "What are the main topics?",
    "assistantResponse": "The main topics in your documents are...",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-02-16T10:16:00"
  }
]
```

---

### 7. Clear Session

**Endpoint:** `DELETE /api/chat/session/{sessionId}`

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/chat/session/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "message": "Session cleared successfully",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Complete Authentication Flow Example

### Step 1: Register
```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "alicePassword123"
  }'
```

**Save the token from response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSIsImlhdCI6MTcwODUwMDAwMCwiZXhwIjoxNzA4NTg2NDAwfQ...",
  "type": "Bearer",
  "userId": 2,
  "username": "alice",
  "email": "alice@example.com",
  "role": "ROLE_USER",
  "expiresAt": "2026-02-17T10:30:00"
}
```

### Step 2: Use Token for Chat
```bash
# Export token
export TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSIsImlhdCI6MTcwODUwMDAwMCwiZXhwIjoxNzA4NTg2NDAwfQ..."

# Send a chat message
curl -X POST http://localhost:8080/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Summarize my documents",
    "maxResults": 5,
    "similarityThreshold": 0.7
  }'
```

### Step 3: Login (if needed later)
```bash
# Login with existing credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "alicePassword123"
  }'
```

---

## Postman Collection Variables

For Postman, set these variables:

```
base_url: http://localhost:8080
token: {{will be set after login/register}}
```

### Pre-request Script for Authenticated Requests:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

### Test Script to Save Token (Login/Register):
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
pm.environment.set("userId", jsonData.userId);
pm.environment.set("username", jsonData.username);
```

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "password": "Password must be between 6 and 100 characters"
  }
}
```

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2026-02-16T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Security Notes

1. **JWT Token Expiration**: Tokens expire after 24 hours by default
2. **Password Hashing**: Passwords are hashed using BCrypt with strength 12
3. **CORS**: Configured for `http://localhost:3000` and `http://localhost:5173`
4. **Public Endpoints**: `/api/auth/**` and `/api/*/health`
5. **Protected Endpoints**: All other endpoints require valid JWT token

---

## Environment Variables

Set these environment variables before running:

```bash
# OpenAI
export OPENAI_API_KEY=sk-your-openai-api-key

# OR Gemini
export GEMINI_API_KEY=your-gemini-api-key
export GEMINI_PROJECT_ID=your-gcp-project-id

# Database (if different from defaults)
export DB_URL=jdbc:postgresql://localhost:5432/ragdb
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
```
