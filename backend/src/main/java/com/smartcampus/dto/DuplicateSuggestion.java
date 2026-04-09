package com.smartcampus.dto;

import java.util.UUID;

public record DuplicateSuggestion(
        UUID ticketId,
        String location,
        String descriptionSnippet,
        String status,
        float relevanceScore) {
}
