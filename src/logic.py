import random

class CloudiTradingLogic:
    def __init__(self):
        self.min_liquidity = 1000  # Mock limit: $1000 se kam liquidity par trade nahi leni
        self.risk_score_limit = 70  # 70 se upar risk ho toh ignore
        
    def evaluate_token(self, token_data):
        """
        Mock testing ke liye token analyze karne ki logic.
        token_data: Dictionary jisme price, liquidity, aur owner info ho.
        """
        name = token_data.get('name', 'Unknown')
        liquidity = token_data.get('liquidity', 0)
        risk_score = token_data.get('risk_score', 0)

        print(f"🔍 Analyzing Token: {name}...")

        # 1. Liquidity Check
        if liquidity < self.min_liquidity:
            return f"❌ REJECTED: Low Liquidity (${liquidity})"

        # 2. Scam/Risk Check (Mock logic)
        if risk_score > self.risk_score_limit:
            return f"❌ REJECTED: High Risk Score ({risk_score})"

        # 3. Decision Logic
        if liquidity > 5000 and risk_score < 30:
            return "✅ STRONG BUY: High Liquidity & Low Risk"
        
        return "⚠️ WATCHLIST: Needs more volume"

    def get_mock_market_data(self):
        """Mock Testing ke liye fake market data generate karna"""
        tokens = [
            {"name": "BaseMoon", "liquidity": 12000, "risk_score": 20},
            {"name": "ScamCoin", "liquidity": 500, "risk_score": 95},
            {"name": "CloudiToken", "liquidity": 8000, "risk_score": 10}
        ]
        return random.choice(tokens)