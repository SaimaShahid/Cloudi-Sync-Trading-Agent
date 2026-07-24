import json
import time
import hashlib
import os

class CloudiLogger:
    def __init__(self, config_path='config.json'):
        # Rules load karna config file se
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        else:
            print("Error: config.json nahi mili!")

    def verify_risk(self, amount_eth):
        """
        ERC-8004 Rule: Risk Router Enforcement
        Yeh check karta hai ke trade ki raqam limit se zyada toh nahi.
        """
        max_limit = self.config.get('max_position_size_eth', 0.01)
        if amount_eth > max_limit:
            return False, f"Risk Alert: {amount_eth} ETH limit se zyada hai!"
        return True, "Risk Check Passed"

    def create_audit_artifact(self, decision, reason):
        """
        On-chain Accountability: 
        Har faislay ka ek unique 'Digital Signature' (Hash) banana.
        """
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        # Data ko combine karke hash banana taake koi record badal na sake
        raw_data = f"{timestamp}|{decision}|{reason}"
        artifact_hash = hashlib.sha256(raw_data.encode()).hexdigest()
        
        log_entry = {
            "timestamp": timestamp,
            "agent_decision": decision,
            "reason_ingested": reason,
            "verification_hash": artifact_hash,
            "network": "Base",
            "protocol": "Aerodrome"
        }
        
        # Record ko 'audit_trail.log' mein save karna
        with open('audit_trail.log', 'a') as log_file:
            log_file.write(json.dumps(log_entry) + "\n")
        
        return artifact_hash

# --- Simple Test ---
# If you run this file it will check::
if __name__ == "__main__":
    logger = CloudiLogger()
    # Check 1: Risk Verification
    status, message = logger.verify_risk(0.02) # Testing with 0.02 ETH
    print(f"Status: {status} | Message: {message}")
    
    # Check 2: Artifact Generation
    h = logger.create_audit_artifact("BUY $CLI", "Market analysis shows strong liquidity on Aerodrome")
    print(f"Audit Artifact Created: {h}")