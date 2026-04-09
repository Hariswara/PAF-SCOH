package com.smartcampus.resource;

import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponseDTO createResource(ResourceDTO dto) {
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
                .domainId(dto.getDomainId())       
                .build();

        return mapToResponseDTO(resourceRepository.save(resource));
    }

    public List<ResourceResponseDTO> searchResources(
            String name, String location, Integer capacity, String type) {
        return resourceRepository
                .searchResources(
                    name == null || name.isBlank() ? null : name,
                    location == null || location.isBlank() ? null : location,
                    capacity,
                    type == null || type.isBlank() ? null : type  
                )
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

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
                .domainId(resource.getDomainId())   
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}