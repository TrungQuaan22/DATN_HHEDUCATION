from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from statistics import mean

from rag_service import retrieve_relevant_chunks, run_rag_tutor


SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+|\n+")
CITATION_RE = re.compile(r"\[(\d+)\]")


@dataclass
class EvalSample:
    sample_id: str
    category: str
    course_id: str
    lesson_id: str | None
    question: str
    expected_chunk_ids: list[str]
    expected_material_ids: list[str]
    expected_answerable: bool
    reference_answer: str | None = None


def load_dataset(path: Path) -> list[EvalSample]:
    samples: list[EvalSample] = []
    with path.open("r", encoding="utf-8-sig") as file:
        for raw_line in file:
            line = raw_line.strip()
            if not line:
                continue
            payload = json.loads(line)
            samples.append(
                EvalSample(
                    sample_id=payload["sample_id"],
                    category=payload["category"],
                    course_id=payload["course_id"],
                    lesson_id=payload.get("lesson_id"),
                    question=payload["question"],
                    expected_chunk_ids=list(payload.get("expected_chunk_ids", [])),
                    expected_material_ids=list(payload.get("expected_material_ids", [])),
                    expected_answerable=bool(payload.get("expected_answerable", True)),
                    reference_answer=payload.get("reference_answer"),
                )
            )
    return samples


def split_sentences(text: str) -> list[str]:
    parts = [part.strip() for part in SENTENCE_SPLIT_RE.split(text.strip())]
    return [part for part in parts if part]


def citation_sentence_coverage(answer: str) -> float | None:
    sentences = split_sentences(answer)
    if not sentences:
        return None

    cited_sentences = sum(1 for sentence in sentences if CITATION_RE.search(sentence))
    return cited_sentences / len(sentences)


def reciprocal_rank(citation_ids: list[str], expected_chunk_ids: list[str]) -> float:
    expected = set(expected_chunk_ids)
    for index, chunk_id in enumerate(citation_ids, start=1):
        if chunk_id in expected:
            return 1.0 / index
    return 0.0


def recall_at_k(citation_ids: list[str], expected_chunk_ids: list[str]) -> float | None:
    if not expected_chunk_ids:
        return None
    expected = set(expected_chunk_ids)
    hits = len(set(citation_ids) & expected)
    return hits / len(expected)


REFUSAL_MARKERS = (
    "chưa cung cấp",
    "không cung cấp",
    "không có thông tin",
    "không đề cập",
    "không nêu",
    "không đủ thông tin",
    "không thể trả lời",
)


def is_refusal(answer: str) -> bool:
    normalized = answer.lower()
    return any(marker in normalized for marker in REFUSAL_MARKERS)


def tokenize(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[\wÀ-ỹ]+", text.lower())
        if len(token) > 1
    }


def token_f1(prediction: str, reference: str) -> float | None:
    pred_tokens = tokenize(prediction)
    ref_tokens = tokenize(reference)
    if not pred_tokens or not ref_tokens:
        return None

    overlap = len(pred_tokens & ref_tokens)
    if overlap == 0:
        return 0.0

    precision = overlap / len(pred_tokens)
    recall = overlap / len(ref_tokens)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


def build_fallback_answer(citations: list[dict]) -> str:
    if not citations:
        return ""

    sentences: list[str] = []
    for index, citation in enumerate(citations[:3], start=1):
        source = citation.get("source_title") or "Tài liệu"
        quote = (citation.get("quote") or source).replace("\n", " ").strip()
        if len(quote) > 180:
            quote = quote[:180].rstrip() + "..."
        sentences.append(f"{quote} [{index}]")

    return " ".join(sentences)


