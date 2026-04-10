package com.smartcampus.model;

public final class NotificationType {

    private NotificationType() {}

    // Ticket events
    public static final String TICKET_CREATED = "TICKET_CREATED";
    public static final String TICKET_ASSIGNED = "TICKET_ASSIGNED";
    public static final String TICKET_STATUS_CHANGED = "TICKET_STATUS_CHANGED";
    public static final String TICKET_COMMENT_ADDED = "TICKET_COMMENT_ADDED";

    // Auth / admin events
    public static final String USER_REGISTERED = "USER_REGISTERED";
    public static final String USER_ACTIVATED = "USER_ACTIVATED";
    public static final String USER_ROLE_CHANGED = "USER_ROLE_CHANGED";
    public static final String USER_SUSPENDED = "USER_SUSPENDED";
}
