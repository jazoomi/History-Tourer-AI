import { Groq } from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Create a Backend/.env file (see .env.example).");
}

const model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

const groq = new Groq({ apiKey });

const SYSTEM_PROMPT = `
Role: Expert historian (20+ years of experience).
Task: Analyze the given item and answer any further questions from the client. Do not describe visual details.

Output format (must follow exactly):

**Name of Item:**
[3-5 sentences here]

**Purpose / Function:**
[3-5 sentences here]

**Historical Context & Significance:**
[3-5 sentences here]

Rules:
- Always include the three section headers exactly as written.
- Always **bold** the section headers.
- Leave one blank line between each section.
- If uncertain, take a guess but be sure to mention "I am guessing."
`;

const buildInitialHistory = () => [
    { role: "system", content: SYSTEM_PROMPT }
];

let conversationHistory = buildInitialHistory();

const isImagePrompt = (value) =>
    typeof value === "string" &&
    (value.startsWith("data:image/jpeg;base64,") ||
     value.startsWith("data:image/png;base64,") ||
     value.startsWith("data:image/webp;base64,"));

export async function AI(prompt) {
    const request = isImagePrompt(prompt)
        ? {
            role: "user",
            content: [
                { type: "image_url", image_url: { url: prompt } }
            ]
        }
        : { role: "user", content: prompt };

    conversationHistory.push(request);
    try {
    const completion = await groq.chat.completions.create({
        messages: conversationHistory,
        model,
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
    });

        const assistantMessage = completion.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: assistantMessage });
        return assistantMessage;
    } catch (error) {
        console.error('Error during AI request:', error);
        throw new Error('Failed to get AI response. Please try again.');
    }
}

export function resetAI() {
    conversationHistory = buildInitialHistory();
}
