import unittest
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from app import app

class TestChatbotAndStorage(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_chat_general_query(self):
        response = self.client.post("/api/chat", json={
            "message": "What is forced arbitration?"
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("reply", data)
        self.assertIn("Arbitration", data["reply"])

    def test_chat_scanned_doc_context(self):
        active_scan = {
            "document_name": "Test Social App Policy",
            "safety_score": 38,
            "risk_score": 38,
            "risk_level": "CRITICAL",
            "all_clauses": [
                {
                    "text": "We may share and monetize your personal data with third party service providers.",
                    "category_id": "data_sharing",
                    "category_name": "Third-Party Data Sharing",
                    "section_title": "Section 8.2 Data Sharing"
                }
            ],
            "flagged_clauses": [
                {
                    "text": "We may share and monetize your personal data with third party service providers.",
                    "category_id": "data_sharing",
                    "category_name": "Third-Party Data Sharing",
                    "section_title": "Section 8.2 Data Sharing"
                }
            ]
        }

        response = self.client.post("/api/chat", json={
            "message": "Is my data being shared with third parties?",
            "active_scan": active_scan
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("Test Social App Policy", data["reply"])
        self.assertIn("share", data["reply"].lower())

if __name__ == "__main__":
    unittest.main()
