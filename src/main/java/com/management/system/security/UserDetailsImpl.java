package com.management.system.security;

/**
 * 用户详细信息实现类
 * 定义了一个实现 Spring Security 
 * @ UserDetails 接口的类
 * 业务模型 -> 安全模型
 */

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.management.system.model.User;
import org.springframework.security.core.GrantedAuthority; // 授权
import org.springframework.security.core.authority.SimpleGrantedAuthority; // 简单授权
import org.springframework.security.core.userdetails.UserDetails; // 用户详细信息

import java.util.Collection; 
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails { 
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;
    private String qrCodeSecret; // 二维码密钥

    @JsonIgnore // 忽略JSON序列化
    private String password; 

    private Collection<? extends GrantedAuthority> authorities; // 授权

    public UserDetailsImpl(Long id, String username, String email, String password, String qrCodeSecret,
                           Collection<? extends GrantedAuthority> authorities) { 
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.qrCodeSecret = qrCodeSecret;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {   
        List<GrantedAuthority> authorities = Collections.singletonList( // 单例列表
                new SimpleGrantedAuthority( //格式为ROLE
                    user.getRole().name())); // 简单授权

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getQrCodeSecret(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getQrCodeSecret() {
        return qrCodeSecret;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() { // 账户是否过期
        return true;
    }

    @Override
    public boolean isAccountNonLocked() { // 账户是否锁定
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() { // 凭证是否过期
        return true;
    }

    @Override
    public boolean isEnabled() {        // 账户是否启用
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
} 