package com.loanengine.dto;

import com.loanengine.model.DecisionOutcome;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class LoanDtos {

    private LoanDtos() {}

    @Data
    public static class LoanApplicationRequest {
        @NotNull @DecimalMin("10000")
        private BigDecimal loanAmount;
        @Min(6) @Max(360)
        private int tenureMonths;
        @NotNull @DecimalMin("0")
        private BigDecimal annualIncome;
        @NotNull @DecimalMin("0")
        private BigDecimal existingEmi;
        @Min(300) @Max(900)
        private int creditScore;
        @NotBlank
        private String employmentType;
        @Min(0) @Max(50)
        private int employmentYears;
        private String loanPurpose;
    }

    @Data
    public static class RuleEvaluationDetail {
        private String ruleName;
        private boolean passed;
        private int weightEarned;
        private int weightMax;
        private String reason;
    }

    @Data
    public static class EligibilityResultResponse {
        private Long applicationId;
        private DecisionOutcome outcome;
        private int score;
        private int maxScore;
        private double scorePercentage;
        private String message;
        private List<RuleEvaluationDetail> details;
        private LocalDateTime evaluatedAt;
        private BigDecimal loanAmount;
        private int tenureMonths;
        private int creditScore;
    }
}
