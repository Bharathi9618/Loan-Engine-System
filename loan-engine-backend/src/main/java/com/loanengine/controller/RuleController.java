package com.loanengine.controller;

import com.loanengine.dto.RuleDtos;
import com.loanengine.service.RuleManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rules")
@RequiredArgsConstructor
public class RuleController {

    private final RuleManagementService ruleManagementService;

    @GetMapping
    public ResponseEntity<List<RuleDtos.RuleResponse>> getRules() {
        return ResponseEntity.ok(ruleManagementService.getAllRules());
    }

    @PostMapping
    public ResponseEntity<RuleDtos.RuleResponse> createRule(@Valid @RequestBody RuleDtos.RuleRequest request) {
        return ResponseEntity.ok(ruleManagementService.createRule(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RuleDtos.RuleResponse> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody RuleDtos.RuleRequest request) {
        return ResponseEntity.ok(ruleManagementService.updateRule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        ruleManagementService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
}
