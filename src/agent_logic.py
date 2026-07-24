import json
import os
from typing import Any, Dict

from logic import CloudiTradingLogic


class AgentLogic:
    """Wrapper around the decision engine used by the Cloudi agent.

    This file is intentionally lightweight: it loads config, exposes a `decide`
    method that accepts market data and returns a structured decision.
    """

    def __init__(self, config_path: str = "config.json"):
        if os.path.exists(config_path):
            with open(config_path, "r") as f:
                self.config = json.load(f)
        else:
            self.config = {}

        self.logic = CloudiTradingLogic()

    def decide(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run the internal trading logic and return a decision payload.

        market_data should be a dict containing keys expected by
        `CloudiTradingLogic.evaluate_token`.
        """
        decision_text = self.logic.evaluate_token(market_data)
        return {
            "decision": decision_text,
            "market": market_data,
            "agent": self.config.get("agent_name", "Cloudi"),
        }


__all__ = ["AgentLogic"]
