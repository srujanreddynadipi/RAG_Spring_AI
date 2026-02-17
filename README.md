<!-- # to start he docker and backend 
docker start postgres-pgvector
ollama serve
cd backend
mvn spring-boot:run -->

# RAG Chatbot - Production-Ready Application

A full-stack Retrieval Augmented Generation (RAG) chatbot application built with Spring Boot and React.

## Technology Stack

### Backend
- **Spring Boot 3.2.2** with Java 17
- **PostgreSQL** with pgvector extension
- **Spring AI** (OpenAI and Gemini support)
- **Spring Security** with JWT authentication
- **Document Processing**: Apache Tika, PDFBox, POI, Jsoup, Flexmark

### Frontend
- **React 18.2.0** with Vite
- **React Router** for navigation
- **Axios** for API communication
- **Responsive UI** with modern styling

## Features

### Backend Features
- ✅ JWT-based authentication with BCrypt password hashing (strength 12)
- ✅ User registration and login endpoints
- ✅ Document ingestion (PDF, DOCX, TXT, MD, URLs)
- ✅ Text chunking with configurable size (500 chars) and overlap (100 chars)
- ✅ Vector embeddings using OpenAI or Gemini
- ✅ pgvector similarity search with IVFFlat indexing
- ✅ RAG pipeline with context-aware responses
- ✅ Chat history management with sessions

### Frontend Features
- ✅ User authentication (Login/Register)
- ✅ Chat interface with bubble UI
- ✅ Real-time message display with typing indicators
- ✅ Document upload (files and URLs)
- ✅ Document management (list and delete)
- ✅ Protected routes with authentication state
- ✅ Configurable RAG parameters (max results, similarity threshold)

## Project Structure

```
Spring_AI_RAG/
├── backend/
│   ├── src/main/java/com/example/rag/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT and Spring Security
│   │   ├── service/         # Business logic
│   │   └── util/            # Utility classes
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── schema.sql
│   │   └── init.sql
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── context/         # React Context (Auth)
    │   ├── pages/           # Page components
    │   ├── services/        # API service layer
    │   ├── styles/          # CSS files
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── public/
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 16+ and npm
- PostgreSQL 14+ with pgvector extension
- OpenAI API key or Google Gemini API key

### Database Setup

1. Install PostgreSQL and pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Create database:
```sql
CREATE DATABASE rag_chatbot;
```

3. Run schema creation:
```bash
psql -U postgres -d rag_chatbot -f backend/src/main/resources/schema.sql
```

### Backend Setup

1. Configure database and API keys in `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/rag_chatbot
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key-min-256-bits
jwt.expiration=86400000

# AI Provider (choose one)
spring.ai.openai.api-key=your-openai-key
# OR
spring.ai.vertex.ai.gemini.project-id=your-project-id
spring.ai.vertex.ai.gemini.location=us-central1
```

2. Build and run backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## Usage

### 1. Register an Account
- Navigate to `http://localhost:3000`
- Click "Register here"
- Enter username (min 3 chars), email, and password (min 6 chars)
- You'll be automatically logged in and redirected to the chat

### 2. Upload Documents
- Click "Upload Documents" button
- Choose between file upload or URL
- Supported formats: PDF, DOCX, TXT, MD
- Documents are automatically processed and chunked

### 3. Chat with RAG
- Type your question in the chat input
- The system will search relevant document chunks
- Responses are generated with context from your documents
- Configure max results (1-10) and similarity threshold (0-1) in settings

### 4. Document Management
- View all uploaded documents in the Upload page
- See chunk count and upload timestamps
- Delete documents when no longer needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate JWT token

### Chat
- `POST /api/chat` - Send message and get RAG response
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/session/{sessionId}` - Get session history
- `DELETE /api/chat/session/{sessionId}` - Clear session

### Documents
- `POST /api/documents/upload` - Upload file
- `POST /api/documents/upload-url` - Upload from URL
- `GET /api/documents` - List user's documents
- `DELETE /api/documents/{id}` - Delete document

## Configuration

### RAG Parameters
- **Chunk Size**: 500 characters
- **Chunk Overlap**: 100 characters
- **Vector Dimension**: 1536 (OpenAI ada-002)
- **Similarity Metric**: Cosine distance
- **Index Type**: IVFFlat with 100 lists
- **Default Max Results**: 3
- **Default Similarity Threshold**: 0.7

### Security
- **Password Hashing**: BCrypt with strength 12
- **JWT Algorithm**: HS256
- **JWT Expiration**: 24 hours
- **CORS**: Enabled for localhost:3000

## Building for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/rag-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/` directory.

## Troubleshooting

### Backend won't start
- Verify PostgreSQL is running
- Check database credentials in application.properties
- Ensure pgvector extension is installed
- Verify API keys are set correctly

### Frontend can't connect to backend
- Check backend is running on port 8080
- Verify CORS configuration in SecurityConfig
- Check browser console for errors

### Embeddings failing
- Verify AI provider API key is valid
- Check internet connectivity
- Monitor API rate limits and quotas

## License

This project is provided as-is for educational and production use.
