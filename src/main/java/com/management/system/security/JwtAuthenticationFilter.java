package com.management.system.security;

/**
 * JWT过滤器
 */

import com.management.system.service.UserDetailsServiceImpl;    // 用户详细信息服务
import org.slf4j.Logger; // 日志
import org.slf4j.LoggerFactory; // 日志工厂
import org.springframework.beans.factory.annotation.Autowired; // 自动注入
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // 用户名密码认证
import org.springframework.security.core.context.SecurityContextHolder; // 安全上下文持有者
import org.springframework.security.core.userdetails.UserDetails; // 用户详细信息
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; // 网络认证详细信息源
import org.springframework.util.StringUtils; // 字符串工具类
import org.springframework.web.filter.OncePerRequestFilter; // 一次请求过滤器

import javax.servlet.FilterChain; // 过滤器链
import javax.servlet.ServletException; 
import javax.servlet.http.HttpServletRequest; // 请求
import javax.servlet.http.HttpServletResponse; // 响应
import java.io.IOException; 

public class JwtAuthenticationFilter extends OncePerRequestFilter { 
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;  // JWT工具类解析和验证 Token
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService; //UD文件中接口

    @Override
    protected void doFilterInternal(
        HttpServletRequest request, 
        HttpServletResponse response, 
        FilterChain filterChain
        ) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request); // 请求头中解析JWT
            if (jwt != null) {
                String username = jwtTokenUtil.getUsernameFromToken(jwt); // 获取用户名

                UserDetails userDetails = userDetailsService.loadUserByUsername(username); // 数据库中加载用户详细信息
                
                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken( 
                            userDetails,
                            null, 
                            userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request)); // 设置认证详细信息

                    SecurityContextHolder // 安全上下文持有者
                    .getContext() // 获取安全上下文
                    .setAuthentication(authentication); //设置认证
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response); //芝士链式调用，类似javascript的Arry.rdece，但返回值为void，所以不能return。调用流程要比JS复杂的多
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
} 