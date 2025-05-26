package com.management.system.security; 

/**
 * JWT工具类,生成、解析和验证 JWT 令牌
 */ 

import io.jsonwebtoken.*;   
import org.slf4j.Logger;    // 日志
import org.slf4j.LoggerFactory; // 日志工厂
import org.springframework.beans.factory.annotation.Value; // 自动注入
import org.springframework.security.core.Authentication; // 认证
import org.springframework.security.core.userdetails.UserDetails; // 用户详细信息
import org.springframework.stereotype.Component; // 组件

// 芝士实用类
import java.util.Date;
import java.util.function.Function;

@Component // 组件
public class JwtTokenUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class); // 日志

    @Value("${jwt.secret}")
    private String secret; //JWT密钥,从配置文件读取

    @Value("${jwt.expiration}")
    private Long expiration; // 过期时间

    public String generateJwtToken(Authentication authentication) { // 生成JWT令牌
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal(); // 获取用户详细信息(强转)

        return Jwts.builder() // 构建JWT令牌
                /*{
                  "sub": 用户名
                  "iat": 签发时间
                  "exp": 过期时间
                }*/
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date()) // 签发时间
                .setExpiration(new Date((new Date()).getTime() + expiration)) // 过期时间

                // 签名算法 
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public String getUsernameFromToken(String token) { // 从JWT令牌中获取用户名
        return getClaimFromToken(token, Claims::getSubject); //Claims断言
    }

    public Date getExpirationDateFromToken(String token) { // 获取过期时间
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) { // 获取声明
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    // 通用方法：获取 JWT 中的proylod（Claims）
    private Claims getAllClaimsFromToken(String token) { // 获取所有声明
        return Jwts.parser()
            .setSigningKey(secret)  // 设置签名密钥
            .parseClaimsJws(token)  // 解析 JWT
            .getBody();  // 获取负载（Claims）
    }

    private Boolean isTokenExpired(String token) { // 判断令牌是否过期
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) { // 验证令牌
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
} 