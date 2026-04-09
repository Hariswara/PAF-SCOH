package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String fullName,

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    String phone,

    @Email(message = "Contact email must be a valid email address")
    @Size(max = 255)
    String contactEmail,

    @Pattern(regexp = "^(MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY)?$", message = "Invalid gender value")
    String gender,

    @Size(max = 255, message = "Department must be at most 255 characters")
    String department
) {}
