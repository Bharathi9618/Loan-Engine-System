package com.loanengine.service;

import com.loanengine.dto.LoanDtos;
import com.loanengine.exception.ApiException;
import com.loanengine.model.EligibilityResult;
import com.loanengine.model.LoanApplication;
import com.loanengine.repository.EligibilityResultRepository;
import com.loanengine.repository.LoanApplicationRepository;
import com.loanengine.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanEligibilityService {

    private final LoanApplicationRepository applicationRepository;
    private final EligibilityResultRepository resultRepository;
    private final RuleEngineService ruleEngineService;

    @Transactional
    public LoanDtos.EligibilityResultResponse apply(LoanDtos.LoanApplicationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        LoanApplication application = LoanApplication.builder()
                .userId(userId)
                .loanAmount(request.getLoanAmount())
                .tenureMonths(request.getTenureMonths())
                .annualIncome(request.getAnnualIncome())
                .existingEmi(request.getExistingEmi())
                .creditScore(request.getCreditScore())
                .employmentType(request.getEmploymentType())
                .employmentYears(request.getEmploymentYears())
                .loanPurpose(request.getLoanPurpose())
                .build();
        application = applicationRepository.save(application);

        RuleEngineService.RuleEngineResult engineResult = ruleEngineService.evaluate(application);

        EligibilityResult result = EligibilityResult.builder()
                .applicationId(application.getId())
                .outcome(engineResult.outcome())
                .score(engineResult.score())
                .maxScore(engineResult.maxScore())
                .ruleDetails(engineResult.ruleDetailsJson())
                .message(engineResult.message())
                .build();
        resultRepository.save(result);

        return toResponse(application, engineResult);
    }

    public LoanDtos.EligibilityResultResponse getResult(Long applicationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        LoanApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException("Application not found", HttpStatus.NOT_FOUND));

        if (!application.getUserId().equals(userId) && !SecurityUtils.getCurrentUser().role().equals("ADMIN")) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
        }

        EligibilityResult result = resultRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ApiException("Result not found", HttpStatus.NOT_FOUND));

        return toResponse(application, result);
    }

    public List<LoanApplication> getUserApplications() {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.getCurrentUserId());
    }

    private LoanDtos.EligibilityResultResponse toResponse(LoanApplication app, RuleEngineService.RuleEngineResult engineResult) {
        LoanDtos.EligibilityResultResponse response = new LoanDtos.EligibilityResultResponse();
        response.setApplicationId(app.getId());
        response.setOutcome(engineResult.outcome());
        response.setScore(engineResult.score());
        response.setMaxScore(engineResult.maxScore());
        response.setScorePercentage(engineResult.maxScore() > 0
                ? (engineResult.score() * 100.0) / engineResult.maxScore() : 0);
        response.setMessage(engineResult.message());
        response.setDetails(engineResult.details());
        response.setLoanAmount(app.getLoanAmount());
        response.setTenureMonths(app.getTenureMonths());
        response.setCreditScore(app.getCreditScore());
        return response;
    }

    private LoanDtos.EligibilityResultResponse toResponse(LoanApplication app, EligibilityResult result) {
        LoanDtos.EligibilityResultResponse response = new LoanDtos.EligibilityResultResponse();
        response.setApplicationId(app.getId());
        response.setOutcome(result.getOutcome());
        response.setScore(result.getScore());
        response.setMaxScore(result.getMaxScore());
        response.setScorePercentage(result.getMaxScore() > 0
                ? (result.getScore() * 100.0) / result.getMaxScore() : 0);
        response.setMessage(result.getMessage());
        response.setEvaluatedAt(result.getEvaluatedAt());
        response.setLoanAmount(app.getLoanAmount());
        response.setTenureMonths(app.getTenureMonths());
        response.setCreditScore(app.getCreditScore());
        return response;
    }
}
