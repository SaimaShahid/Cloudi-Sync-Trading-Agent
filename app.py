from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
from src.main import CLOUDIMaster, SYSTEM_PROMPT
from src.agent import run_agent_turn
from src.surge_client import SurgeClient, SurgeError

app = Flask(__name__)
CORS(app)

stop_event = threading.Event()
trading_bot = CLOUDIMaster()

chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    return jsonify({
        "balance": "1.25 ETH",
        "total_trades": "42 Executed",
        "agent_status": "ACTIVE"
    })

@app.route('/api/agent/start', methods=['POST'])
def start_agent():
    stop_event.clear()
    thread = threading.Thread(target=trading_bot.monitor_strategy, args=("BTCUSD", 100000.0, stop_event))
    thread.start()
    return jsonify({"status": "Started"})

@app.route('/api/agent/stop', methods=['POST'])
def stop_agent():
    stop_event.set()
    return jsonify({"status": "Stopped"})

@app.route('/api/agent/chat', methods=['POST'])
def agent_chat():
    body = request.get_json(silent=True) or {}
    message = (body.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        surge_client = SurgeClient()
    except SurgeError as error:
        return jsonify({"error": error.message}), 400

    chat_messages.append({"role": "user", "content": message})
    reply, _ = run_agent_turn(surge_client, chat_messages)
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
    