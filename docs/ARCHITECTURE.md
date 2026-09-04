# System Architecture & Technical Specifications

This document outlines the detailed system architecture, component boundaries, state machine lifecycle, and data flow pipelines for the **Razorpay Revenue Recovery Agent**.

---

## 1. System Architecture Diagram

```
                       [ Razorpay Payment Webhook ]
                                    │
                                    ▼
                         [ FastAPI Web Server ]
                                    │
                                    ▼
                         [ Transaction Context ]
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
 [ Signal Resolver ]                                   [ Context Engine ]
 (Structured Features:                                 (Unstructured CRM:
  IP/Card Mismatch, Failures, B2B)                      VIP, DND, Intent)
         │                                                     │
         └──────────────────────────┬──────────────────────────┘
                                    ▼
                            [ Policy Engine ]
                       (Hard Eligibility Guardrails)
                                    │
                                    ▼
                         [ Eligible Action Set ]
                                    │
                                    ▼
                           [ Decision Engine ]
                  (ML Outcome Probabilities + Cost/LTV)
                                    │
                                    ▼
                        [ Expected Utility (EU) ]
                        EU(a) = P(rec)*Amt - (1-P(rec))*P(churn)*LTV - Cost
                                    │
                                    ▼
                         [ Selected Action ]
                                    │
                                    ▼
                        [ Action Adapter Layer ]
                  (Smart_Retry, Payment_Link, Escalate, etc.)
                                    │
                                    ▼
                        [ Post-Action Verification ]
                         (Recovered / Failed / Churned)
                                    │
                                    ▼
                        [ SQLite Audit Storage ]
                                    │
                                    ▼
                      [ React 18 Dashboard & Audit ]
```

---

## 2. Component Specifications

### 2.1 Signal Resolver (`backend/services/signal_resolver.py`)
- **Purpose**: Parses raw payment metadata into structured quantitative signals.
- **Signals Resolved**:
  - `is_country_mismatch`: Boolean flag derived by comparing `card_country` vs `ip_country`.
  - `previous_failures`: Integer counter tracking consecutive failed recovery attempts.
  - `is_b2b`: Boolean indicator for corporate enterprise accounts.
  - `ltv` & `amount`: Customer Lifetime Value and current invoice amount in INR.

### 2.2 Context Engine (`backend/services/context_engine.py`)
- **Purpose**: Extracts structured intent and flags from unstructured CRM agent notes.
- **LLM Boundary**: Uses an isolated natural language extraction pipeline. It extracts flags (`is_vip`, `dnd_requested`, `preferred_channel`) into standard Pydantic models (`CRMNotesContext`).
- **Isolation Constraint**: The Context Engine has **zero access** to financial calculations, probability estimates, or action selection logic.

### 2.3 Policy Engine (`backend/services/policy_engine.py`)
- **Purpose**: Enforces non-negotiable legal, regulatory, and business guardrails before quantitative evaluation.
- **Policy Rules**:
  - `RULE_MAX_RETRY_COUNT_EXCEEDED`: Blocks `Smart_Retry` if `previous_failures >= 4`.
  - `RULE_DND_REQUESTED`: Blocks automated retries and messaging if DND is requested.
  - `RULE_FRAUD_TERMINAL`: Filters out all recovery actions and forces `STOP` if card is flagged as stolen/fraudulent.
- **Eligibility Output**: Returns an eligible action set and a map of blocked actions with explicit `block_reason` strings.

### 2.4 Decision Engine (`backend/services/decision_engine.py`)
- **Purpose**: Performs quantitative Expected Utility (EU) optimization across eligible actions.
- **ML Artifact Lookup**: Retrieves $P(\text{recovery}\mid a)$ and $P(\text{churn}\mid\text{fail}, a)$ estimates based on transaction signals and customer segment.
- **EU Calculation**: Applies the frozen Expected Utility formula for every eligible action and selects the action that maximizes EU. Blocked actions return `null` for numerical EU parameters.

### 2.5 Action Adapters & Bounded Execution (`backend/services/action_adapters.py`)
- **Purpose**: Executes the chosen action via dedicated bounded handlers (`Smart_Retry`, `Payment_Link`, `Escalate`, `Update_Method`, `STOP`).
- **Boundary**: Encapsulates external API side-effects. Returns standardized execution metadata.

### 2.6 Post-Execution Verification (`backend/services/verification_engine.py`)
- **Purpose**: Receives asynchronous payment outcome webhooks (`RECOVERED`, `FAILED_AGAIN`, `CHURNED`).
- **Accounting Logic**:
  - `RECOVERED`: Realized Utility = $\text{Amount} - \text{Action Cost}$. Churn Loss = ₹0.
  - `FAILED_AGAIN`: Realized Utility = $-\text{Action Cost}$. Churn Loss = ₹0.
  - `CHURNED`: Realized Utility = $-(\text{LTV} \times \text{margin}) - \text{Action Cost}$. Churn Loss = $\text{LTV} \times \text{margin}$.

---

## 3. Atomic State Machine Lifecycle

Transactions progress through an atomic, unidirectionally validated 7-stage state transition pipeline:

```
PAYMENT_FAILED ➔ CONTEXT_GATHERED ➔ EVALUATED ➔ ACTION_SELECTED ➔ ACTION_EXECUTED ➔ VERIFICATION_PENDING ➔ [RECOVERED | FAILED_AGAIN | CHURNED]
```

1. **`PAYMENT_FAILED`**: Initial state upon webhook receipt.
2. **`CONTEXT_GATHERED`**: Signal Resolver & Context Engine populate structured metadata.
3. **`EVALUATED`**: Policy Engine filters eligible actions and Decision Engine scores candidate actions.
4. **`ACTION_SELECTED`**: Winning candidate assigned to transaction record.
5. **`ACTION_EXECUTED`**: Action handler executed.
6. **`VERIFICATION_PENDING`**: System waits for post-execution webhook callback.
7. **Terminal State (`RECOVERED` / `FAILED_AGAIN` / `CHURNED`)**: Realized financial metrics logged to audit store.

---

## 4. Observability & Audit Infrastructure

- **Database Layer**: SQLite database using SQLAlchemy 2.0 with atomic transaction boundaries.
- **Audit Logs**: Every state transition records a timestamped `AuditLogEntry` containing `from_state`, `to_state`, `action_taken`, and diagnostic details.
- **Aggregate Metrics API**: `/api/observability/metrics` provides backend-calculated aggregate realized utility, net improvement, recovery rate, churn loss, and action distribution across the 1,000-transaction benchmark dataset.
