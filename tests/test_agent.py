import json
from unittest.mock import MagicMock, patch

import pytest

from src.surge_client import (
    SurgeAuthError,
    SurgeBadRequestError,
    SurgeClient,
    SurgeForbiddenError,
    SurgeRateLimitError,
)


def _mock_response(status_code, json_body=None, ok=None):
    response = MagicMock()
    response.status_code = status_code
    response.ok = ok if ok is not None else 200 <= status_code < 300
    response.json.return_value = json_body or {}
    response.text = json.dumps(json_body) if json_body else ""
    return response


@pytest.fixture
def client():
    return SurgeClient(api_key="sk-surge-test-key")


class TestSurgeClientSuccess:
    @patch("src.surge_client.requests.request")
    def test_get_launch_info(self, mock_request, client):
        mock_request.return_value = _mock_response(
            200,
            {
                "chains": [{"chainId": "1", "chainName": "Base", "fee": "0.005"}],
                "categories": ["ai", "defi"],
                "limits": {"maxImageSize": "5MB"},
            },
        )
        result = client.get_launch_info()
        assert result["chains"][0]["chainName"] == "Base"
        args, kwargs = mock_request.call_args
        assert args[0] == "GET"
        assert args[1].endswith("/openclaw/launch-info")
        assert kwargs["headers"]["X-API-Key"] == "sk-surge-test-key"

    @patch("src.surge_client.requests.request")
    def test_create_wallet(self, mock_request, client):
        mock_request.return_value = _mock_response(
            200,
            {"walletId": "vun3srwayi6z1h8momm83tdr", "address": "0xD29c...Be2E", "chainType": "EVM", "needsFunding": True, "isNew": True},
        )
        result = client.create_wallet()
        assert result["walletId"] == "vun3srwayi6z1h8momm83tdr"
        args, _ = mock_request.call_args
        assert args[0] == "POST"
        assert args[1].endswith("/openclaw/wallet/create")

    @patch("src.surge_client.requests.request")
    def test_create_wallet_solana(self, mock_request, client):
        mock_request.return_value = _mock_response(
            200,
            {"walletId": "sol_wallet_1", "address": "7pB8z...", "chainType": "SOLANA", "needsFunding": True, "isNew": True},
        )
        result = client.create_wallet_solana()
        assert result["chainType"] == "SOLANA"
        args, _ = mock_request.call_args
        assert args[1].endswith("/openclaw/wallet/create-solana")

    @patch("src.surge_client.requests.request")
    def test_get_wallet_balance(self, mock_request, client):
        mock_request.return_value = _mock_response(
            200, {"sufficient": True, "minRequired": "0.00536", "balance": "0.01"}
        )
        result = client.get_wallet_balance("abc123")
        assert result["sufficient"] is True
        args, _ = mock_request.call_args
        assert args[1].endswith("/openclaw/wallet/abc123/balance")

    @patch("src.surge_client.requests.request")
    def test_get_wallet_history(self, mock_request, client):
        mock_request.return_value = _mock_response(
            200, {"trades": [{"id": "42", "action": "buy"}], "total": 1}
        )
        result = client.get_wallet_history("abc123", limit=10, offset=0)
        assert result["total"] == 1
        args, kwargs = mock_request.call_args
        assert args[1].endswith("/openclaw/wallet/abc123/history")
        assert kwargs["params"] == {"limit": 10, "offset": 0}


