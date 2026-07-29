import os
import re

import requests

_ISO_TIMESTAMP_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?")

SURGE_BASE_URL = "https://back.surge.xyz"


class SurgeError(Exception):
    """Base error for any failed SURGE OpenClaw API call."""

    def __init__(self, message, status_code=None, code=None, body=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.body = body


class SurgeAuthError(SurgeError):
    """401 - the API key is invalid or expired."""


class SurgeForbiddenError(SurgeError):
    """403 - the account is temporarily or permanently blocked.

    Never retry after this. Parses the ban message for an ISO date
    (temp ban) or the word "permanently" (permanent ban) per SKILL.md.
    """

    def __init__(self, message, status_code=None, code=None, body=None):
        super().__init__(message, status_code, code, body)
        self.is_permanent = "permanently" in message.lower()
        self.until = None
        if not self.is_permanent:
            match = _ISO_TIMESTAMP_RE.search(message)
            if match:
                self.until = match.group(0)


class SurgeRateLimitError(SurgeError):
    """429 - back off. Never loop rapidly on this."""


class SurgeServerError(SurgeError):
    """500 - not the caller's fault, safe to retry once after a delay."""


class SurgeBadRequestError(SurgeError):
    """400 - validation or known business-logic failure. `code` may be set."""


class SurgeClient:
    def __init__(self, api_key=None, timeout=10):
        self.api_key = api_key if api_key is not None else os.getenv("SURGE_API_KEY")
        if not self.api_key:
            raise SurgeAuthError(
                "SURGE_API_KEY is not set. Get one at app.surge.xyz -> Profile -> API Keys."
            )
        self.timeout = timeout

    def _request(self, method, path, **kwargs):
        url = f"{SURGE_BASE_URL}{path}"
        headers = {"X-API-Key": self.api_key}

        try:
            response = requests.request(method, url, headers=headers, timeout=self.timeout, **kwargs)
        except requests.RequestException as error:
            raise SurgeServerError(f"Network error calling SURGE: {error}") from error

        if response.ok:
            return response.json()

        try:
            body = response.json()
        except ValueError:
            body = None

        message = (body or {}).get("message") if isinstance(body, dict) else None
        message = message or response.text or f"SURGE request failed with status {response.status_code}"
        code = (body or {}).get("code") if isinstance(body, dict) else None

        if response.status_code == 401:
            raise SurgeAuthError(message, response.status_code, code, body)
        if response.status_code == 403:
            raise SurgeForbiddenError(message, response.status_code, code, body)
        if response.status_code == 429:
            raise SurgeRateLimitError(message, response.status_code, code, body)
        if response.status_code >= 500:
            raise SurgeServerError(message, response.status_code, code, body)
        raise SurgeBadRequestError(message, response.status_code, code, body)

    def get_launch_info(self):
        return self._request("GET", "/openclaw/launch-info")

    def create_wallet(self):
        return self._request("POST", "/openclaw/wallet/create")

    def create_wallet_solana(self):
        return self._request("POST", "/openclaw/wallet/create-solana")

    def get_wallet_balance(self, wallet_id):
        return self._request("GET", f"/openclaw/wallet/{wallet_id}/balance")

    def get_wallet_history(self, wallet_id, limit=20, offset=0):
        return self._request(
            "GET",
            f"/openclaw/wallet/{wallet_id}/history",
            params={"limit": limit, "offset": offset},
        )
