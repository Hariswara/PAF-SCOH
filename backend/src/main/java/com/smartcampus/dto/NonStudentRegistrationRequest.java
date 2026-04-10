package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record NonStudentRegistrationRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String fullName,

    @Size(max = 20)
    String phone,

    @Email(message = "Contact email must be valid")
    @Size(max = 255)
    String contactEmail,

    @Pattern(regexp = "^(MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY)?$", message = "Invalid gender value")
    String gender,

    @Size(max = 255)
    String department
) {}
