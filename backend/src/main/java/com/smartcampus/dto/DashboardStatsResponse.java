package com.smartcampus.dto;

public record DashboardStatsResponse(
    long totalUsers,
    long activeDomains,
    long pendingActivations,
    long systemAlerts
) {}
