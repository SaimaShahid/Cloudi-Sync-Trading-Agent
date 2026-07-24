# Cloudi-CLI-Trading-Agent

Architecture blueprint and quick start

Overview
--------
Cloudi (Ticker: CLI) is an autonomous trading agent scaffold targeting Base Mainnet using SURGE API for execution and an LLM-driven decision engine. This repository contains a minimal, testable skeleton to get started.

High-level Components
---------------------
- `src/main.py`: CLI runner and agent entrypoint
- `config.json`: System configuration and defaults
- `src/logic.py`: Mock trading logic (decision heuristics)
- `src/logger.py`: Audit and risk helper utilities
- `src/agent_logic.py`: Agent decision wrapper (added)
- `src/surge_client.py`: SURGE API client skeleton (added)

Quick Start
-----------
1. Create a Python environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Inspect or edit configuration in `config.json`.

3. View agent status:

```bash
python src/main.py --mode status
```

4. Run a mock trade:

```bash
python src/main.py --mode trade --amount 0.01
```

Notes
-----
- The `SURGE` client is a placeholder and requires an API endpoint and key (`SURGE_API_KEY`) to perform real trades.
- Risk management follows the ERC-8004 compliance pattern as a conceptual model; concrete on-chain enforcement is out-of-scope for this scaffold.

See the `src/` folder for implementation details and tests under `tests/` for development guidance.