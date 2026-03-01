package com.smartcampus.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/greet")
    public Map<String, String> greet() {
        return Map.of("message", "Hello from Smart Campus!");
    }
}
