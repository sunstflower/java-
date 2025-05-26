package com.management.system.security;

/**
 * 认证失败处理
 * 401 未授权
 */

import org.springframework.security.core.AuthenticationException;    // 认证失败
import org.springframework.security.web.AuthenticationEntryPoint;   // 认证失败处理
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;  // 请求
import javax.servlet.http.HttpServletResponse; // 响应
import java.io.IOException; // 异常

@Component  // Bean
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override   
    public void commence( // 认证资源失败或未授权
        HttpServletRequest request, 
        HttpServletResponse response,
        AuthenticationException authException
        ) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
} 