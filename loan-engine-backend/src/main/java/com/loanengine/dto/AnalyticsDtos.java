package com.loanengine.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

public final class AnalyticsDtos {

    private AnalyticsDtos() {}

    @Data
    @Builder
    public static class AnalyticsResponse {
        private long totalApplications;
        private long totalUsers;
        private long totalRules;
        private Map<String, Long> outcomeDistribution;
        private List<MonthlyApplicationStat> monthlyApplications;
        private double averageScore;
        private List<TopRuleStat> rulePerformance;
    }

    @Data
    @Builder
    public static class MonthlyApplicationStat {
        private String month;
        private long count;
    }

    @Data
    @Builder
    public static class TopRuleStat {
        private String ruleName;
        private long passCount;
    }
}
