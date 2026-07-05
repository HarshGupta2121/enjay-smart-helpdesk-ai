
export const meta = {
  name: 'code-review-max',
  description: 'Max effort code review across multiple angles',
  phases: [
    { title: 'Find' },
    { title: 'Verify' }
  ]
};

const FINDINGS_SCHEMA = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          file: { type: "string" },
          line: { type: "number" },
          summary: { type: "string" },
          failure_scenario: { type: "string" }
        },
        required: ["file", "line", "summary", "failure_scenario"]
      }
    }
  },
  required: ["findings"]
};

const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["CONFIRMED", "PLAUSIBLE", "REFUTED"] },
    reason: { type: "string" }
  },
  required: ["verdict", "reason"]
};

const diff = args.diff;

const PROMPTS = [
  {
    label: 'correctness',
    prompt: `You are an expert reviewer. Find up to 6 correctness bugs in this diff.
Focus on:
- Angle A: line-by-line (inverted conditions, null derefs, missing awaits).
- Angle B: removed behavior (missing guards).
- Angle C: cross-file breaks (changed return shapes, preconditions).

Return JSON matching the schema.

DIFF:
${diff}`
  },
  {
    label: 'cleanup',
    prompt: `You are an expert reviewer. Find up to 6 cleanup issues in this diff.
Focus on:
- Reuse: Re-implementing existing helpers.
- Simplification: Unnecessary complexity, deep nesting, dead code.
- Efficiency: Wasted work, sequential independent IO, memory leaks from closures.

Return JSON matching the schema.

DIFF:
${diff}`
  },
  {
    label: 'architecture',
    prompt: `You are an expert reviewer. Find up to 6 architecture issues.
Focus on:
- Altitude: Fragile bandaids, special cases instead of generic infrastructure.
- Conventions: Violations of general enterprise TypeScript/React practices.

Return JSON matching the schema.

DIFF:
${diff}`
  }
];

phase('Find');
const findResults = await parallel(PROMPTS.map(p => () => 
  agent(p.prompt, { label: p.label, phase: 'Find', schema: FINDINGS_SCHEMA, effort: 'high' })
));

const allFindings = findResults.filter(Boolean).flatMap(r => r.findings);

// Dedup (naive by file and line)
const seen = new Set();
const deduped = [];
for (const f of allFindings) {
  const key = `${f.file}:${f.line}`;
  if (!seen.has(key)) {
    seen.add(key);
    deduped.push(f);
  }
}

phase('Verify');
const verified = await parallel(deduped.map(f => () => 
  agent(
    `Verify this finding:
File: ${f.file}:${f.line}
Summary: ${f.summary}
Scenario: ${f.failure_scenario}

Refute ONLY if constructible from code (factually wrong, impossible, or pure style).
Default to PLAUSIBLE. Return CONFIRMED, PLAUSIBLE, or REFUTED.

DIFF:
${diff}`, 
    { label: `verify:${f.file.split('/').pop()}`, phase: 'Verify', schema: VERDICT_SCHEMA }
  ).then(v => ({ ...f, verdict: v.verdict, verdict_reason: v.reason }))
));

const confirmed = verified.filter(Boolean).filter(f => f.verdict !== 'REFUTED');

// Sort by severity (CONFIRMED > PLAUSIBLE)
confirmed.sort((a, b) => {
  if (a.verdict === 'CONFIRMED' && b.verdict === 'PLAUSIBLE') return -1;
  if (a.verdict === 'PLAUSIBLE' && b.verdict === 'CONFIRMED') return 1;
  return 0;
});

return confirmed.slice(0, 10);