class TestSurgeClientErrors:
    @patch("src.surge_client.requests.request")
    def test_401_raises_auth_error(self, mock_request, client):
        mock_request.return_value = _mock_response(401, {"message": "Invalid API key"})
        with pytest.raises(SurgeAuthError) as exc_info:
            client.get_launch_info()
        assert "Invalid API key" in exc_info.value.message

    @patch("src.surge_client.requests.request")
    def test_403_temporary_ban_parses_until(self, mock_request, client):
        mock_request.return_value = _mock_response(
            403,
            {
                "statusCode": 403,
                "message": "Account suspended until 2026-02-14T12:00:00.000Z. Reason: rate_limit_abuse. Contact support.",
                "error": "Forbidden",
            },
        )
        with pytest.raises(SurgeForbiddenError) as exc_info:
            client.get_launch_info()
        assert exc_info.value.is_permanent is False
        assert exc_info.value.until == "2026-02-14T12:00:00.000Z"

    @patch("src.surge_client.requests.request")
    def test_403_permanent_ban(self, mock_request, client):
        mock_request.return_value = _mock_response(
            403, {"message": "Account permanently suspended. Contact support.", "error": "Forbidden"}
        )
        with pytest.raises(SurgeForbiddenError) as exc_info:
            client.get_launch_info()
        assert exc_info.value.is_permanent is True
        assert exc_info.value.until is None

    @patch("src.surge_client.requests.request")
    def test_429_raises_rate_limit_error(self, mock_request, client):
        mock_request.return_value = _mock_response(429, {"message": "Too many requests"})
        with pytest.raises(SurgeRateLimitError):
            client.get_wallet_balance("abc123")

    @patch("src.surge_client.requests.request")
    def test_400_wallet_not_found(self, mock_request, client):
        mock_request.return_value = _mock_response(400, {"statusCode": 400, "message": "Wallet not found"})
        with pytest.raises(SurgeBadRequestError) as exc_info:
            client.get_wallet_balance("nonexistent")
        assert "Wallet not found" in exc_info.value.message

    @patch("src.surge_client.requests.request")
    def test_400_not_a_solana_wallet(self, mock_request, client):
        mock_request.return_value = _mock_response(
            400, {"statusCode": 400, "message": "This wallet is not a Solana wallet"}
        )
        with pytest.raises(SurgeBadRequestError) as exc_info:
            client.get_wallet_history("evm_wallet_id")
        assert "not a Solana wallet" in exc_info.value.message


def test_missing_api_key_raises_immediately(monkeypatch):
    monkeypatch.delenv("SURGE_API_KEY", raising=False)
    with pytest.raises(SurgeAuthError):
        SurgeClient(api_key=None)


class TestAgentToolLoop:
    def _make_tool_call(self, call_id, name, arguments):
        tool_call = MagicMock()
        tool_call.id = call_id
        tool_call.function.name = name
        tool_call.function.arguments = json.dumps(arguments)
        tool_call.model_dump.return_value = {
            "id": call_id,
            "function": {"name": name, "arguments": json.dumps(arguments)},
        }
        return tool_call

    def test_dispatches_tool_call_then_returns_final_reply(self, client):
        from src import agent as agent_module

        with patch("src.surge_client.requests.request") as mock_request:
            mock_request.return_value = _mock_response(200, {"chains": [{"chainName": "Base"}]})

            tool_call_response = MagicMock()
            tool_call_response.choices = [MagicMock()]
            tool_call_response.choices[0].message.tool_calls = [
                self._make_tool_call("call_1", "get_launch_info", {})
            ]
            tool_call_response.choices[0].message.content = None

            final_response = MagicMock()
            final_response.choices = [MagicMock()]
            final_response.choices[0].message.tool_calls = None
            final_response.choices[0].message.content = "Base chain is available."

            with patch.object(
                agent_module.fireworks_client.chat.completions,
                "create",
                side_effect=[tool_call_response, final_response],
            ):
                messages = [{"role": "system", "content": "test"}, {"role": "user", "content": "what chains?"}]
                reply, updated_messages = agent_module.run_agent_turn(client, messages)

        assert reply == "Base chain is available."
        tool_messages = [m for m in updated_messages if m.get("role") == "tool"]
        assert len(tool_messages) == 1
        assert json.loads(tool_messages[0]["content"])["chains"][0]["chainName"] == "Base"

    def test_forbidden_error_stops_further_tool_calls(self, client):
        from src import agent as agent_module

        with patch("src.surge_client.requests.request") as mock_request:
            mock_request.return_value = _mock_response(
                403, {"message": "Account permanently suspended.", "error": "Forbidden"}
            )

            tool_call_response = MagicMock()
            tool_call_response.choices = [MagicMock()]
            tool_call_response.choices[0].message.tool_calls = [
                self._make_tool_call("call_1", "get_launch_info", {})
            ]
            tool_call_response.choices[0].message.content = None

            final_response = MagicMock()
            final_response.choices = [MagicMock()]
            final_response.choices[0].message.tool_calls = None
            final_response.choices[0].message.content = "Your account is permanently suspended."

            with patch.object(
                agent_module.fireworks_client.chat.completions,
                "create",
                side_effect=[tool_call_response, final_response],
            ) as mock_create:
                messages = [{"role": "system", "content": "test"}, {"role": "user", "content": "what chains?"}]
                reply, _ = agent_module.run_agent_turn(client, messages)

        assert reply == "Your account is permanently suspended."
        assert mock_create.call_count == 2
