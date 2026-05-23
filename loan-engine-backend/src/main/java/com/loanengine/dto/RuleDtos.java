package com.loanengine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public final class RuleDtos {

    private RuleDtos() {}

    @Data
    public static class RuleRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String fieldName;
        @NotBlank
        private String operator;
        @NotBlank
        private String thresholdValue;
        @NotNull
        private Integer weight;
        @NotNull
        private Integer priority;
        private boolean active = true;
        private String description;
    }

    @Data
    public static class RuleResponse {
        private Long id;
        private String name;
        private String fieldName;
        private String operator;
        private String thresholdValue;
        private int weight;
        private int priority;
        private boolean active;
        private String description;
    }
}
