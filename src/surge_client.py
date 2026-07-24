import json
import logging
import os
from typing import Any, Dict, Optional, Tuple

import requests


class SurgeClient:
    """SURGE API client with balance checks and swap execution.

    Key behaviors:
    - Reads `SURGE_API_KEY` and `SURGE_BASE_URL` from environment if not supplied.
    - Loads `max_position_eth` from `config.json` to enforce risk limits.
    - Provides `get_wallet_balance`, `can_execute_trade`, and `place_swap`.

    NOTE: This client never uses raw private keys and assumes SURGE manages
    custody/execution.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, config_path: str = "config.json"):
        self.api_key = api_key or os.getenv("SURE_API_KEY") or os.getenv("SURGE_API_KEY")
        self.base_url = base_url or os.getenv("SURGE_BASE_URL", "https://back.surge.xyz")
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

        # Load risk settings from config.json (fallback to sensible default)
        self.max_position_eth = 0.05
        try:
            if os.path.exists(config_path):
                with open(config_path, "r") as fh:
                    cfg = json.load(fh)
                    self.max_position_eth = (
                        cfg.get("architecture", {}).get("risk_management", {}).get("max_position_eth", self.max_position_eth)
                    )
        except Exception:
            logging.exception("Failed to read config for max_position_eth; using default")

    def _request(self, method: str, path: str, **kwargs) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        url = f"{self.base_url.rstrip('/')}/{path.lstrip('/')}"
        try:
            resp = self.session.request(method, url, timeout=15, **kwargs)
            resp.raise_for_status()
            try:
                return resp.json(), None
            except ValueError:
                return {"raw_text": resp.text}, None
        except requests.RequestException as exc:
            logging.exception("SURGE API request failed")
            return None, str(exc)

    def get_wallet_balance(self, wallet_id: Optional[str] = None, currency: str = "ETH") -> Dict[str, Any]:
        """Return wallet balance in {currency} as a dict: {'balance': float} or {'error': str}.

        The exact SURGE API path may vary; this method uses a common pattern and
        gracefully returns errors for the caller to handle.
        """
        path = f"wallets/{wallet_id}/balance" if wallet_id else "wallets/balance"
        params = {"currency": currency}
        body, err = self._request("GET", path, params=params)
        if err:
            return {"error": err}

        # Try to extract numeric balance from common response shapes
        if isinstance(body, dict):
            for k in ("balance", "available", "amount"):
                if k in body:
                    try:
                        return {"balance": float(body[k])}
                    except Exception:
                        continue
        return {"error": "unexpected_balance_response", "raw": body}

    def can_execute_trade(self, amount_eth: float, wallet_id: Optional[str] = None) -> Tuple[bool, str]:
        """Enforce `max_position_eth` and verify wallet has sufficient ETH balance.

        Returns (True, '') when allowed, otherwise (False, reason).
        """
        if amount_eth <= 0:
            return False, "invalid_amount"

        if amount_eth > self.max_position_eth:
            return False, f"amount_exceeds_max_position ({amount_eth} > {self.max_position_eth})"

        # Check on-chain (wallet) balance via SURGE API
        bal_resp = self.get_wallet_balance(wallet_id=wallet_id, currency="ETH")
        if "error" in bal_resp:
            return False, f"balance_check_failed: {bal_resp.get('error')}"

        balance = bal_resp.get("balance", 0.0)
        if balance < amount_eth:
            return False, f"insufficient_funds ({balance} < {amount_eth})"

        return True, "ok"

    def place_swap(self, pair: str, amount_eth: float, side: str = "buy", wallet_id: Optional[str] = None, extra: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Place a swap/op on SURGE after performing risk checks.

        - `pair` is a trading pair string (e.g. 'BTCUSD' or 'ETH/USD').
        - `amount_eth` is the ETH-denominated size to execute (must respect risk limits).

        Returns SURGE response JSON or an `{'error': '...'} payload on failure.
        """
        allowed, reason = self.can_execute_trade(amount_eth, wallet_id=wallet_id)
        if not allowed:
            return {"error": "trade_not_allowed", "reason": reason}

        payload = {
            "pair": pair,
            "amount_eth": amount_eth,
            "side": side,
        }
        if wallet_id:
            payload["wallet_id"] = wallet_id
        if extra:
            payload.update(extra)

        body, err = self._request("POST", "orders/swap", json=payload)
        if err:
            return {"error": err}
        return body or {"error": "empty_response"}


__all__ = ["SurgeClient"]