def evaluate_dataset(path: Path, generate_answer: bool) -> dict:
    samples = load_dataset(path)
    if not samples:
        raise ValueError("Dataset is empty")

    retrieval_recalls: list[float] = []
    source_recalls: list[float] = []
    reciprocal_ranks: list[float] = []
    citation_coverages: list[float] = []
    answer_token_f1s: list[float] = []
    latencies_ms: list[int] = []
    context_counts: list[int] = []
    generation_failures = 0
    answer_modes: list[str] = []
    providers: set[str] = set()
    models: set[str] = set()
    retrieval_hits = 0
    full_source_hits = 0
    answerable_response_hits = 0
    refusal_hits = 0
    answerable_samples = sum(1 for sample in samples if sample.expected_answerable)
    unanswerable_samples = len(samples) - answerable_samples
    per_sample: list[dict] = []

    for sample in samples:
        latency_ms: int | None = None
        if generate_answer:
            try:
                result = run_rag_tutor(
                    course_id=sample.course_id,
                    lesson_id=sample.lesson_id,
                    question=sample.question,
                    chat_history=[],
                )
                answer = result["answer"]
                citations = result["citations"]
                context_count = result["retrieval"].get("context_count")
                if isinstance(context_count, int):
                    context_counts.append(context_count)
                latency_ms = result.get("latency_ms")
                if isinstance(latency_ms, int):
                    latencies_ms.append(latency_ms)
                provider = result.get("provider")
                model = result.get("model_name")
                if isinstance(provider, str):
                    providers.add(provider)
                if isinstance(model, str):
                    models.add(model)
                answer_modes.append("llm")
            except Exception:
                generation_failures += 1
                retrieval = retrieve_relevant_chunks(
                    course_id=sample.course_id,
                    lesson_id=sample.lesson_id,
                    question=sample.question,
                )
                citations = retrieval["citations"]
                context_count = retrieval["retrieval"].get("context_count")
                if isinstance(context_count, int):
                    context_counts.append(context_count)
                answer = build_fallback_answer(citations)
                answer_modes.append("fallback")
        else:
            retrieval = retrieve_relevant_chunks(
                course_id=sample.course_id,
                lesson_id=sample.lesson_id,
                question=sample.question,
            )
            answer = ""
            citations = retrieval["citations"]
            context_count = retrieval["retrieval"].get("context_count")
            if isinstance(context_count, int):
                context_counts.append(context_count)

        citation_ids = [citation["chunk_id"] for citation in citations]
        citation_material_ids = [
            citation["material_id"]
            for citation in citations
            if isinstance(citation.get("material_id"), str)
        ]

        recall = recall_at_k(citation_ids, sample.expected_chunk_ids)
        if recall is not None:
            retrieval_recalls.append(recall)
            if recall > 0:
                retrieval_hits += 1

        source_recall = recall_at_k(citation_material_ids, sample.expected_material_ids)
        if source_recall is not None:
            source_recalls.append(source_recall)
            if source_recall == 1:
                full_source_hits += 1

        rr = reciprocal_rank(citation_ids, sample.expected_chunk_ids)
        if sample.expected_chunk_ids:
            reciprocal_ranks.append(rr)

        coverage: float | None = None
        f1: float | None = None
        if generate_answer:
            refused = is_refusal(answer)
            if sample.expected_answerable:
                if not refused:
                    answerable_response_hits += 1
                coverage = citation_sentence_coverage(answer)
                if coverage is not None:
                    citation_coverages.append(coverage)
            elif refused:
                refusal_hits += 1

            if sample.expected_answerable and sample.reference_answer:
                f1 = token_f1(answer, sample.reference_answer)
                if f1 is not None:
                    answer_token_f1s.append(f1)

        per_sample.append(
            {
                "sample_id": sample.sample_id,
                "category": sample.category,
                "expected_answerable": sample.expected_answerable,
                "retrieved_chunk_ids": citation_ids,
                "retrieved_material_ids": list(dict.fromkeys(citation_material_ids)),
                "retrieval_recall_at_k": recall,
                "source_recall_at_k": source_recall,
                "reciprocal_rank": rr if sample.expected_chunk_ids else None,
                "context_count": len(citations),
                "answer": answer if generate_answer else None,
                "refused": is_refusal(answer) if generate_answer else None,
                "citation_sentence_coverage": coverage,
                "answer_token_f1": f1,
                "latency_ms": latency_ms,
            }
        )

    category_results: dict[str, dict] = {}
    for category in sorted({sample.category for sample in samples}):
        category_rows = [row for row in per_sample if row["category"] == category]
        category_recalls = [
            row["retrieval_recall_at_k"]
            for row in category_rows
            if row["retrieval_recall_at_k"] is not None
        ]
        category_source_recalls = [
            row["source_recall_at_k"]
            for row in category_rows
            if row["source_recall_at_k"] is not None
        ]
        category_results[category] = {
            "samples": len(category_rows),
            "retrieval_recall_at_k": mean(category_recalls) if category_recalls else None,
            "source_recall_at_k": mean(category_source_recalls) if category_source_recalls else None,
            "refusal_accuracy": (
                mean(1.0 if row["refused"] else 0.0 for row in category_rows)
                if generate_answer and all(not row["expected_answerable"] for row in category_rows)
                else None
            ),
        }

    return {
        "samples": len(samples),
        "answerable_samples": answerable_samples,
        "unanswerable_samples": unanswerable_samples,
        "retrieval_recall_at_k": mean(retrieval_recalls) if retrieval_recalls else None,
        "retrieval_hit_rate": retrieval_hits / answerable_samples if answerable_samples else None,
        "mrr": mean(reciprocal_ranks) if reciprocal_ranks else None,
        "source_recall_at_k": mean(source_recalls) if source_recalls else None,
        "full_source_retrieval_rate": full_source_hits / answerable_samples if answerable_samples else None,
        "citation_sentence_coverage": mean(citation_coverages) if citation_coverages else None,
        "answer_token_f1": mean(answer_token_f1s) if answer_token_f1s else None,
        "answerable_response_rate": (
            answerable_response_hits / answerable_samples if generate_answer and answerable_samples else None
        ),
        "refusal_accuracy": (
            refusal_hits / unanswerable_samples if generate_answer and unanswerable_samples else None
        ),
        "avg_latency_ms": mean(latencies_ms) if latencies_ms else None,
        "avg_context_count": mean(context_counts) if context_counts else None,
        "generation_failures": generation_failures,
        "providers": sorted(providers),
        "models": sorted(models),
        "answer_modes": answer_modes,
        "generate_answer": generate_answer,
        "categories": category_results,
        "per_sample": per_sample,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate RAG retrieval and answer quality.")
    parser.add_argument("--dataset", required=True, help="Path to a JSONL dataset.")
    parser.add_argument(
        "--generate-answer",
        action="store_true",
        help="Also call the LLM so answer-level metrics can be measured.",
    )
    parser.add_argument("--output", help="Optional path for the JSON evaluation result.")
    args = parser.parse_args()

    result = evaluate_dataset(Path(args.dataset), generate_answer=args.generate_answer)
    if args.output:
        Path(args.output).write_text(
            json.dumps(result, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
