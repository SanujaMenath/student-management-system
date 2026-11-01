CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.nursery_knowledge (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,           -- 'admissions', 'fees', 'schedule'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768)             -- 768 dimensions for text-embedding-004
);

-- Cosine similarity match function
CREATE OR REPLACE FUNCTION match_nursery_knowledge(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    1 - (nursery_knowledge.embedding <=> query_embedding) AS similarity
  FROM nursery_knowledge
  WHERE 1 - (nursery_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;