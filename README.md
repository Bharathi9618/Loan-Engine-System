# Loan Eligibility Engine

Rule-based loan eligibility evaluation system with React + TypeScript frontend and Spring Boot backend.

## Project Structure

```
loan-engine-frontend/   → React + Vite + Tailwind
loan-engine-backend/    → Spring Boot + JPA + JWT + PostgreSQL/H2
```

## Quick Start

### Backend (IntelliJ IDEA / Maven)

```bash
cd loan-engine-backend
mvn spring-boot:run
```

Runs on **http://localhost:8080**

**Demo accounts** (auto-seeded):
| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@loanengine.com    | Admin@123 |
| User  | user@loanengine.com     | User@123  |

**OTP in dev mode:** OTPs are printed in the backend console (no SMTP required).

### Frontend (VS Code)

```bash
cd loan-engine-frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** (proxies `/api` → backend)

## Database Schema

### users
| Column         | Type    | Description                |
|----------------|---------|----------------------------|
| id             | BIGINT  | Primary key                |
| email          | VARCHAR | Unique                     |
| password       | VARCHAR | BCrypt hashed              |
| first_name     | VARCHAR |                            |
| last_name      | VARCHAR |                            |
| role           | ENUM    | USER, ADMIN                |
| email_verified | BOOLEAN |                            |
| created_at     | TIMESTAMP |                          |

### otp_tokens
| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | BIGINT    | Primary key                          |
| email      | VARCHAR   |                                      |
| otp_hash   | VARCHAR   | BCrypt hash (never plain text)       |
| type       | ENUM      | EMAIL_VERIFICATION, PASSWORD_RESET   |
| expires_at | TIMESTAMP | 5-minute validity                    |
| used       | BOOLEAN   | One-time use                         |
| created_at | TIMESTAMP |                                      |

### loan_applications
| Column            | Type    | Description        |
|-------------------|---------|--------------------|
| id                | BIGINT  | Primary key        |
| user_id           | BIGINT  | FK → users         |
| loan_amount       | DECIMAL |                    |
| tenure_months     | INT     |                    |
| annual_income     | DECIMAL |                    |
| existing_emi      | DECIMAL |                    |
| credit_score      | INT     |                    |
| employment_type   | VARCHAR |                    |
| employment_years  | INT     |                    |
| loan_purpose      | VARCHAR |                    |
| created_at        | TIMESTAMP |                  |

### rules
| Column           | Type    | Description                          |
|------------------|---------|--------------------------------------|
| id               | BIGINT  | Primary key                          |
| name             | VARCHAR | Rule display name                    |
| field_name       | VARCHAR | creditScore, annualIncome, etc.      |
| operator         | VARCHAR | GTE, LTE, GT, LT, EQ                 |
| threshold_value  | VARCHAR | Comparison value                     |
| weight           | INT     | Score contribution                   |
| priority         | INT     | Execution order (ascending)          |
| active           | BOOLEAN |                                      |
| description      | VARCHAR |                                      |

### eligibility_results
| Column         | Type    | Description                    |
|----------------|---------|--------------------------------|
| id             | BIGINT  | Primary key                    |
| application_id | BIGINT  | FK → loan_applications         |
| outcome        | ENUM    | APPROVED, REJECTED, REVIEW     |
| score          | INT     | Weighted score earned          |
| max_score      | INT     | Total possible weight          |
| rule_details   | TEXT    | JSON rule breakdown            |
| message        | VARCHAR | Human-readable result          |
| evaluated_at   | TIMESTAMP |                              |

## API Endpoints

### Auth & OTP
| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /auth/register        | No   | Register + send OTP      |
| POST   | /auth/login           | No   | JWT login                |
| POST   | /auth/verify-email    | No   | Verify signup OTP        |
| POST   | /auth/forgot-password | No   | Send reset OTP           |
| POST   | /auth/verify-otp      | No   | Validate reset OTP       |
| POST   | /auth/reset-password  | No   | Reset password + consume OTP |
| POST   | /otp/resend           | No   | Resend OTP               |

### Loan
| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /loan/apply           | JWT  | Submit + evaluate        |
| GET    | /loan/result/{id}     | JWT  | Get eligibility result   |
| GET    | /loan/my-applications | JWT  | User's applications      |

### Admin
| Method | Endpoint           | Auth  | Description           |
|--------|--------------------|-------|-----------------------|
| GET    | /admin/rules       | ADMIN | List rules            |
| POST   | /admin/rules       | ADMIN | Create rule           |
| PUT    | /admin/rules/{id}  | ADMIN | Update rule           |
| DELETE | /admin/rules/{id}  | ADMIN | Delete rule           |
| GET    | /admin/analytics   | ADMIN | Dashboard analytics |

## API Integration (Frontend)

Axios client (`src/api/client.ts`) attaches JWT from localStorage:

```typescript
// Login
const { data } = await authApi.login({ email, password });
// data.token → stored automatically via AuthContext

// Apply for loan (authenticated)
const { data } = await loanApi.apply({
  loanAmount: 500000,
  tenureMonths: 60,
  annualIncome: 600000,
  existingEmi: 10000,
  creditScore: 720,
  employmentType: 'SALARIED',
  employmentYears: 3,
});

// data.outcome → APPROVED | REJECTED | REVIEW
```

Vite dev proxy maps `/api/*` → `http://localhost:8080/*`

## Rule Engine Logic

1. Load active rules ordered by **priority** (ascending)
2. Build context: `creditScore`, `annualIncome`, `loanAmount`, `employmentYears`, `debtToIncomeRatio`
3. Each rule evaluates with operator (GTE, LTE, etc.)
4. Passed rules contribute their **weight** to total score
5. Decision thresholds:
   - **≥80%** → APPROVED
   - **≥50%** → REVIEW
   - **<50%** or critical failure → REJECTED

## Email / SMTP Configuration

Set environment variables for production email:

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your@gmail.com
MAIL_DEV_LOG=false
JWT_SECRET=your-256-bit-secret-key-here
```

## PostgreSQL (Production)

Use profile or update `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/loanengine
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
```

Remove H2 dependency scope or disable H2 console in production.

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React, TypeScript, Vite, Tailwind, Axios, Framer Motion, Recharts |
| Backend  | Java 17, Spring Boot 3, Spring Security, JWT, JPA, JavaMail |
| Database | H2 (dev), PostgreSQL (prod)                       |
