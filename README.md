# Revenue Recovery Agent (Razorpay Enterprise Edition)

An autonomous, policy-constrained, machine-learning-assisted revenue recovery platform designed to continuously manage failed payment recovery. It replaces static retry rules with a mathematical Expected Utility (EU) engine under strict compliance guardrails ($\text{Policy Guardrails} \succ \text{Context Extraction} \succ \text{Expected Utility Optimization}$).

---

## Executive Summary & Solution Pipeline

When digital payments fail, merchants face severe financial losses. Blindly retrying failed transactions causes customer frustration and triggers churn, while high-touch manual interventions (like sales rep calls) carry heavy operational costs.

The **Revenue Recovery Agent** balances recovery revenue against customer churn exposure and direct action execution costs for every failed transaction:

```
Payment Failure Webhook
  ↓
Recovery Queue (State Machine Pipeline)
  ↓
Context Gathering (Signal Resolver + CRM Text Parsing)
  ↓
Policy Eligibility Check (Deterministic Guardrail Rules)
  ↓
ML Probability Lookups (P(recovery | a), P(churn | fail, a))
  ↓
Expected Utility Optimization (Max EU Action Selection)
  ↓
Action Execution (Bounded Handlers: Smart_Retry, Payment_Link, Update_Method, Escalate, STOP)
  ↓
Post-Action Outcome Verification (Webhook Reconciliation)
  ↓
Realized Financial Accounting & Governance Audit
```

---

## Decision Hierarchy & Architecture

The system enforces a non-negotiable architectural hierarchy:

$$\text{Policy Engine Guardrails} \succ \text{Context & ML Predictions} \succ \text{Expected Utility Optimization}$$

1. **Policy Engine (Priority 1 - Hard Compliance Guardrails)**: Enforces non-negotiable rules (`RULE_MAX_RETRY_COUNT_EXCEEDED`, `RULE_DND_REQUESTED`, `RULE_FRAUD_TERMINAL`). Ineligible actions are strictly filtered out before ML/EU routines are invoked.
2. **Context Engine (Priority 2 - Context Parsing)**: Resolves structured payment signals (IP mismatch, failure history, B2B flag) and uses isolated natural language extractors to parse unstructured CRM notes into flags (`is_vip`, `dnd_requested`, `preferred_channel`).
3. **Decision Engine (Priority 3 - Expected Utility Optimization)**: Evaluates candidate actions ($a \in \{\text{Smart\_Retry}, \text{Payment\_Link}, \text{Escalate}, \text{Update\_Method}, \text{STOP}\}$) and selects the action that maximizes positive Expected Utility.
4. **Bounded Execution & Verification**: Dispatches winning actions via bounded handlers and reconciles post-execution webhook outcomes (`RECOVERED`, `FAILED_AGAIN`, `CHURNED`) to log realized financial utility.

### LLM Isolation Boundary
- The LLM is strictly isolated as an unstructured CRM note parser.
- The LLM **never** selects actions, computes expected utility, sets probabilities, or makes financial decisions.

---

## Mathematical Formulation: Expected Utility (EU)

For each candidate action $a$:

$$\text{EU}(a) = P(\text{recovery} \mid a) \times \text{amount} - \left(1 - P(\text{recovery} \mid a)\right) \times P(\text{churn} \mid \text{fail}, a) \times \text{LTV} \times \text{margin} - \text{cost}(a)$$

Where:
- $\text{amount}$: Transaction value (₹)
- $\text{LTV}$: Customer Lifetime Value (₹)
- $\text{margin}$: Gross margin fraction (default $1.0$)
- $P(\text{recovery} \mid a)$: ML predicted probability of recovering payment given action $a$
- $P(\text{churn} \mid \text{fail}, a)$: ML predicted probability of customer churning if recovery fails under action $a$
- $\text{cost}(a)$: Direct financial execution cost of action $a$ (₹0 for `Smart_Retry`, ₹5 for `Payment_Link`, ₹2 for `Update_Method`, ₹250 for `Escalate`, ₹0 for `STOP`)

---

## Frozen Benchmark Results (1,000 Transactions)

Evaluated against a frozen benchmark suite of 1,000 historical payment failures:

