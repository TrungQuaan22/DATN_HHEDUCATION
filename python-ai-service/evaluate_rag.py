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
    course_id: str
    lesson_id: str | None
    question: str
    expected_chunk_ids: list[str]
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
                    course_id=payload["course_id"],
                    lesson_id=payload.get("lesson_id"),
                    question=payload["question"],
                    expected_chunk_ids=list(payload.get("expected_chunk_ids", [])),
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
    hits = sum(1 for chunk_id in citation_ids if chunk_id in expected)
    return hits / len(expected)


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
    reciprocal_ranks: list[float] = []
    citation_coverages: list[float] = []
    answer_token_f1s: list[float] = []
    latencies_ms: list[int] = []
    context_counts: list[int] = []
    generation_failures = 0
    answer_modes: list[str] = []

    for sample in samples:
        if generate_answer:
            retrieval = retrieve_relevant_chunks(
                course_id=sample.course_id,
                lesson_id=sample.lesson_id,
                question=sample.question,
            )
            citations = retrieval["citations"]
            context_count = retrieval["retrieval"].get("context_count")
            if isinstance(context_count, int):
                context_counts.append(context_count)
            try:
                result = run_rag_tutor(
                    course_id=sample.course_id,
                    lesson_id=sample.lesson_id,
                    question=sample.question,
                    chat_history=[],
                )
                answer = result["answer"]
                latency_ms = result.get("latency_ms")
                if isinstance(latency_ms, int):
                    latencies_ms.append(latency_ms)
                answer_modes.append("llm")
            except Exception:
                generation_failures += 1
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

        recall = recall_at_k(citation_ids, sample.expected_chunk_ids)
        if recall is not None:
            retrieval_recalls.append(recall)

        rr = reciprocal_rank(citation_ids, sample.expected_chunk_ids)
        if sample.expected_chunk_ids:
            reciprocal_ranks.append(rr)

        if generate_answer:
            coverage = citation_sentence_coverage(answer)
            if coverage is not None:
                citation_coverages.append(coverage)
            if sample.reference_answer:
                f1 = token_f1(answer, sample.reference_answer)
                if f1 is not None:
                    answer_token_f1s.append(f1)

    return {
        "samples": len(samples),
        "retrieval_recall_at_k": mean(retrieval_recalls) if retrieval_recalls else None,
        "mrr": mean(reciprocal_ranks) if reciprocal_ranks else None,
        "citation_sentence_coverage": mean(citation_coverages) if citation_coverages else None,
        "answer_token_f1": mean(answer_token_f1s) if answer_token_f1s else None,
        "avg_latency_ms": mean(latencies_ms) if latencies_ms else None,
        "avg_context_count": mean(context_counts) if context_counts else None,
        "generation_failures": generation_failures,
        "answer_modes": answer_modes,
        "generate_answer": generate_answer,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate RAG retrieval and answer quality.")
    parser.add_argument("--dataset", required=True, help="Path to a JSONL dataset.")
    parser.add_argument(
        "--generate-answer",
        action="store_true",
        help="Also call the LLM so answer-level metrics can be measured.",
    )
    args = parser.parse_args()

    result = evaluate_dataset(Path(args.dataset), generate_answer=args.generate_answer)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
