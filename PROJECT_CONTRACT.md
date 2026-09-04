# Razorpay Revenue Recovery Agent - Project Contract

## 1. Executive Summary & Frozen Architecture
This contract governs the architectural boundaries, decision hierarchy, mathematical formulations, state lifecycle, benchmark metrics, and execution models for the **Razorpay Revenue Recovery Agent**.

---

## 2. Decision Hierarchy
$$\text{Policy} \succ \text{Context Model} \succ \text{Expected Utility}$$

1. **Policy Engine (Priority 1)**: Evaluates deterministic rules (VIP status, DND compliance, fraud/country mismatch triggers, regulatory overrides). If a policy rule matches, its specified action overrides all downstream calculations.
2. **Context Engine (Priority 2)**: Uses LLM strictly as an extraction tool to parse unstructured CRM notes into structured context flags (e.g., `is_vip`, `dnd_requested`, `preferred_channel`, `user_intent`).
3. **Decision Engine - Expected Utility (Priority 3)**: Evaluates quantitative Expected Utility (EU) for candidate actions if no policy override applies.

---

## 3. Strict System Constraints
- **LLM Constraint**: The LLM is strictly isolated as a context extractor for unstructured CRM text notes. It **never** selects actions, calculates probabilities, or determines financial decisions.
- **Frontend Constraint**: The frontend is a dumb terminal interface. It **never** performs EU calculation, recovery rate calculations, churn loss, realized utility, or financial decision logic. All data and math are delivered strictly from the backend API.

---

## 4. State Machine Lifecycle
The transaction lifecycle follows an atomic 7-stage state transition pipeline:

```
PAYMENT_FAILED ➔ CONTEXT_GATHERED ➔ EVALUATED ➔ ACTION_SELECTED ➔ ACTION_EXECUTED ➔ VERIFICATION_PENDING ➔ [RECOVERED | FAILED_AGAIN | CHURNED]
```

### State Definitions:
1. `PAYMENT_FAILED`: Webhook received from Razorpay indicating payment failure.
2. `CONTEXT_GATHERED`: Payment signals and unstructured CRM context resolved.
3. `EVALUATED`: Policy checks and Expected Utility math computed across candidate actions.
4. `ACTION_SELECTED`: Optimal action chosen (via policy override or highest positive EU).
5. `ACTION_EXECUTED`: Action dispatched via adapter (`Smart_Retry`, `Payment_Link`, `Escalate`, `Update_Method`, `STOP`).
6. `VERIFICATION_PENDING`: Awaiting post-execution verification outcome.
7. Terminal States:
   - `RECOVERED`: Payment successfully recovered.
   - `FAILED_AGAIN`: Retry/Action failed without immediate churn.
   - `CHURNED`: Customer churned as a result of failure/action.

---

## 5. Mathematical Formulation

### Expected Utility (EU)
$$\text{EU}(a) = P(\text{recovery} \mid a) \times \text{amount} - \left(1 - P(\text{recovery} \mid a)\right) \times P(\text{churn} \mid \text{fail}, a) \times \text{LTV} \times \text{margin} - \text{cost}(a)$$

Where:
- $\text{amount}$: Transaction value (₹)
- $\text{LTV}$: Customer Lifetime Value (₹)
- $\text{margin}$: Customer gross margin fraction (default $1.0$)
- $P(\text{recovery} \mid a)$: Estimated probability of recovering payment given action $a$
- $P(\text{churn} \mid \text{fail}, a)$: Probability of customer churning given recovery failure under action $a$
- $\text{cost}(a)$: Direct financial execution cost of action $a$ (₹)

---

## 6. Frozen Benchmark Targets (1,000 Transactions)

- **Realized Utility**: ₹1,426,800
- **Baseline Utility**: ₹877,750
- **Net Utility Improvement**: ₹549,050
- **Revenue Recovered**: ₹1,696,850
- **Churn Loss**: ₹238,600
- **Action Cost**: ₹31,450

### Target Action Distribution
- `Smart_Retry`: 384
- `Payment_Link`: 302
- `Escalate`: 125
- `Update_Method`: 139
- `STOP`: 50
- **Total**: 1,000 transactions

---

## 7. Live Demo Case Target (`txn_884`)

- **Transaction ID**: `txn_884`
- **Amount**: ₹2,500
- **Failure Code**: `insufficient_funds`
- **LTV**: ₹30,000
- **Previous Failures**: 4
- **Is B2B**: `true`
- **IP Location**: `IN` (India)
- **Card Country**: `UK` (United Kingdom)
- **CRM Notes**: `"Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries. Requires direct account manager outreach."`
- **Expected Action**: **`Escalate`** (enforced by Policy Engine override due to VIP/DND notes).
