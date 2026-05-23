package com.loanengine.repository;

import com.loanengine.model.DecisionOutcome;
import com.loanengine.model.EligibilityResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EligibilityResultRepository extends JpaRepository<EligibilityResult, Long> {
    Optional<EligibilityResult> findByApplicationId(Long applicationId);
    long countByOutcome(DecisionOutcome outcome);

    @Query("SELECT e.outcome, COUNT(e) FROM EligibilityResult e GROUP BY e.outcome")
    List<Object[]> countByOutcomeGrouped();
}
