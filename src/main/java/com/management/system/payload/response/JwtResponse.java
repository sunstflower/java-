package com.management.system.payload.response;
//生JWT给前端

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;    
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String role;
    
    /**
     * {
     * "token": "",
     * "id": ,
     * "username": "",
     * "email": "",
     * "role": ""
     * }
     */
} 