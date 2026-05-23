package com.loanengine.controller;

import com.loanengine.dto.LoanDtos;
import com.loanengine.model.LoanApplication;
import com.loanengine.service.LoanEligibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loan")
@RequiredArgsConstructor
public class LoanApplicationController {

    private final LoanEligibilityService loanEligibilityService;

    @PostMapping("/apply")
    public ResponseEntity<LoanDtos.EligibilityResultResponse> apply(
            @Valid @RequestBody LoanDtos.LoanApplicationRequest request) {
        return ResponseEntity.ok(loanEligibilityService.apply(request));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<LoanDtos.EligibilityResultResponse> getResult(@PathVariable Long id) {
        return ResponseEntity.ok(loanEligibilityService.getResult(id));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<LoanApplication>> myApplications() {
        return ResponseEntity.ok(loanEligibilityService.getUserApplications());
    }
}
