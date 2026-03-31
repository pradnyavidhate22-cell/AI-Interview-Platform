import random
import re
from typing import List, Dict, Tuple, Optional
import csv
import spacy
import json
import subprocess
import tempfile
import os
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict

class CodePracticeEnvironment:
    def __init__(self):
        self.current_problem = None
        self.current_language = "python"
        self.code_templates = {
            "python": {
                "extension": ".py",
                "run_command": ["python", "{file}"]
            },
            "cpp": {
                "extension": ".cpp",
                "run_command": ["g++", "{file}", "-o", "{executable}", "&&", "{executable}"]
            },
            "java": {
                "extension": ".java",
                "run_command": ["javac", "{file}", "&&", "java", "{class}"]
            }
        }
        self.problems = self._load_dsa_dataset()

    def _fallback_problems(self) -> Dict:
        return {
            "arrays": [
                {
                    "title": "Find Second Largest Element",
                    "difficulty": "easy",
                    "description": "Write a function to find the second largest element in an array.",
                    "template": {
                        "python": "def find_second_largest(arr):\n    # Your code here\n    pass",
                        "cpp": "int findSecondLargest(vector<int>& arr) {\n    // Your code here\n    return 0;\n}",
                        "java": "public class Solution {\n    public static int findSecondLargest(int[] arr) {\n        // Your code here\n        return 0;\n    }\n}"
                    },
                    "test_cases": [
                        {"input": [1, 2, 3, 4, 5], "output": 4},
                        {"input": [5, 5, 5, 5], "output": 5},
                        {"input": [1], "output": None}
                    ],
                    "hints": [
                        "Try sorting the array first",
                        "Consider handling duplicate elements",
                        "Think about edge cases with small arrays"
                    ],
                    "entry_function": "find_second_largest",
                    "reference_approach": "Track max and second max in one pass; handle duplicates.",
                    "time_complexity": "O(n)",
                    "space_complexity": "O(1)",
                    "platform": "LeetCode",
                }
            ]
        }

    def _load_dsa_dataset(self) -> Dict:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, "backend", "data", "dsa_code_practice.csv")
        grouped = defaultdict(list)
        if not os.path.isfile(csv_path):
            return self._fallback_problems()
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                topic = (row.get("topic") or "").strip().lower()
                if topic not in ("arrays", "linked_lists", "trees", "graphs"):
                    continue
                diff = (row.get("difficulty") or "easy").strip().lower()
                if diff not in ("easy", "medium", "hard"):
                    diff = "easy"
                desc = (row.get("description") or "").strip()
                parts = [desc]
                ap = (row.get("approach") or "").strip()
                if ap:
                    parts.append(f"Approach: {ap}")
                tc = (row.get("time_complexity") or "").strip()
                sc = (row.get("space_complexity") or "").strip()
                if tc or sc:
                    parts.append(f"Expected complexity — time: {tc or 'n/a'}, space: {sc or 'n/a'}")
                pl = (row.get("platform") or "").strip()
                if pl:
                    parts.append(f"Platform: {pl}")
                description = "\n".join(parts)
                hints = [ap] if ap else ["Consider edge cases and match the function signature in the template."]
                tpl_py = (row.get("template_python") or "").strip()
                if not tpl_py or "def " not in tpl_py:
                    tpl_py = "def solve():\n    pass\n"
                else:
                    if not tpl_py.endswith("\n"):
                        tpl_py += "\n"
                test_cases = []
                tjson = (row.get("test_cases_json") or "").strip()
                if tjson:
                    try:
                        test_cases = json.loads(tjson)
                    except Exception:
                        test_cases = []
                entry = (row.get("entry_function") or "").strip() or None
                if test_cases and not entry:
                    m = re.search(r"^def\s+(\w+)\s*\(", tpl_py, re.MULTILINE)
                    if m:
                        entry = m.group(1)
                if test_cases and not entry:
                    test_cases = []
                cpp_stub = (
                    "int main() {\n    // Optional: implement in C++\n    return 0;\n}\n"
                )
                java_stub = "public class Solution {\n    // Optional: implement in Java\n}\n"
                grouped[topic].append({
                    "title": (row.get("title") or "Practice problem").strip(),
                    "difficulty": diff,
                    "description": description,
                    "template": {"python": tpl_py, "cpp": cpp_stub, "java": java_stub},
                    "test_cases": test_cases,
                    "hints": hints,
                    "entry_function": entry,
                    "reference_approach": ap,
                    "time_complexity": tc,
                    "space_complexity": sc,
                    "platform": pl,
                })
        if not any(grouped.values()):
            return self._fallback_problems()
        return dict(grouped)

    def get_problem(self, topic: str, difficulty: str = "easy") -> Dict:
        """Get a problem based on topic and difficulty."""
        available_problems = [p for p in self.problems.get(topic, [])
                            if p["difficulty"] == difficulty]
        if not available_problems:
            return None
        self.current_problem = random.choice(available_problems)
        return self.current_problem

    def get_code_template(self, language: str) -> str:
        """Get code template for the current problem in specified language."""
        if not self.current_problem:
            return ""
        self.current_language = language
        return self.current_problem["template"][language]

    def get_hint(self) -> str:
        """Get a random hint for the current problem."""
        if not self.current_problem:
            return "No problem selected"
        return random.choice(self.current_problem["hints"])

    def evaluate_solution(self, code: str) -> Dict:
        """Evaluate the submitted solution against test cases."""
        if not self.current_problem:
            return {
                "success": False,
                "message": "No problem selected. Start or refresh code practice first.",
                "results": [],
                "skipped_tests": False,
            }

        if not self.current_problem.get("test_cases"):
            return {
                "success": False,
                "results": [],
                "message": "No automated tests for this problem; AI review will assess your code.",
                "skipped_tests": True,
            }

        results = []
        with tempfile.NamedTemporaryFile(suffix=self.code_templates[self.current_language]["extension"],
                                       delete=False) as f:
            f.write(code.encode())
            file_path = f.name

        try:
            for test_case in self.current_problem["test_cases"]:
                test_code = self._prepare_test_case(code, test_case)
                with open(file_path, 'w', encoding="utf-8") as f:
                    f.write(test_code)

                result = self._execute_code(file_path)
                expected = test_case["output"]
                actual = self._parse_output(result)

                results.append({
                    "input": test_case["input"],
                    "expected": expected,
                    "actual": actual,
                    "passed": actual == expected
                })

        finally:
            os.unlink(file_path)

        return {
            "success": all(r["passed"] for r in results),
            "results": results,
            "skipped_tests": False,
        }

    def _prepare_test_case(self, code: str, test_case: Dict) -> str:
        """Prepare code with test case execution."""
        if self.current_language == "python":
            fn = (self.current_problem or {}).get("entry_function") or "find_second_largest"
            arg_repr = repr(test_case["input"])
            return (
                f"{code}\n\nif __name__ == '__main__':\n"
                f"    result = {fn}({arg_repr})\n"
                f"    print(repr(result))\n"
            )
        if self.current_language == "cpp":
            return (
                f"{code}\n\nint main() {{\n"
                f"    vector<int> arr = {test_case['input']};\n"
                f"    cout << findSecondLargest(arr) << endl;\n"
                f"    return 0;\n}}"
            )
        return (
            f"{code}\n\npublic static void main(String[] args) {{\n"
            f"    int[] arr = {test_case['input']};\n"
            f"    System.out.println(findSecondLargest(arr));\n}}"
        )

    def _execute_code(self, file_path: str) -> str:
        """Execute the code file and return output."""
        try:
            cmd = self.code_templates[self.current_language]["run_command"]
            cmd = [c.format(file=file_path,
                          executable=file_path.replace(".cpp", ""),
                          class_=os.path.splitext(os.path.basename(file_path))[0])
                  for c in cmd]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            return result.stdout.strip()
        except Exception as e:
            return f"Error: {str(e)}"

    def _parse_output(self, output: str) -> any:
        """Parse the output based on language."""
        try:
            if "Error:" in output:
                return None
            if self.current_language == "python":
                return eval(output)
            if self.current_language == "cpp":
                return int(output)
            return int(output)
        except Exception:
            return None

