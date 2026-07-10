import { GRADING_SYSTEM_PROMPT, buildUserPrompt, GradingCandidate, GradingResponse, mockGrade } from "../_shared/grading.ts";

const RESPONSE_SCHEMA = {
  name: "grading_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            user_id: { type: "string" },
            rank: { type: "integer", enum: [1, 2, 3, 4, 5] },
            points: { type: "integer" },
            commentary: { type: "string" },
            regression_flag: { type: "boolean" },
          },
          required: ["user_id", "rank", "points", "commentary", "regression_flag"],
        },
      },
      inflation_penalty_applied: { type: "boolean" },
      group_commentary: { type: ["string", "null"] },
    },
    required: ["results", "inflation_penalty_applied", "group_commentary"],
  },
} as const;

export async function gradeCandidates(candidates: GradingCandidate[]): Promise<GradingResponse> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    // No key configured locally — use a deterministic fixture so the pipeline is testable for free.
    return mockGrade(candidates);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GRADING_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(candidates) },
      ],
      response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response had no content");

  return JSON.parse(content) as GradingResponse;
}
