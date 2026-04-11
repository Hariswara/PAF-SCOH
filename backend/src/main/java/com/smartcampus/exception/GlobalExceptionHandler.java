package com.smartcampus.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Validation errors (DTO @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // Invalid JSON / request body issues
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestBody(HttpMessageNotReadableException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("message", "Request body is invalid or malformed");

        return ResponseEntity.badRequest().body(body);
    }

    // Not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // Custom business errors
    @ExceptionHandler(TicketAttachmentLimitException.class)
    public ResponseEntity<Map<String, Object>> handleAttachmentLimit(TicketAttachmentLimitException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("message", ex.getMessage());

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedActionException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // Business rule violations (like booking status issues)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // Bad request errors
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("message", ex.getMessage());

        return ResponseEntity.badRequest().body(body);
    }

    // Catch-all (unexpected crashes)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {

        ex.printStackTrace(); // VERY IMPORTANT for debugging

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Unexpected server error");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}