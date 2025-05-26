package com.management.system.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class MessageResponse {
    private String message;
    
    public MessageResponse() {
    }
    
    public MessageResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
} 