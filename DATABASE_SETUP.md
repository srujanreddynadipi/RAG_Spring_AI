# PostgreSQL with pgvector Setup Guide

## Prerequisites

- PostgreSQL 12 or higher
- pgvector extension

## Installation

### 1. Install PostgreSQL

**Windows:**
```powershell
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Install pgvector Extension

**From Source:**
```bash
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install  # may need sudo
```

**Using Package Manager (PostgreSQL 15+):**
```bash
# Ubuntu/Debian
sudo apt install postgresql-15-pgvector

# macOS
brew install pgvector
```

**Docker (Recommended):**
```bash
docker run -d \
  --name postgres-pgvector \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ragdb \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

## Database Setup

### Option 1: Using Docker Compose (Recommended)

See `docker-compose.yml` in the project root.

```bash
docker-compose up -d
```

### Option 2: Manual Setup

1. **Start PostgreSQL:**
```bash
# Linux/macOS
sudo service postgresql start

# macOS with Homebrew
brew services start postgresql

# Windows
# PostgreSQL starts automatically as a service
```

2. **Connect to PostgreSQL:**
```bash
psql -U postgres
```

3. **Create Database:**
```sql
CREATE DATABASE ragdb;
\c ragdb
```

4. **Enable pgvector Extension:**
```sql
CREATE EXTENSION vector;
```

5. **Verify Extension:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

6. **Run Schema Script:**
```bash
# From command line
psql -U postgres -d ragdb -f backend/src/main/resources/schema.sql

# Or from psql prompt
\i backend/src/main/resources/schema.sql
```

## Schema Overview

### Tables Created

1. **users** - User accounts with authentication
2. **documents** - Uploaded document metadata
3. **document_chunks** - Text chunks with embeddings (vector dimension: 1536)
4. **chat_messages** - Chat history

### pgvector Index

**IVFFlat Index:**
```sql
CREATE INDEX idx_chunks_embedding_ivfflat 
    ON document_chunks 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

**Key Parameters:**
- `lists = 100` - Number of inverted lists (adjust based on data size)
- `vector_cosine_ops` - Use cosine distance for similarity

**Recommended lists value:**
- Small datasets (<10K): 10-50
- Medium datasets (10K-100K): 100-200
- Large datasets (>100K): sqrt(rows)

## Similarity Search

### Query Examples

**1. Find Top 5 Similar Chunks:**
```sql
SELECT 
    dc.id,
    dc.content,
    dc.embedding <=> '[0.1, 0.2, ..., 0.3]'::vector AS distance,
    d.filename
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.user_id = 1
ORDER BY dc.embedding <=> '[0.1, 0.2, ..., 0.3]'::vector
LIMIT 5;
```

**2. Find Chunks with Similarity Threshold:**
```sql
SELECT 
    dc.id,
    dc.content,
    1 - (dc.embedding <=> '[0.1, 0.2, ..., 0.3]'::vector) AS similarity,
    d.filename
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.user_id = 1
    AND 1 - (dc.embedding <=> '[0.1, 0.2, ..., 0.3]'::vector) >= 0.7
ORDER BY similarity DESC
LIMIT 10;
```

### Distance Operators

- `<->` - Euclidean distance (L2)
- `<#>` - Inner product (for normalized vectors)
- `<=>` - Cosine distance (recommended for text embeddings)

**Cosine Distance to Similarity:**
```
similarity = 1 - (cosine_distance / 2)
```

## Performance Tuning

### 1. Adjust IVFFlat Lists

```sql
-- Drop old index
DROP INDEX idx_chunks_embedding_ivfflat;

-- Create new index with more lists for larger dataset
CREATE INDEX idx_chunks_embedding_ivfflat 
    ON document_chunks 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 200);
```

### 2. Set Query Parameters

```sql
-- Number of lists to probe (higher = better recall, slower)
SET ivfflat.probes = 10;
```

### 3. PostgreSQL Configuration

Add to `postgresql.conf`:
```conf
# Increase work memory for vector operations
work_mem = 256MB

# For index creation
maintenance_work_mem = 512MB

# Enable parallel queries
max_parallel_workers_per_gather = 4
```

### 4. Optimize Queries

```sql
-- Vacuum and analyze regularly
VACUUM ANALYZE document_chunks;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'document_chunks';
```

## Testing the Setup

### 1. Insert Test Data

```sql
-- Insert test user
INSERT INTO users (username, email, password) 
VALUES ('test', 'test@test.com', '$2a$12$...');

-- Insert test document
INSERT INTO documents (filename, file_path, file_type, file_size, user_id, processed) 
VALUES ('test.pdf', '/path/test.pdf', 'PDF', 1024, 1, false);

-- Insert test chunk with random embedding
INSERT INTO document_chunks (document_id, chunk_index, content, token_count, embedding)
VALUES (1, 0, 'Test content', 10, array_fill(0.1, ARRAY[1536])::vector);
```

### 2. Test Vector Operations

```sql
-- Create sample embeddings
SELECT array_fill(0.1, ARRAY[1536])::vector AS embedding;

-- Test similarity search
SELECT embedding <=> array_fill(0.2, ARRAY[1536])::vector AS distance
FROM document_chunks
LIMIT 1;
```

## Backup and Restore

### Backup
```bash
pg_dump -U postgres -d ragdb -F c -f ragdb_backup.dump
```

### Restore
```bash
pg_restore -U postgres -d ragdb ragdb_backup.dump
```

## Troubleshooting

### Issue: Extension not found
```sql
-- Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- If not available, install pgvector
-- See installation instructions above
```

### Issue: Slow similarity searches
```sql
-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM document_chunks
ORDER BY embedding <=> '[...]'::vector
LIMIT 5;

-- Adjust probes
SET ivfflat.probes = 20;
```

### Issue: Index creation fails
```sql
-- Increase maintenance_work_mem temporarily
SET maintenance_work_mem = '1GB';

-- Then create index
CREATE INDEX ...;
```

## Connection String

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ragdb
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Monitoring

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('ragdb'));
```

### Check Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Sizes
```sql
SELECT 
    indexname,
    tablename,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vector Search Best Practices](https://github.com/pgvector/pgvector#best-practices)