class ConfidenceTracker:
    def __init__(self):
        self.confidence_data = {
            "topics": defaultdict(list),
            "overall": [],
            "timestamps": [],
            "problem_success": defaultdict(list),
            "response_quality": defaultdict(list)
        }
        self.improvement_areas = set()
        self.strength_areas = set()
        self.motivational_prompts = [
            "Great progress! Keep pushing your boundaries.",
            "You're showing improvement in {topic}. Keep it up!",
            "Remember: every challenge is an opportunity to grow.",
            "Your dedication to learning is impressive!",
            "You've mastered {topic}! Time to tackle new challenges."
        ]
        self.improvement_suggestions = {
            "arrays": [
                "Practice array manipulation with different algorithms",
                "Focus on time complexity optimization",
                "Work on edge case handling"
            ],
            "linked_lists": [
                "Practice pointer manipulation",
                "Work on cycle detection problems",
                "Focus on memory efficiency"
            ],
            "trees": [
                "Practice different tree traversal methods",
                "Work on balanced tree operations",
                "Focus on recursive solutions"
            ],
            "graphs": [
                "Practice different graph algorithms",
                "Work on path finding problems",
                "Focus on graph representation"
            ]
        }

    def update_confidence(self, topic: str, confidence_score: float, 
                         problem_success: bool = None, response_quality: float = None):
        """Update confidence metrics for a topic."""
        timestamp = datetime.now()
        self.confidence_data["topics"][topic].append(confidence_score)
        self.confidence_data["timestamps"].append(timestamp)
        
        if problem_success is not None:
            self.confidence_data["problem_success"][topic].append(problem_success)
        if response_quality is not None:
            self.confidence_data["response_quality"][topic].append(response_quality)
        
        # Update overall confidence
        topics_map = self.confidence_data["topics"]
        if topics_map:
            self.confidence_data["overall"].append(
                sum(topics_map[t][-1] for t in topics_map) / len(topics_map)
            )
        
        self._update_areas(topic, confidence_score)

    def _update_areas(self, topic: str, confidence_score: float):
        """Update strength and improvement areas based on confidence scores."""
        if confidence_score >= 0.8:
            self.strength_areas.add(topic)
            if topic in self.improvement_areas:
                self.improvement_areas.remove(topic)
        elif confidence_score <= 0.4:
            self.improvement_areas.add(topic)
            if topic in self.strength_areas:
                self.strength_areas.remove(topic)

    def get_confidence_summary(self) -> Dict:
        """Get a summary of confidence levels across topics."""
        summary = {
            "overall_confidence": np.mean(self.confidence_data["overall"]) if self.confidence_data["overall"] else 0,
            "topic_confidence": {},
            "strength_areas": list(self.strength_areas),
            "improvement_areas": list(self.improvement_areas),
            "problem_success_rate": {},
            "response_quality": {}
        }
        
        for topic in self.confidence_data["topics"]:
            summary["topic_confidence"][topic] = np.mean(self.confidence_data["topics"][topic])
            if self.confidence_data["problem_success"][topic]:
                summary["problem_success_rate"][topic] = np.mean(self.confidence_data["problem_success"][topic])
            if self.confidence_data["response_quality"][topic]:
                summary["response_quality"][topic] = np.mean(self.confidence_data["response_quality"][topic])
        
        return summary

    def get_improvement_plan(self, topic: str) -> List[str]:
        """Get personalized improvement suggestions for a topic."""
        return self.improvement_suggestions.get(topic, ["Practice more problems in this area"])

    def get_motivational_prompt(self, topic: str = None) -> str:
        """Get a motivational prompt based on progress."""
        prompt = random.choice(self.motivational_prompts)
        if topic and "{topic}" in prompt:
            prompt = prompt.format(topic=topic)
        return prompt

    def generate_confidence_plot(self, topic: str = None) -> str:
        """Generate a confidence trend plot and save it to a file."""
        plt.figure(figsize=(10, 6))
        
        if topic:
            # Plot specific topic confidence
            plt.plot(self.confidence_data["timestamps"], 
                    self.confidence_data["topics"][topic], 
                    label=topic, marker='o')
        else:
            # Plot overall confidence
            plt.plot(self.confidence_data["timestamps"], 
                    self.confidence_data["overall"], 
                    label='Overall', marker='o')
        
        plt.title('Confidence Level Trends')
        plt.xlabel('Time')
        plt.ylabel('Confidence Score')
        plt.legend()
        plt.grid(True)
        
        # Save plot to temporary file
        plot_path = tempfile.mktemp(suffix='.png')
        plt.savefig(plot_path)
        plt.close()
        
        return plot_path

