import sys
import os
import json
import argparse
import time
import logging

# Project Root Path Setup
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Logging Setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")
logger = logging.getLogger("CloudiAgent")

def load_config():
    config_path = os.path.join(PROJECT_ROOT, "config.json")
    if not os.path.exists(config_path):
        logger.error("✘ config.json file nahi mili!")
        sys.exit(1)
    with open(config_path, "r") as f:
        return json.load(f)

class CloudiTradingAgent:
    def __init__(self):
        self.config = load_config()
        self.arch = self.config.get("architecture", {})
        self.strategy = self.arch.get("trading_strategy", {})
        self.risk = self.arch.get("risk_management", {})
        
        logger.info(f"Agent '{self.config.get('agent_name')}' ({self.config.get('agent_ticker')}) Initialized.")

    def display_status(self):
        print("\n================ CLOUDI AGENT CONFIGURATION ================")
        print(f" Agent ID            : {self.config.get('agent_id')}")
        print(f" Agent Name/Ticker   : {self.config.get('agent_name')} (${self.config.get('agent_ticker')})")
        print(f" Domain              : {self.config.get('agent_domain')}")
        print(f" Network             : {self.arch.get('network')}")
        print(f" Exchange            : {self.config.get('exchange')}")
        print(f" Trading Pair        : {self.config.get('trading_pair')}")
        print(f" Oracle Address      : {self.config.get('oracle_address')}")
        print("------------------------------------------------------------")
        print(f" Execution Mode      : {self.strategy.get('execution_mode')}")
        print(f" Compliance Standard : {self.risk.get('compliance_standard')}")
        print(f" Max Position (ETH)  : {self.risk.get('max_position_eth')} ETH")
        print(f" Stop Loss           : {self.risk.get('stop_loss_percent')}%")
        print(f" Mock Mode           : {self.config.get('mock_mode')}")
        print("============================================================\n")

    def run_trade(self, amount: float):
        max_eth = self.risk.get("max_position_eth", 0.05)
        pair = self.config.get("trading_pair", "BTCUSD")
        
        logger.info(f"Checking trade amount: {amount} ETH against Risk Limit: {max_eth} ETH")
        
        # Risk Management Logic (ERC-8004 Compliance)
        if amount > max_eth:
            logger.warning(f"[REJECTED] Amount {amount} ETH exceeds maximum allowed position limit ({max_eth} ETH)!")
            return False

        logger.info(f"[SUCCESS] Initiating trade for {pair} on {self.config.get('exchange')}...")
        time.sleep(1)
        logger.info(f"[EXECUTED] Trade of {amount} ETH completed (Mock Mode: {self.config.get('mock_mode')}).")
        return True


def main():
    parser = argparse.ArgumentParser(description="Cloudi CLI Trading Agent")
    parser.add_argument("--mode", type=str, choices=["status", "trade"], default="status", help="Execution mode")
    parser.add_argument("--amount", type=float, default=0.01, help="Trade amount in ETH")

    args = parser.parse_args()
    agent = CloudiTradingAgent()

    if args.mode == "status":
        agent.display_status()
    elif args.mode == "trade":
        agent.run_trade(amount=args.amount)

if __name__ == "__main__":
    main()