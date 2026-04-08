package com.smartcampus.resource;

import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponseDTO createResource(ResourceDTO dto) {
        // Business rule: no duplicate resource names
        if (resourceRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new IllegalArgumentException(
                "A resource with the name '" + dto.getName() + "' already exists."
            );
        }

        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .availabilityWindows(dto.getAvailabilityWindows())
                .status(dto.getStatus())
                .description(dto.getDescription())
                .build();

        Resource saved = resourceRepository.save(resource);
        return mapToResponseDTO(saved);
    }

    // Reusable mapper — you'll use this in GET endpoints later
    public ResourceResponseDTO mapToResponseDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availabilityWindows(resource.getAvailabilityWindows())
                .status(resource.getStatus())
                .description(resource.getDescription())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}