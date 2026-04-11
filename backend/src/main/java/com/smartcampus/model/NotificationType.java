package com.smartcampus.model;

public final class NotificationType {

    private NotificationType() {}

    // Ticket events
    public static final String TICKET_CREATED = "TICKET_CREATED";
    public static final String TICKET_ASSIGNED = "TICKET_ASSIGNED";
    public static final String TICKET_STATUS_CHANGED = "TICKET_STATUS_CHANGED";
    public static final String TICKET_COMMENT_ADDED = "TICKET_COMMENT_ADDED";

    // Booking events
    public static final String BOOKING_CREATED = "BOOKING_CREATED";
    public static final String BOOKING_APPROVED = "BOOKING_APPROVED";
    public static final String BOOKING_REJECTED = "BOOKING_REJECTED";
    public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";

    // Auth / admin events
    public static final String USER_REGISTERED = "USER_REGISTERED";
    public static final String USER_ACTIVATED = "USER_ACTIVATED";
    public static final String USER_ROLE_CHANGED = "USER_ROLE_CHANGED";
    public static final String USER_SUSPENDED = "USER_SUSPENDED";
}
