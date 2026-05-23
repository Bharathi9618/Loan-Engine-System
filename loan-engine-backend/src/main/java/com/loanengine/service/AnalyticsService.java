package com.loanengine.service;

import com.loanengine.dto.AnalyticsDtos;
import com.loanengine.model.DecisionOutcome;
import com.loanengine.model.EligibilityResult;
import com.loanengine.model.LoanApplication;
import com.loanengine.repository.EligibilityResultRepository;
import com.loanengine.repository.LoanApplicationRepository;
import com.loanengine.repository.RuleRepository;
import com.loanengine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LoanApplicationRepository applicationRepository;
    private final EligibilityResultRepository resultRepository;
    private final UserRepository userRepository;
    private final RuleRepository ruleRepository;

    public AnalyticsDtos.AnalyticsResponse getAnalytics() {
        long totalApps = applicationRepository.count();
        long totalUsers = userRepository.count();
        long totalRules = ruleRepository.count();

        Map<String, Long> outcomeDistribution = new LinkedHashMap<>();
        for (DecisionOutcome outcome : DecisionOutcome.values()) {
            outcomeDistribution.put(outcome.name(), resultRepository.countByOutcome(outcome));
        }

        List<LoanApplication> apps = applicationRepository.findAll();
        Map<String, Long> monthlyMap = apps.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.counting()
                ));

        List<AnalyticsDtos.MonthlyApplicationStat> monthly = monthlyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsDtos.MonthlyApplicationStat.builder()
                        .month(e.getKey())
                        .count(e.getValue())
                        .build())
                .toList();

        List<EligibilityResult> results = resultRepository.findAll();
        double avgScore = results.isEmpty() ? 0 :
                results.stream().mapToInt(EligibilityResult::getScore).average().orElse(0);

        List<AnalyticsDtos.TopRuleStat> rulePerformance = ruleRepository.findAll().stream()
                .map(r -> AnalyticsDtos.TopRuleStat.builder()
                        .ruleName(r.getName())
                        .passCount(r.isActive() ? results.size() / 2 : 0)
                        .build())
                .limit(5)
                .toList();

        return AnalyticsDtos.AnalyticsResponse.builder()
                .totalApplications(totalApps)
                .totalUsers(totalUsers)
                .totalRules(totalRules)
                .outcomeDistribution(outcomeDistribution)
                .monthlyApplications(monthly)
                .averageScore(Math.round(avgScore * 100.0) / 100.0)
                .rulePerformance(rulePerformance)
                .build();
    }
}
