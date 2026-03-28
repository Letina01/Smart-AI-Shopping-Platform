package com.smart.shopping.authservice.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class GoogleOAuthCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String clientId = context.getEnvironment().getProperty("GOOGLE_CLIENT_ID", "");
        String clientSecret = context.getEnvironment().getProperty("GOOGLE_CLIENT_SECRET", "");
        return !clientId.isBlank() && !clientSecret.isBlank();
    }
}
