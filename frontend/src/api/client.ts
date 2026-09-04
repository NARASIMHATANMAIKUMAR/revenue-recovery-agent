import axios from 'axios';
import { ObservabilityMetrics, TransactionRecord, EvaluateResponse } from '../types';

const API_BASE = '/api/v1';

export const apiClient = {
  getMetrics: async (): Promise<ObservabilityMetrics> => {
    const res = await axios.get<ObservabilityMetrics>(`${API_BASE}/observability/metrics`);
    return res.data;
  },

  getTransactions: async (): Promise<TransactionRecord[]> => {
    const res = await axios.get<TransactionRecord[]>(`${API_BASE}/observability/transactions`);
    return res.data;
  },

  getTransactionDetail: async (transactionId: string): Promise<TransactionRecord> => {
    const res = await axios.get<TransactionRecord>(`${API_BASE}/observability/transaction/${transactionId}`);
    return res.data;
  },

  evaluateTransaction: async (transactionId: string): Promise<EvaluateResponse> => {
    const res = await axios.post<EvaluateResponse>(`${API_BASE}/agent/evaluate`, { transaction_id: transactionId });
    return res.data;
  },

  runDemoTxn884: async (): Promise<EvaluateResponse> => {
    const res = await axios.post<EvaluateResponse>(`${API_BASE}/agent/demo/txn_884`);
    return res.data;
  },

  simulatePaymentFailure: async (payload: {
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
  }): Promise<any> => {
    const res = await axios.post(`${API_BASE}/webhook/simulate`, payload);
    return res.data;
  },

  executeAction: async (transactionId: string): Promise<any> => {
    const res = await axios.post(`${API_BASE}/execution/execute`, { transaction_id: transactionId });
    return res.data;
  },

  verifyOutcome: async (transactionId: string, outcome: string): Promise<any> => {
    const res = await axios.post(`${API_BASE}/execution/verify`, { transaction_id: transactionId, outcome });
    return res.data;
  }
};
