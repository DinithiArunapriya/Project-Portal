package com.projectportal.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static String role() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) return "UNKNOWN";
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("UNKNOWN");
    }

    public static boolean isAnyRole(String... roles) {
        String r = role();
        for (String allowed : roles) {
            if (allowed.equalsIgnoreCase(r)) return true;
        }
        return false;
    }
}
