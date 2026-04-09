package com.smartcampus.exception;

public class TicketAttachmentLimitException extends RuntimeException {
    public TicketAttachmentLimitException(String message) {
        super(message);
    }
}