class AIInterviewer:
    def __init__(self):
        # Lazy-load heavy NLP models so Flask can start quickly.
        self.nlp = None
        self.sentiment_analyzer = None
        
        # Initialize code practice environment
        self.code_env = CodePracticeEnvironment()
        
        # Initialize confidence tracker
        self.confidence_tracker = ConfidenceTracker()
        
        # Load Q&A dataset for richer interview questions (fallback to built-ins if missing)
        self.dataset_questions: List[Dict[str, str]] = []
        self.dataset_index: int = 0
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            csv_path = os.path.join(base_dir, "backend", "name", "data", "qa_dataset.csv")
            with open(csv_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    q = (row.get("question") or "").strip()
                    if not q:
                        continue
                    self.dataset_questions.append(
                        {
                            "question": q,
                            "answer": (row.get("answer") or "").strip(),
                            "category": (row.get("category") or "").strip() or "dataset",
                            "difficulty": (row.get("difficulty") or "").strip() or "N/A",
                        }
                    )
        except Exception:
            # If dataset not available, we just rely on built-in topics.
            self.dataset_questions = []
            self.dataset_index = 0
        
        # Data structure topics and questions (kept as fallback)
        self.topics = {
            "arrays": [
                "How would you find the second largest element in an array?",
                "Explain how to find the majority element in an array.",
                "How would you rotate an array by k positions?"
            ],
            "linked_lists": [
                "How would you detect a cycle in a linked list?",
                "Explain how to reverse a linked list.",
                "How would you find the middle element of a linked list?"
            ],
            "trees": [
                "Explain how to find the height of a binary tree.",
                "How would you check if a binary tree is balanced?",
                "Explain how to perform a level-order traversal of a binary tree."
            ],
            "graphs": [
                "Explain how to detect a cycle in a directed graph.",
                "How would you find the shortest path between two nodes?",
                "Explain how to perform a depth-first search on a graph."
            ]
        }
        
        # Follow-up questions based on response quality
        self.follow_ups = {
            "optimization": [
                "Can you optimize your solution further?",
                "What's the time complexity of your solution?",
                "How would you improve the space complexity?"
            ],
            "implementation": [
                "Can you write the code for this solution?",
                "How would you handle edge cases?",
                "What are the potential issues with this approach?"
            ],
            "understanding": [
                "Can you explain why this approach works?",
                "What are the trade-offs of your solution?",
                "How would this solution scale with larger inputs?"
            ]
        }
        
        self.current_topic = None
        self.current_question = None
        self.interview_history = []

    def _get_dataset_row_for_question(self, question: str) -> Optional[Dict[str, str]]:
        q = (question or "").strip().lower()
        if not q or not self.dataset_questions:
            return None
        for row in self.dataset_questions:
            if (row.get("question") or "").strip().lower() == q:
                return row
        return None

    def _ensure_models(self) -> None:
        """Load NLP models on first use (avoids slow server startup)."""
        if self.nlp is None:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except Exception:
                # spaCy model is optional; fallback to heuristics if missing.
                self.nlp = None
        if self.sentiment_analyzer is None:
            try:
                from transformers import pipeline
                self.sentiment_analyzer = pipeline("sentiment-analysis")
            except Exception:
                # If transformers/torch is misconfigured, keep the backend usable.
                self.sentiment_analyzer = None

    def _try_groq_interview_update(
        self,
        question: str,
        user_answer: str,
        heuristic_feedback: str,
        heuristic_next_question: str,
        heuristic_suggestions: List[str],
        heuristic_improved_answer: str,
    ) -> Optional[Dict]:
        """
        Best-effort Groq call to upgrade correction/suggestions.
        Falls back to heuristics if Groq isn't installed or parsing fails.
        """
        try:
            from groq import Groq
        except Exception:
            return None

        # Key currently exists in this repo in `backend/name/utils/groq_helper.py`.
        # Keeping it here minimizes changes, but you should move to env var later.
        api_key = "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"

        try:
            client = Groq(api_key=api_key)
            prompt = f"""
You are a strict technical interviewer.
The interview question is the ONLY topic you are allowed to answer.

Interview topic (context): {self.current_topic}
Question (MUST be followed exactly):
{question}

Candidate Answer:
{user_answer}

Heuristic draft (use as baseline; do not ignore):
- feedback: {heuristic_feedback}
- improved_answer: {heuristic_improved_answer}
- suggestions: {heuristic_suggestions}
- next_question suggestion: {heuristic_next_question}

            Task:
1) Decide if the candidate answer is correct for the given question.
2) Ground your feedback in the candidate answer text:
   - Quote 1 short phrase (<=10 words) from Candidate Answer in your feedback.
   - Explicitly state what is correct or incorrect about that phrase for THIS question.
   - If the candidate gave no useful answer (empty / "I don't know"), say that clearly and still provide the improved answer.
3) If incorrect/incomplete, explain specifically what is wrong/missing about THIS question.
4) Produce improved_answer that directly answers the given question with the correct ideas (no generic advice, no other topics). It must correct the candidate’s mistakes if any.
5) Produce suggestions that are actionable and directly related to the given question (not generic study tips).
6) Set next_question to the provided next_question suggestion unless you are confident it should be changed.

Output rules:
- improved_answer must directly answer the given question (no generic content).
- suggestions must be an array of EXACTLY 3 strings, each directly tied to the given question AND the candidate’s mistakes (when present).
- feedback must include a "You said:" quote from Candidate Answer.
- next_question must be a single string.

Return ONLY valid JSON in this exact schema (no markdown, no extra text):
{{
  "feedback": string,
  "next_question": string,
  "improved_answer": string,
  "suggestions": [string, string, string]
}}
"""
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.05,
                max_tokens=450,
            )
            raw = completion.choices[0].message.content or ""

            # Extract JSON if the model adds any leading/trailing text.
            start = raw.find("{")
            end = raw.rfind("}")
            if start == -1 or end == -1 or end <= start:
                return None

            payload = json.loads(raw[start:end + 1])
            if not isinstance(payload, dict):
                return None

            # Ensure required keys exist; let missing keys fall back to heuristics.
            for k in ["feedback", "next_question", "improved_answer", "suggestions"]:
                if k not in payload:
                    return None
            if not isinstance(payload["suggestions"], list):
                return None
            # Enforce schema rigidity so the frontend stays consistent.
            if len(payload["suggestions"]) != 3:
                return None

            return payload
        except Exception:
            return None

    def _try_groq_code_review(self, user_code: str, eval_result: Dict) -> Optional[Dict]:
        """Use Groq to explain mistakes and suggest corrected Python when tests fail or tests are skipped."""
        try:
            from groq import Groq
        except Exception:
            return None

        cp = self.code_env.current_problem
        if not cp:
            return None

        api_key = "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"

        try:
            client = Groq(api_key=api_key)
            prob_block = "\n".join(
                [
                    cp.get("title") or "",
                    cp.get("description") or "",
                    f"Reference approach: {cp.get('reference_approach') or 'See problem description.'}",
                    f"Target complexity — time: {cp.get('time_complexity') or 'n/a'}, space: {cp.get('space_complexity') or 'n/a'}",
                ]
            )
            tests_blob = json.dumps(eval_result.get("results") or [], default=str)
            skipped = bool(eval_result.get("skipped_tests"))
            prompt = f"""
You are a Python DSA tutor. The student submitted code for one problem.

Problem (with hints on expected approach):
{prob_block}

Student code:
```python
{user_code}
```

Automated tests were {"skipped (no local runner)" if skipped else "executed"}.
Test summary (JSON): {tests_blob}

Tasks:
1) If tests failed or were skipped, judge correctness from the problem statement and the code.
2) Explain clearly what is wrong or missing (reference failing cases when present).
3) Provide a complete corrected Python solution using the SAME top-level function name as in the student template (the function the tests call).

Return ONLY valid JSON (no markdown) in this exact schema:
{{"code_feedback": string, "corrected_code": string}}
"""
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1800,
            )
            raw = completion.choices[0].message.content or ""
            start = raw.find("{")
            end = raw.rfind("}")
            if start == -1 or end == -1 or end <= start:
                return None
            payload = json.loads(raw[start : end + 1])
            if not isinstance(payload, dict):
                return None
            if "code_feedback" not in payload or "corrected_code" not in payload:
                return None
            return {
                "code_feedback": str(payload["code_feedback"]),
                "corrected_code": str(payload["corrected_code"]),
            }
        except Exception:
            return None

    def start_interview(self) -> str:
        """Start the interview with a random topic and question."""
        # Prefer dataset-driven questions when available
        if self.dataset_questions:
            row = self.dataset_questions[self.dataset_index % len(self.dataset_questions)]
            self.current_topic = row["category"]
            self.current_question = row["question"]
            # Move index so the next question is different
            self.dataset_index = (self.dataset_index + 1) % len(self.dataset_questions)
            return f"Let's discuss {self.current_topic.replace('_', ' ')}. {self.current_question}"
        # Fallback: built-in topic lists
        self.current_topic = random.choice(list(self.topics.keys()))
        self.current_question = random.choice(self.topics[self.current_topic])
        return f"Let's discuss {self.current_topic.replace('_', ' ')}. {self.current_question}"

    def analyze_response(self, response: str) -> Dict:
        """
        Analyze the student's response and generate appropriate follow-up.
        Returns a structured object for the frontend.
        """
        # Load models on demand (first request may be slow).
        self._ensure_models()
        response_text = (response or "").strip()
        response_lower = response_text.lower()

        # If candidate gives no useful answer, provide deterministic correction
        # (avoids LLM prompt leakage and keeps interview flow stable).
        no_answer_signals = {
            "",
            "i don't know",
            "i dont know",
            "dont know",
            "don't know",
            "no idea",
            "idk",
        }
        if response_lower in no_answer_signals:
            response_quality = 0.3
            sentiment = {"label": "POSITIVE"}
            row = self._get_dataset_row_for_question(self.current_question)
            if row and row.get("answer"):
                improved_answer = row["answer"]
            else:
                improved_answer = (
                    f"A better answer for this question is:\n"
                    f"- Define the concept clearly.\n"
                    f"- Explain key operations/properties.\n"
                    f"- Mention complexity and one practical use case."
                )
            feedback = "You said: 'I don't know'. That's okay—here is the correct answer and how to structure it."
            suggestions = [
                "State a direct definition first.",
                "Add 1-2 core points (operations, properties, or steps).",
                "Mention complexity and one edge case/use case."
            ]
            next_question = random.choice(self.follow_ups["understanding"])
        # If spaCy isn't available, we use lightweight heuristics.
        elif self.nlp is None:
            response_lower = (response or "").lower()
            words = [w.strip(".,!?;:\"'()[]{}") for w in response_lower.split() if w.strip()]
            technical_terms = [w for w in words if len(w) > 4]

            # Score: length + keyword density.
            base_score = 0.3
            term_bonus = min(len(technical_terms) * 0.02, 0.35)
            length_bonus = min(len(words) / 200, 0.2)
            response_quality = min(base_score + term_bonus + length_bonus, 1.0)

            sentiment = {"label": "POSITIVE"}

            # Feedback
            if len(technical_terms) < 3:
                feedback = "Try to use more technical terms and be more specific in your explanation."
            else:
                feedback = "Good explanation! Let's explore this further."

            # Follow-up (will be overridden by dataset question below when available)
            if len(words) < 50:
                next_question = random.choice(self.follow_ups["understanding"])
            elif "complexity" not in response_lower:
                next_question = random.choice(self.follow_ups["optimization"])
            else:
                next_question = random.choice(self.follow_ups["implementation"])

            # Suggestions
            suggestions: List[str] = []
            if len(technical_terms) < 3:
                suggestions.append("Add more technical terms and be specific about your approach.")
            if len(words) < 50:
                suggestions.append("Expand your explanation with step-by-step reasoning (how you get from idea to result).")
            if response_quality < 0.6:
                suggestions.append("State the time/space complexity and mention at least one edge case.")
            if not suggestions:
                suggestions.append("Keep going—try adding trade-offs and complexity details to make your answer stronger.")

            # Improved answer template
            keywords = []
            seen = set()
            for t in technical_terms:
                if t not in seen:
                    seen.add(t)
                    keywords.append(t)
                if len(keywords) >= 6:
                    break
            keyword_line = ", ".join(keywords) if keywords else "key ideas"
            improved_answer = (
                f"A stronger answer for: {self.current_question}\n"
                f"- Core idea: explain the main approach in one or two sentences.\n"
                f"- Steps: walk through the key steps (what you do first, next, and why).\n"
                f"- Complexity/edge cases: mention time/space complexity and at least one edge case.\n"
                f"- Key terms to include: {keyword_line}\n"
                f"Try to be clearer and more structured in your explanation."
            )
        else:
            # Analyze response using NLP
            doc = self.nlp(response)
            if self.sentiment_analyzer is not None:
                sentiment = self.sentiment_analyzer(response)[0]
            else:
                # Fallback when transformers can't load: treat as neutral/positive.
                sentiment = {"label": "POSITIVE"}

            # Calculate response quality score
            response_quality = self._calculate_response_quality(doc, sentiment)

            # Generate feedback and follow-up based on response analysis
            feedback = self._generate_feedback(doc, sentiment)
            next_question = self._generate_follow_up(doc, sentiment, response)
            suggestions = self._generate_suggestions(doc, sentiment, response_quality)
            improved_answer = self._generate_improved_answer(doc, sentiment)
        
        # Update confidence metrics
        self.confidence_tracker.update_confidence(
            self.current_topic,
            response_quality,
            response_quality=response_quality
        )
        
        # Store response in history
        self.interview_history.append({
            "topic": self.current_topic,
            "question": self.current_question,
            "response": response,
            "sentiment": sentiment,
            "quality": response_quality
        })
        
        # If we have a dataset, prefer using the next dataset row as the next interview question.
        if self.dataset_questions:
            row = self.dataset_questions[self.dataset_index % len(self.dataset_questions)]
            self.current_topic = row["category"] or self.current_topic
            next_question = row["question"]
            self.dataset_index = (self.dataset_index + 1) % len(self.dataset_questions)
        
        # Optional: use Groq to upgrade correction and suggestions.
        # If it fails, we keep the heuristic outputs (backend stays stable).
        groq_payload = self._try_groq_interview_update(
            question=self.current_question,
            user_answer=response,
            heuristic_feedback=feedback,
            heuristic_next_question=next_question,
            heuristic_suggestions=suggestions,
            heuristic_improved_answer=improved_answer,
        )
        if groq_payload:
            feedback = groq_payload.get("feedback", feedback)
            next_question = groq_payload.get("next_question", next_question)
            improved_answer = groq_payload.get("improved_answer", improved_answer)
            suggestions = groq_payload.get("suggestions", suggestions)

        # Advance interview state so the next evaluation uses the question we just returned.
        self.current_question = next_question

        # Keep `feedback` + `next_question` keys for backward compatibility.
        return {
            "feedback": feedback,
            "next_question": next_question,
            "suggestions": suggestions,
            "improved_answer": improved_answer,
            "confidence_score": response_quality,
            "topic": self.current_topic
        }

    def _calculate_response_quality(self, doc: spacy.tokens.Doc, sentiment: Dict) -> float:
        """Calculate a quality score for the response."""
        # Base score from sentiment
        base_score = 0.5 if sentiment["label"] == "POSITIVE" else 0.3
        
        # Technical terms bonus
        technical_terms = [token.text for token in doc if token.pos_ in ["NOUN", "VERB"]]
        term_bonus = min(len(technical_terms) * 0.1, 0.3)
        
        # Length bonus
        length_bonus = min(len(doc) / 200, 0.2)
        
        return min(base_score + term_bonus + length_bonus, 1.0)

    def _generate_feedback(self, doc: spacy.tokens.Doc, sentiment: Dict) -> str:
        """Generate feedback based on response analysis."""
        # Check for technical terms
        technical_terms = [token.text for token in doc if token.pos_ in ["NOUN", "VERB"]]
        
        if len(technical_terms) < 3:
            return "Try to use more technical terms and be more specific in your explanation."
        elif sentiment["label"] == "NEGATIVE":
            return "Your explanation seems unclear. Try to break down the problem into smaller parts."
        else:
            return "Good explanation! Let's explore this further."

    def _generate_follow_up(self, doc: spacy.tokens.Doc, sentiment: Dict, response_text: str) -> str:
        """Generate appropriate follow-up question based on response analysis."""
        # Check response length and complexity
        if len(doc) < 50:
            return random.choice(self.follow_ups["understanding"])
        elif "complexity" not in response_text.lower():
            return random.choice(self.follow_ups["optimization"])
        else:
            return random.choice(self.follow_ups["implementation"])

    def _generate_suggestions(self, doc: spacy.tokens.Doc, sentiment: Dict, response_quality: float) -> List[str]:
        """Heuristic suggestions (kept lightweight: no extra model calls)."""
        technical_terms = [token.text for token in doc if token.pos_ in ["NOUN", "VERB"]]
        suggestions: List[str] = []

        if len(technical_terms) < 3:
            suggestions.append("Add more technical terms and be specific about your approach.")

        if len(doc) < 50:
            suggestions.append("Expand your explanation with step-by-step reasoning (how you get from idea to result).")

        if sentiment["label"] == "NEGATIVE":
            suggestions.append("Clarify your structure: intro -> approach -> key steps -> complexity/edge cases.")

        if response_quality < 0.6:
            suggestions.append("State the time/space complexity and mention at least one edge case.")

        if not suggestions:
            suggestions.append("Keep going—try adding trade-offs and complexity details to make your answer stronger.")

        return suggestions

    def _generate_improved_answer(self, doc: spacy.tokens.Doc, sentiment: Dict) -> str:
        """Generate an 'improved answer' template using extracted keywords."""
        technical_terms = [token.text for token in doc if token.pos_ in ["NOUN", "VERB"]]
        # De-duplicate while preserving order (small heuristic for nicer output)
        seen = set()
        keywords = []
        for t in technical_terms:
            lt = t.lower()
            if lt not in seen:
                seen.add(lt)
                keywords.append(t)
            if len(keywords) >= 6:
                break

        keyword_line = ", ".join(keywords) if keywords else "key ideas"
        clarity_line = "Try to be clearer and more structured in your explanation." if sentiment["label"] == "NEGATIVE" else "Your core idea is good—make it more complete and precise."

        return (
            f"A stronger answer for: {self.current_question}\n"
            f"- Core idea: explain the main approach in one or two sentences.\n"
            f"- Steps: walk through the key steps (what you do first, next, and why).\n"
            f"- Complexity/edge cases: mention time/space complexity and at least one edge case.\n"
            f"- Key terms to include: {keyword_line}\n"
            f"{clarity_line}"
        )

    def get_interview_summary(self) -> Dict:
        """Return a summary of the interview session."""
        return {
            "total_questions": len(self.interview_history),
            "topics_covered": list(set(item["topic"] for item in self.interview_history)),
            "average_sentiment": sum(1 for item in self.interview_history if item["sentiment"]["label"] == "POSITIVE") / len(self.interview_history),
            "confidence_summary": self.confidence_tracker.get_confidence_summary()
        }

    def start_code_practice(self, topic: str, difficulty: str = "easy") -> Dict:
        """Start a coding practice session."""
        problem = self.code_env.get_problem(topic, difficulty)
        if not problem:
            return {"success": False, "message": "No problems available for this topic and difficulty"}
        
        return {
            "success": True,
            "problem": {
                "title": problem["title"],
                "description": problem["description"],
                "template": self.code_env.get_code_template(self.code_env.current_language)
            }
        }

    def get_hint(self) -> str:
        """Get a hint for the current coding problem."""
        return self.code_env.get_hint()

    def submit_solution(self, code: str) -> Dict:
        """Submit and evaluate a solution."""
        try:
            result = dict(self.code_env.evaluate_solution(code))
        except Exception as e:
            return {
                "success": False,
                "message": f"Could not run tests: {str(e)}",
                "results": [],
                "skipped_tests": False,
            }

        if not result.get("success") or result.get("skipped_tests"):
            groq_code = self._try_groq_code_review(code, result)
            if groq_code:
                result.update(groq_code)

        if self.current_topic and not result.get("skipped_tests"):
            try:
                self.confidence_tracker.update_confidence(
                    self.current_topic,
                    result["success"],
                    problem_success=result["success"],
                )
            except Exception:
                pass

        return result

    def get_confidence_dashboard(self) -> Dict:
        """Get the confidence dashboard data."""
        return {
            "summary": self.confidence_tracker.get_confidence_summary(),
            "improvement_plan": {
                topic: self.confidence_tracker.get_improvement_plan(topic)
                for topic in self.confidence_tracker.improvement_areas
            },
            "motivational_prompt": self.confidence_tracker.get_motivational_prompt(self.current_topic),
            "plot_path": self.confidence_tracker.generate_confidence_plot(self.current_topic)
        }

