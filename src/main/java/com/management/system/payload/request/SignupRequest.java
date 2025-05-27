package com.management.system.payload.request;

import com.management.system.model.ERole;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest { //注册の请求DTO
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    private ERole role;
    
    private String userId;

    /* {
     *  "username": 用户名 2-20,
     *  "email": 邮箱 50,
     *  "password": 密码 6-40,
     *  "role": 角色,
     *  "userId": 用户ID
     * }
     */ 
} 