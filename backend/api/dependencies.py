from backend.core.db import db_instance, Database
from backend.services.signal_resolver import SignalResolver
from backend.services.context_engine import ContextEngine
from backend.services.policy_engine import PolicyEngine
from backend.services.decision_engine import DecisionEngine

def get_db() -> Database:
    return db_instance

def get_signal_resolver() -> SignalResolver:
    return SignalResolver()

def get_context_engine() -> ContextEngine:
    return ContextEngine()

def get_policy_engine() -> PolicyEngine:
    return PolicyEngine()

def get_decision_engine() -> DecisionEngine:
    return DecisionEngine()