# Example usage
if __name__ == "__main__":
    interviewer = AIInterviewer()
    
    # Start interview
    print(interviewer.start_interview())
    
    # Example response
    response = "To find the second largest element, I would first sort the array in descending order and then return the second element. The time complexity would be O(n log n) due to sorting."
    
    # Analyze response
    result = interviewer.analyze_response(response)
    print(f"\nFeedback: {result['feedback']}")
    print(f"Next Question: {result['next_question']}")
    
    # Start code practice
    practice = interviewer.start_code_practice("arrays", "easy")
    if practice["success"]:
        print("\nCoding Problem:")
        print(f"Title: {practice['problem']['title']}")
        print(f"Description: {practice['problem']['description']}")
        print("\nTemplate:")
        print(practice['problem']['template'])
        
        # Example solution
        solution = """
def find_second_largest(arr):
    if len(arr) < 2:
        return None
    unique_elements = sorted(set(arr), reverse=True)
    return unique_elements[1] if len(unique_elements) > 1 else unique_elements[0]
"""
        print("\nEvaluating solution...")
        result = interviewer.submit_solution(solution)
        print("Evaluation results:", json.dumps(result, indent=2))
    
    # Get confidence dashboard
    dashboard = interviewer.get_confidence_dashboard()
    print("\nConfidence Dashboard:")
    print("Summary:", json.dumps(dashboard["summary"], indent=2))
    print("Improvement Plan:", json.dumps(dashboard["improvement_plan"], indent=2))
    print("Motivational Prompt:", dashboard["motivational_prompt"])
    print("Confidence Plot saved to:", dashboard["plot_path"])
    
    # Get interview summary
    summary = interviewer.get_interview_summary()
    print("\nInterview Summary:", summary) 