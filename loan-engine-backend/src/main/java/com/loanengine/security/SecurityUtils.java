package com.loanengine.security;

import com.loanengine.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().userId();
    }
}
