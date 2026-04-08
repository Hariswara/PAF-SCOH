package com.smartcampus.resource;

import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.Resource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // your React dev server
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceDTO dto) {
        ResourceResponseDTO response = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}