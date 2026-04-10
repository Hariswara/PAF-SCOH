package com.smartcampus.event;

import java.util.UUID;

public sealed interface UserEvent {

    UUID userId();

    record Registered(UUID userId, String fullName, String email,
                      String registrationType) implements UserEvent {}

    record Activated(UUID userId, String fullName) implements UserEvent {}

    record RoleChanged(UUID userId, String fullName, String oldRole,
                       String newRole, UUID changedBy) implements UserEvent {}

    record Suspended(UUID userId, String fullName) implements UserEvent {}
}
