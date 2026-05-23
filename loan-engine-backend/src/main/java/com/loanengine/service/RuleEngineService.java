package com.loanengine.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loanengine.dto.LoanDtos;
import com.loanengine.model.DecisionOutcome;
import com.loanengine.model.LoanApplication;
import com.loanengine.model.Rule;
import com.loanengine.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Priority-based rule engine with weighted scoring.
 * Rules execute in ascending priority order; each passed rule contributes its weight.
 */
@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final RuleRepository ruleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RuleEngineResult evaluate(LoanApplication application) {
        List<Rule> rules = ruleRepository.findByActiveTrueOrderByPriorityAsc();
        List<LoanDtos.RuleEvaluationDetail> details = new ArrayList<>();
        int score = 0;
        int maxScore = 0;
        boolean hasCriticalFailure = false;

        Map<String, Object> context = buildContext(application);

        for (Rule rule : rules) {
            maxScore += rule.getWeight();
            boolean passed = evaluateRule(rule, context);
            int earned = passed ? rule.getWeight() : 0;
            score += earned;

            if (!passed && rule.getWeight() >= 20) {
                hasCriticalFailure = true;
            }

            LoanDtos.RuleEvaluationDetail detail = new LoanDtos.RuleEvaluationDetail();
            detail.setRuleName(rule.getName());
            detail.setPassed(passed);
            detail.setWeightEarned(earned);
            detail.setWeightMax(rule.getWeight());
            detail.setReason(passed ? "Passed" : "Failed: " + rule.getDescription());
            details.add(detail);
        }

        DecisionOutcome outcome = determineOutcome(score, maxScore, hasCriticalFailure);
        String message = buildMessage(outcome, score, maxScore);

        String ruleDetailsJson;
        try {
            ruleDetailsJson = objectMapper.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            ruleDetailsJson = "[]";
        }

        return new RuleEngineResult(outcome, score, maxScore, message, details, ruleDetailsJson);
    }

    private Map<String, Object> buildContext(LoanApplication app) {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("loanAmount", app.getLoanAmount());
        ctx.put("annualIncome", app.getAnnualIncome());
        ctx.put("creditScore", app.getCreditScore());
        ctx.put("employmentYears", app.getEmploymentYears());
        ctx.put("existingEmi", app.getExistingEmi());
        ctx.put("tenureMonths", app.getTenureMonths());

        BigDecimal monthlyIncome = app.getAnnualIncome().divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal proposedEmi = app.getLoanAmount()
                .divide(BigDecimal.valueOf(app.getTenureMonths()), 2, RoundingMode.HALF_UP);
        BigDecimal totalEmi = app.getExistingEmi().add(proposedEmi);
        BigDecimal dti = monthlyIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalEmi.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                : BigDecimal.ONE;
        ctx.put("debtToIncomeRatio", dti);
        return ctx;
    }

    private boolean evaluateRule(Rule rule, Map<String, Object> context) {
        Object fieldValue = context.get(rule.getFieldName());
        if (fieldValue == null) {
            return false;
        }

        String operator = rule.getOperator().toUpperCase();
        String threshold = rule.getThresholdValue();

        return switch (operator) {
            case "GTE" -> compareNumbers(fieldValue, threshold) >= 0;
            case "LTE" -> compareNumbers(fieldValue, threshold) <= 0;
            case "GT" -> compareNumbers(fieldValue, threshold) > 0;
            case "LT" -> compareNumbers(fieldValue, threshold) < 0;
            case "EQ" -> compareNumbers(fieldValue, threshold) == 0;
            case "NEQ" -> compareNumbers(fieldValue, threshold) != 0;
            default -> false;
        };
    }

    private int compareNumbers(Object fieldValue, String threshold) {
        BigDecimal left = new BigDecimal(fieldValue.toString());
        BigDecimal right = new BigDecimal(threshold);
        return left.compareTo(right);
    }

    private DecisionOutcome determineOutcome(int score, int maxScore, boolean hasCriticalFailure) {
        if (maxScore == 0) {
            return DecisionOutcome.REVIEW;
        }
        double percentage = (score * 100.0) / maxScore;

        if (hasCriticalFailure && percentage < 60) {
            return DecisionOutcome.REJECTED;
        }
        if (percentage >= 80) {
            return DecisionOutcome.APPROVED;
        }
        if (percentage >= 50) {
            return DecisionOutcome.REVIEW;
        }
        return DecisionOutcome.REJECTED;
    }

    private String buildMessage(DecisionOutcome outcome, int score, int maxScore) {
        return switch (outcome) {
            case APPROVED -> String.format("Congratulations! Your application is approved (score %d/%d).", score, maxScore);
            case REVIEW -> String.format("Your application requires manual review (score %d/%d).", score, maxScore);
            case REJECTED -> String.format("Unfortunately, your application was rejected (score %d/%d).", score, maxScore);
        };
    }

    public record RuleEngineResult(
            DecisionOutcome outcome,
            int score,
            int maxScore,
            String message,
            List<LoanDtos.RuleEvaluationDetail> details,
            String ruleDetailsJson
    ) {}
}
