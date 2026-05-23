package com.loanengine.service;

import com.loanengine.dto.RuleDtos;
import com.loanengine.exception.ApiException;
import com.loanengine.model.Rule;
import com.loanengine.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleManagementService {

    private final RuleRepository ruleRepository;

    public List<RuleDtos.RuleResponse> getAllRules() {
        return ruleRepository.findAllByOrderByPriorityAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public RuleDtos.RuleResponse createRule(RuleDtos.RuleRequest request) {
        Rule rule = Rule.builder()
                .name(request.getName())
                .fieldName(request.getFieldName())
                .operator(request.getOperator())
                .thresholdValue(request.getThresholdValue())
                .weight(request.getWeight())
                .priority(request.getPriority())
                .active(request.isActive())
                .description(request.getDescription())
                .build();
        return toResponse(ruleRepository.save(rule));
    }

    public RuleDtos.RuleResponse updateRule(Long id, RuleDtos.RuleRequest request) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Rule not found", HttpStatus.NOT_FOUND));
        rule.setName(request.getName());
        rule.setFieldName(request.getFieldName());
        rule.setOperator(request.getOperator());
        rule.setThresholdValue(request.getThresholdValue());
        rule.setWeight(request.getWeight());
        rule.setPriority(request.getPriority());
        rule.setActive(request.isActive());
        rule.setDescription(request.getDescription());
        return toResponse(ruleRepository.save(rule));
    }

    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new ApiException("Rule not found", HttpStatus.NOT_FOUND);
        }
        ruleRepository.deleteById(id);
    }

    private RuleDtos.RuleResponse toResponse(Rule rule) {
        RuleDtos.RuleResponse r = new RuleDtos.RuleResponse();
        r.setId(rule.getId());
        r.setName(rule.getName());
        r.setFieldName(rule.getFieldName());
        r.setOperator(rule.getOperator());
        r.setThresholdValue(rule.getThresholdValue());
        r.setWeight(rule.getWeight());
        r.setPriority(rule.getPriority());
        r.setActive(rule.isActive());
        r.setDescription(rule.getDescription());
        return r;
    }
}
