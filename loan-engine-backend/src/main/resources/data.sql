-- Default eligibility rules (users seeded via DataInitializer)
INSERT INTO rules (id, name, field_name, operator, threshold_value, weight, priority, active, description)
SELECT 1, 'Minimum Credit Score', 'creditScore', 'GTE', '650', 25, 1, true, 'Credit score must be at least 650'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE id = 1);

INSERT INTO rules (id, name, field_name, operator, threshold_value, weight, priority, active, description)
SELECT 2, 'Minimum Annual Income', 'annualIncome', 'GTE', '300000', 20, 2, true, 'Annual income at least 3 lakh'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE id = 2);

INSERT INTO rules (id, name, field_name, operator, threshold_value, weight, priority, active, description)
SELECT 3, 'Debt-to-Income Ratio', 'debtToIncomeRatio', 'LTE', '0.40', 20, 3, true, 'DTI must not exceed 40%'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE id = 3);

INSERT INTO rules (id, name, field_name, operator, threshold_value, weight, priority, active, description)
SELECT 4, 'Employment Stability', 'employmentYears', 'GTE', '2', 15, 4, true, 'At least 2 years employment'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE id = 4);

INSERT INTO rules (id, name, field_name, operator, threshold_value, weight, priority, active, description)
SELECT 5, 'Loan Amount Cap', 'loanAmount', 'LTE', '5000000', 20, 5, true, 'Loan amount within 50 lakh cap'
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE id = 5);
