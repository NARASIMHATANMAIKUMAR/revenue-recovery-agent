import os
import json

ML_ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "ml_artifacts")
OUTPUT_PATH = os.path.join(ML_ARTIFACTS_DIR, "baseline_lookup.json")

def export_models():
    os.makedirs(ML_ARTIFACTS_DIR, exist_ok=True)
    
    baseline_data = {
        "version": "1.0.0",
        "description": "Baseline probability lookups for recovery and churn by failure code & action.",
        "probabilities": {
            "insufficient_funds": {
                "Smart_Retry": {"p_recovery": 0.55, "p_churn_given_fail": 0.08},
                "Payment_Link": {"p_recovery": 0.65, "p_churn_given_fail": 0.05},
                "Escalate": {"p_recovery": 0.90, "p_churn_given_fail": 0.01},
                "Update_Method": {"p_recovery": 0.40, "p_churn_given_fail": 0.10},
                "STOP": {"p_recovery": 0.00, "p_churn_given_fail": 0.20}
            },
            "card_expired": {
                "Smart_Retry": {"p_recovery": 0.10, "p_churn_given_fail": 0.15},
                "Payment_Link": {"p_recovery": 0.50, "p_churn_given_fail": 0.08},
                "Escalate": {"p_recovery": 0.85, "p_churn_given_fail": 0.02},
                "Update_Method": {"p_recovery": 0.88, "p_churn_given_fail": 0.02},
                "STOP": {"p_recovery": 0.00, "p_churn_given_fail": 0.25}
            },
            "authentication_failed": {
                "Smart_Retry": {"p_recovery": 0.70, "p_churn_given_fail": 0.04},
                "Payment_Link": {"p_recovery": 0.80, "p_churn_given_fail": 0.03},
                "Escalate": {"p_recovery": 0.92, "p_churn_given_fail": 0.01},
                "Update_Method": {"p_recovery": 0.50, "p_churn_given_fail": 0.06},
                "STOP": {"p_recovery": 0.00, "p_churn_given_fail": 0.15}
            }
        }
    }
    
    with open(OUTPUT_PATH, "w") as f:
        json.dump(baseline_data, f, indent=2)
        
    print(f"Successfully exported ML baseline artifact to: {OUTPUT_PATH}")

if __name__ == "__main__":
    export_models()
