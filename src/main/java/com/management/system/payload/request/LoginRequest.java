package com.management.system.payload.request;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest { //登录の请求DTO
    @NotBlank
    private String username;

    @NotBlank
    private String password;
    
} 