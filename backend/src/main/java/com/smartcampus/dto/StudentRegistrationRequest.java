package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentRegistrationRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Name must only contain letters and spaces")
    String fullName,

    @NotBlank(message = "Student ID is required")
    @Size(min = 8, max = 15, message = "Student ID must be between 8 and 15 characters")
    String studentId,

    @NotBlank(message = "Department is required")
    String department,

    String phone
) {}
