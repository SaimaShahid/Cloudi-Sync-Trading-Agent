from flask import Flask, jsonify
from flask_cors import CORS
import threading
from main import CLOUDIMaster

app = Flask(__name__)
CORS(app)

stop_event = threading.Event()
trading_bot = CLOUDIMaster()

@app.route('/api/dashboard', methods=['GET'])
def get_das
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

if __name__ == '__main__':
    app.run(port=5000, debug=True)
    