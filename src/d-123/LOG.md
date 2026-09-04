## Day 123 — Few-shot & Chain-of-Thought (first mini-eval)

**Did:** Built my first mini-eval — a support-ticket classifier (labels: billing / technical / other) tested 3 prompting styles across 15 hand-written cases (45 calls, temp near 0).

**Results — 3 styles × 15 cases (1 = correct, 0 = wrong):**

| Style     | c1 | c2 | c3 | c4 | c5 | c6 | c7 | c8 | c9 | c10 | c11 | c12 | c13 | c14 | c15 | Total |
|-----------|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|-----|-----|-------|
| zero-shot | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 0  | 1   | 1   | 0   | 1   | 1   | 0   | 12/15 |
| 3-shot    | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 0  | 1  | 1   | 1   | 0   | 1   | 1   | 0   | 12/15 |
| CoT       | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 1  | 1   | 1   | 0   | 1   | 1   | 0   | 13/15 |

**Findings:**
- 3-shot scored the same as zero-shot and even broke case 8 — vague examples added token cost for zero gain.
- CoT edged ahead (13) by rescuing a case the others missed.
- Cases 12 & 15 failed on all three — some cases are just hard; better prompting doesn't fix them.

**Known limitation:** `extractLabel` scans the whole CoT answer with `.includes`, not just the final line — if reasoning mentions a label word while arguing for a different one, it mis-scores. Fix: instruct CoT to end with `Answer: <label>` and parse that line only.

**Criteria:** ✅ C1 (table) · ✅ C2 (explained few-shot vs waste, from my own data)

## Evals (Day 123)

An eval is a test suite for prompts. Same idea as unit tests, but the thing being tested is the AI's output. You hand-write cases where YOU know the right answer (the answer key), run the model on all of them at temperature ~0 (so results are repeatable), and count matches. Turns "seems fine" into a number you can compare.

Three prompt styles I tested:
- Zero-shot: just ask. No examples.
- Few-shot: show a few worked examples first, then ask. Helps when the model can't guess the pattern; wasted tokens when it already can.
- Chain-of-thought (CoT): tell it to reason step by step. Helps on complex tasks; costs extra tokens and needs parsing to pull the final answer out.

Analogy: training a new intern. Zero-shot = "sort these." Few-shot = "here are 3 I already did, match them." CoT = "talk me through your reasoning as you go."