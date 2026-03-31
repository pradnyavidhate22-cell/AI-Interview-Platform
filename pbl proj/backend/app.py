from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sys

# Ensure `ai_interviewer.py` (one directory up from this file) is importable.
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from ai_interviewer import AIInterviewer

app = Flask(__name__)
CORS(app)

# Initialize AI Interviewer
interviewer = AIInterviewer()

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    """Start a new interview session."""
    question = interviewer.start_interview()
    return jsonify({"question": question})

@app.route('/api/analyze-response', methods=['POST'])
def analyze_response():
    """Analyze student's response."""
    data = request.json
    # Allow empty response so the avatar can "reveal" an improved/example answer.
    response = (data.get('response') or '') if data else ''
    try:
        result = interviewer.analyze_response(response)
        return jsonify(result)
    except Exception as e:
        # Always return structured payload so frontend doesn't break.
        fallback_next = interviewer.current_question or "Can you explain your approach in simpler steps?"
        return jsonify({
            "feedback": f"Backend recovered from an internal error: {str(e)}",
            "next_question": fallback_next,
            "suggestions": [
                "Please retry your answer.",
                "Keep your answer concise and technical.",
                "If voice fails, type your response in the input box."
            ],
            "improved_answer": "Please retry. I encountered an internal processing error but the interview is still active.",
            "confidence_score": 0.3,
            "topic": interviewer.current_topic or "general"
        }), 200

@app.route('/api/start-code-practice', methods=['POST'])
def start_code_practice():
    """Start a coding practice session."""
    data = request.get_json(silent=True) or {}
    topic = data.get('topic', 'arrays')
    difficulty = data.get('difficulty', 'easy')
    try:
        result = interviewer.start_code_practice(topic, difficulty)
        return jsonify(result)
    except Exception as e:
        # Return 200 so the SPA can show the message instead of a generic axios failure.
        return jsonify({
            "success": False,
            "message": f"Could not start code practice: {str(e)}",
            "problem": None,
        })

@app.route('/api/get-hint', methods=['GET'])
def get_hint():
    """Get a hint for the current problem."""
    hint = interviewer.get_hint()
    return jsonify({"hint": hint})

@app.route('/api/submit-solution', methods=['POST'])
def submit_solution():
    """Submit and evaluate a solution."""
    data = request.get_json(silent=True) or {}
    raw = data.get('code')
    code = (raw if isinstance(raw, str) else "") or ""
    code = code.strip()
    if not code:
        return jsonify({
            "success": False,
            "message": "No code provided. Type or paste your solution in the editor.",
            "results": [],
            "skipped_tests": False,
        })
    try:
        result = interviewer.submit_solution(code)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Could not evaluate submission: {str(e)}",
            "results": [],
            "skipped_tests": False,
        })

@app.route('/api/confidence-dashboard', methods=['GET'])
def get_confidence_dashboard():
    """Get the confidence dashboard data."""
    try:
        dashboard = interviewer.get_confidence_dashboard()
        return jsonify(dashboard)
    except Exception as e:
        # Keep dashboard endpoint resilient for frontend polling.
        return jsonify({
            "summary": {
                "overall_confidence": 0,
                "topic_confidence": {},
                "strength_areas": [],
                "improvement_areas": [],
                "problem_success_rate": {},
                "response_quality": {},
            },
            "improvement_plan": {},
            "motivational_prompt": f"Dashboard temporarily unavailable: {str(e)}",
            "plot_path": ""
        }), 200

@app.route('/api/interview-summary', methods=['GET'])
def get_interview_summary():
    """Get the interview summary."""
    summary = interviewer.get_interview_summary()
    return jsonify(summary)

if __name__ == '__main__':
    # If Windows blocks port 5000, use: set PORT=5001 and REACT_APP_API_URL=http://127.0.0.1:5001 in frontend/.env
    port = int(os.environ.get("PORT", os.environ.get("FLASK_RUN_PORT", 5000)))
    app.run(host="0.0.0.0", port=port)