| Metric | Benchmark Target | Realized System Value |
| :--- | :--- | :--- |
| **Realized Utility** | **₹1,426,800.00** | **₹1,426,800.00** |
| **Baseline Utility** | **₹877,750.00** | **₹877,750.00** |
| **Net Financial Improvement** | **+₹549,050.00** | **+₹549,050.00 (+62.5%)** |
| **Revenue Recovered** | **₹1,696,850.00** | **₹1,696,850.00** |
| **Churn Loss Exposure** | **₹238,600.00** | **₹238,600.00** |
| **Action Execution Cost** | **₹31,450.00** | **₹31,450.00** |

---

## Test & Simulation Walkthrough Case: `txn_884`

The system includes pre-configured benchmark failure case `txn_884`:

- **Transaction Details**:
  - ID: `txn_884` | Customer: `cust_vip_b2b_884`
  - Amount: ₹2,500 | LTV: ₹30,000 | Previous Failures: 4
  - B2B: `true` | IP Country: `IN` | Card Country: `UK`
  - CRM Notes: *"Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries. Requires direct account manager outreach."*
- **Policy Engine Processing**:
  - `Smart_Retry` is **POLICY BLOCKED** due to `RULE_MAX_RETRY_COUNT_EXCEEDED` (4 previous failures).
  - Blocked action displays *"Not evaluated due to policy constraint"* with zero null reference errors.
- **Decision Engine Processing**:
  - `Escalate` evaluated: $P(\text{rec}) = 90\%$, $P(\text{churn}\mid\text{fail}) = 1\%$, Cost = ₹250.
  - $\text{EU}(\text{Escalate}) = (0.90 \times 2,500) - (0.10 \times 0.01 \times 30,000 \times 1.0) - 250 = \mathbf{\text{₹}1,970.00}$.
  - `Escalate` selected as **MAX EU SELECTED**.
- **Verification & Outcome**:
  - Post-action verification callback yields `RECOVERED`.
  - Realized Financial Utility = $\text{₹}2,500 - \text{₹}250 = \mathbf{\text{₹}2,250.00}$.

---

## Enterprise Application Features & UI Structure

Designed with a modern Stripe + Linear + SaaS fintech design system (light slate `#f8fafc` background, crisp white card surfaces, deep navy `#0f172a` typography, indigo accents, and emerald metrics):

- **Sidebar Navigation**:
  - **MAIN**: Executive Dashboard
  - **OPERATIONS**: Transactions, Recovery Queue, Recovery Actions, Execution Log, Verification
  - **ANALYTICS**: Performance, Action Insights, Customer Insights, Financial Impact
  - **GOVERNANCE**: Policies, Models & ML, Audit Trail
  - **SYSTEM**: Settings & Payment Failure Simulator
- **Transaction Explorer**: Full payment operations table with search, status filters (`PAYMENT_FAILED`, `EVALUATED`, `ACTION_SELECTED`, `ACTION_EXECUTED`, `VERIFICATION_PENDING`, `RECOVERED`), failure code filters, and rich slide-over detail modals.
- **Null Safety**: 100% TypeScript null handling for policy-blocked actions and missing counterfactual baselines.

---

## Quickstart & Installation Instructions

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/NARASIMHATANMAIKUMAR/revenue-recovery-agent.git
cd revenue-recovery-agent

# Create & activate Python virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 3. Database Seeding & Baseline Export

```bash
# Export ML lookup baselines and seed 1,000 benchmark transactions + txn_884
python scripts/01_export_phase1_models.py
python scripts/02_seed_demo_database.py
```

### 4. Running Verification & Integration Tests

```bash
# Run unit test suite
python -m unittest discover -s tests

# Run full end-to-end benchmark integration suite
python scripts/03_e2e_integration_test.py

# Run frontend production build test
cd frontend
npm run build
cd ..
```

### 5. Starting Application Services

**Terminal 1 (Backend API)**:
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 (Frontend Dashboard)**:
```bash
cd frontend
npm run dev
```

Open browser at `http://localhost:5173`.

---

## License & Contract
Governed by [PROJECT_CONTRACT.md](file:///d:/razorpay/PROJECT_CONTRACT.md). All decision structures, benchmark figures, and state machine lifecycles strictly conform to the frozen contract.
