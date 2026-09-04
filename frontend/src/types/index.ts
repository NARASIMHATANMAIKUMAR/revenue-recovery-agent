export type StateLifecycle =
  | 'PAYMENT_FAILED'
  | 'CONTEXT_GATHERED'
  | 'EVALUATED'
  | 'ACTION_SELECTED'
  | 'ACTION_EXECUTED'
  | 'VERIFICATION_PENDING'
  | 'RECOVERED'
  | 'FAILED_AGAIN'
  | 'CHURNED';

export type ActionType =
  | 'Smart_Retry'
  | 'Payment_Link'
  | 'Escalate'
  | 'Update_Method'
  | 'STOP';

export interface SignalContext {
  card_country: string;
  ip_country: string;
  is_country_mismatch: boolean;
  previous_failures: number;
  is_b2b: boolean;
  ltv: number;
  margin: number;
  amount: number;
  failure_code: string;
}

export interface CRMNotesContext {
  raw_notes: string;
  is_vip: boolean;
  dnd_requested: boolean;
  sentiment?: string;
  preferred_channel?: string;
  extracted_intent?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  from_state: string;
  to_state: string;
  action_taken?: string;
  details?: string;
}

export interface TransactionRecord {
  transaction_id: string;
  customer_id: string;
  amount: number;
  failure_code: string;
  ltv: number;
  previous_failures: number;
  is_b2b: boolean;
  ip_country: string;
  card_country: string;
  crm_notes: string;
  signals?: SignalContext;
  crm_context?: CRMNotesContext;
  state: StateLifecycle;
  policy_overridden: boolean;
  policy_rule_triggered?: string;
  selected_action?: ActionType;
  realized_utility?: number | null;
  baseline_utility?: number | null;
  revenue_recovered?: number | null;
  churn_loss?: number | null;
  action_cost?: number | null;
  audit_trail: AuditLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface CandidateActionScore {
  action: ActionType;
  is_eligible?: boolean;
  block_reason?: string | null;
  p_recovery?: number | null;
  p_churn_given_fail?: number | null;
  action_cost?: number | null;
  expected_utility?: number | null;
  formula_breakdown?: string | null;
}

export interface EvaluateResponse {
  transaction_id: string;
  state: StateLifecycle;
  selected_action: ActionType;
  selected_by: string;
  policy_override_reason?: string | null;
  candidate_scores: CandidateActionScore[];
  winning_eu_score: number;
  transaction: TransactionRecord;
}

export interface FinancialSummary {
  realized_utility: number;
  baseline_utility: number;
  net_improvement: number;
  revenue_recovered: number;
  churn_loss: number;
  action_cost: number;
  total_transactions: number;
  recovery_rate_pct: number;
}

export interface ActionDistribution {
  Smart_Retry: number;
  Payment_Link: number;
  Escalate: number;
  Update_Method: number;
  STOP: number;
  total: number;
}

export interface ObservabilityMetrics {
  financial_summary: FinancialSummary;
  action_distribution: ActionDistribution;
  state_counts: Record<string, number>;
}
