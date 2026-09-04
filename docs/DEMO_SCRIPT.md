# Judge-Facing Demo Script (3–5 Minutes)

**Project**: Razorpay Revenue Recovery Agent  
**Goal**: Demonstrate autonomous context-aware revenue recovery, policy enforcement, and Expected Utility optimization using live transaction `txn_884`.

---

## Script Overview & Setup

### Pre-Demo Checklist
1. Ensure Backend is running at `http://localhost:8000`.
2. Ensure Frontend is open at `http://localhost:5173`.
3. Open browser on the **Dashboard** view.

---

## Step-by-Step Presentation Script

### 1. Introduction (30 Seconds)
**Presenter Says**:
> "Hello everyone! Today we are presenting the **Razorpay Revenue Recovery Agent**—an autonomous revenue recovery system that replaces static retry rules with mathematical Expected Utility optimization under strict policy guardrails.
> When payments fail, retrying blindly can cost money and trigger customer churn. Our system evaluates customer LTV, transaction value, previous failure count, and CRM notes to select the single action that maximizes net financial recovery."

---

### 2. Overview of Benchmark Dashboard (45 Seconds)
**Action**: Click on **Dashboard** in top navigation.

**Presenter Pointing to Screen**:
> "Here on the aggregate dashboard, you see our 1,000-transaction frozen benchmark:
> - **Total Realized Utility**: **₹1,426,800.00**
> - **Rule-Based Baseline Utility**: **₹877,750.00**
> - **Net Financial Improvement**: **+₹549,050.00** (a 62.5% increase in net recovered value!)
> - **Revenue Recovered**: **₹1,696,850.00** across 1,000 failures with **384 Smart Retries**, **302 Payment Links**, **139 Method Updates**, and **125 Escalations**."

---

### 3. Live Evaluation of Transaction `txn_884` (1.5 Minutes)
**Action**: Click **Transaction Audit** in navigation, search or locate `txn_884`, and click to open details.

**Presenter Pointing to Screen**:
> "Let's examine a live failure case: transaction `txn_884`.
> - **Amount**: ₹2,500
> - **Customer LTV**: ₹30,000
> - **Previous Failures**: 4
> - **B2B Account**: Yes
> - **CRM Notes**: *'Customer flagged as VIP account. User requested Do Not Disturb (DND) for automated retries.'*"

**Action**: Scroll down to the **Candidate Actions Expected Utility Breakdown** section.

**Presenter Explaining the Cards**:
> "Look at the candidate evaluation breakdown:
>
> 1. **Smart_Retry is POLICY BLOCKED**:
>    - Notice the red badge **POLICY BLOCKED**.
>    - Block Reason: *'Blocked: Exceeded maximum automated retry count (4 failures).'*
>    - Because policy guardrails override probability modeling, `Smart_Retry` is filtered out immediately. No fake probabilities or EU values are rendered.
>
> 2. **Expected Utility Evaluation for Eligible Actions**:
>    - The system calculates Expected Utility ($EU$) for all eligible actions:
>      $$EU(a) = P(\text{rec}) \times \text{Amount} - (1 - P(\text{rec})) \times P(\text{churn}\mid\text{fail}) \times \text{LTV} - \text{Cost}$$
>
> 3. **Why `Escalate` Wins**:
>    - `Escalate` has $P(\text{recovery}) = 90\%$, $P(\text{churn}\mid\text{fail}) = 1\%$, and Action Cost = ₹250.
>    - $\text{EU}(\text{Escalate}) = (0.90 \times 2,500) - (0.10 \times 0.01 \times 30,000) - 250 = 2,250 - 30 - 250 = \mathbf{\text{₹}1,970.00}$.
>    - `Escalate` achieves the highest Expected Utility and is selected (**MAX EU SELECTED**)."

---

### 4. Bounded Execution & Post-Action Verification (1 Minute)
**Action**: Click the blue button **Execute Selected Action (Escalate)**.

**Presenter Pointing to Screen**:
> "When we click **Execute Selected Action**, the state transitions to `ACTION_EXECUTED` and then `VERIFICATION_PENDING`.
>
> Upon receiving the verification result:
> - Payment outcome: **`RECOVERED`**
> - Revenue Recovered: **₹2,500.00**
> - Action Cost: **₹250.00**
> - **Realized Utility**: $\text{₹}2,500 - \text{₹}250 = \mathbf{\text{₹}2,250.00}$.
> - Notice that individual counterfactual baseline is correctly flagged as *'Not available for this transaction'* to maintain strict mathematical honesty."

---

### 5. Conclusion (30 Seconds)
**Presenter Says**:
> "To summarize: Policy guardrails prevent compliance violations and wasted retries. Expected Utility mathematical optimization selects the highest net-recovery action. And post-action verification ensures 100% auditability.
> Thank you!"
