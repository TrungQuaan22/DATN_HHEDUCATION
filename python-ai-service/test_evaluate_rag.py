from __future__ import annotations

import unittest

from evaluate_rag import is_refusal, recall_at_k, token_f1


class EvaluateRagMetricsTest(unittest.TestCase):
    def test_recall_counts_duplicate_retrieval_only_once(self) -> None:
        self.assertEqual(recall_at_k(["a", "a", "b"], ["a", "c"]), 0.5)

    def test_refusal_detects_missing_information_response(self) -> None:
        self.assertTrue(is_refusal("Tài liệu hiện tại chưa cung cấp thông tin này."))

    def test_refusal_does_not_mark_a_supported_answer(self) -> None:
        self.assertFalse(is_refusal("Văn học phản ánh đời sống thông qua hình tượng."))

    def test_token_f1_is_one_for_same_tokens(self) -> None:
        self.assertEqual(token_f1("Văn học phản ánh hiện thực", "Văn học phản ánh hiện thực"), 1.0)


if __name__ == "__main__":
    unittest.main()
