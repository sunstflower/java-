package com.management.system.config;

import com.management.system.security.JwtAuthenticationEntryPoint;        
import com.management.system.security.JwtAuthenticationFilter;            
import com.management.system.service.UserDetailsServiceImpl;              
import org.springframework.context.annotation.Bean;                     // 注解
import org.springframework.context.annotation.Configuration;                
import org.springframework.security.authentication.AuthenticationManager;    
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; // 认证管理器构建器
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; // 认证提供者
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration; // 认证配置
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity; // 全局方法安全
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // 安全配置
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // 启用Web安全
import org.springframework.security.config.http.SessionCreationPolicy; // 会话创建策略
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 密码编码器
import org.springframework.security.crypto.password.PasswordEncoder; // 密码编码器
import org.springframework.security.web.SecurityFilterChain; // 安全过滤器链
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // 用户名密码认证过滤器
import org.springframework.web.cors.CorsConfiguration; // 跨域配置
import org.springframework.web.cors.CorsConfigurationSource; // 跨域配置源
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; 

import java.util.Arrays;

@Configuration 
@EnableWebSecurity 
@EnableGlobalMethodSecurity(prePostEnabled = true) 
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService, JwtAuthenticationEntryPoint unauthorizedHandler) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
            .antMatchers("/api/auth/**").permitAll()
            .antMatchers("/api/public/**").permitAll()
            .antMatchers("/api/class-join/join").permitAll()
            .antMatchers("/api/attendance/verify").permitAll()
            .antMatchers("/api/attendance/checkin-with-user").permitAll()
            .antMatchers("/h2-console/**").permitAll()
            .anyRequest().authenticated();

        http.headers().frameOptions().sameOrigin();
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
} 