package com.example.rag.service;

import com.example.rag.config.AIProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EmbeddingService {

    private final AIProperties aiProperties;
    private final EmbeddingModel embeddingModel;

    public EmbeddingService(
            AIProperties aiProperties,
            EmbeddingModel embeddingModel) {
        this.aiProperties = aiProperties;
        this.embeddingModel = embeddingModel;
    }

    /**
     * Generate embeddings for a single text using configured AI provider
     * 
     * @param text The text to embed
     * @return Embedding vector as float array
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            log.warn("Empty text provided for embedding");
            return new float[0];
        }

        try {
            EmbeddingRequest request = new EmbeddingRequest(
                    List.of(text),
                    null);

            EmbeddingResponse response = embeddingModel.call(request);

            if (response != null && !response.getResults().isEmpty()) {
                Object output = response.getResults().get(0).getOutput();
                if (output instanceof float[]) {
                    return (float[]) output;
                } else if (output instanceof List) {
                    return convertToFloatArray((List<Double>) output);
                }
            }

            log.error("Failed to generate embedding: empty response");
            return new float[0];

        } catch (Exception e) {
            log.error("Error generating embedding: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     * 
     * @param texts List of texts to embed
     * @return List of embedding vectors
     */
    public List<float[]> generateEmbeddings(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            log.warn("Empty text list provided for embedding");
            return List.of();
        }

        try {
            EmbeddingRequest request = new EmbeddingRequest(texts, null);
            EmbeddingResponse response = embeddingModel.call(request);

            if (response != null && !response.getResults().isEmpty()) {
                List<?> embeddings = response.getResults().stream()
                        .map(result -> result.getOutput())
                        .toList();

                return embeddings.stream()
                        .map(output -> {
                            if (output instanceof float[]) {
                                return (float[]) output;
                            } else if (output instanceof List) {
                                return convertToFloatArray((List<Double>) output);
                            }
                            return new float[0];
                        })
                        .toList();
            }

            log.error("Failed to generate embeddings: empty response");
            return List.of();

        } catch (Exception e) {
            log.error("Error generating embeddings: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate embeddings", e);
        }
    }

    /**
     * Get current provider name
     * 
     * @return Provider name (ollama)
     */
    public String getCurrentProvider() {
        return "ollama";
    }

    /**
     * Convert List<Double> to float array for pgvector
     * 
     * @param embedding Embedding as List<Double>
     * @return float array
     */
    private float[] convertToFloatArray(List<Double> embedding) {
        if (embedding == null) {
            return new float[0];
        }

        float[] result = new float[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            result[i] = embedding.get(i).floatValue();
        }
        return result;
    }

    /**
     * Get embedding dimension based on provider
     * 
     * @return Embedding dimension
     */
    public int getEmbeddingDimension() {
        return 768; // Ollama nomic-embed-text embedding dimension
    }
}
