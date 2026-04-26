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

const isImagePrompt = (value) =>
    typeof value === "string" &&
    (value.startsWith("data:image/jpeg;base64,") ||
        value.startsWith("data:image/png;base64,") ||
        value.startsWith("data:image/webp;base64,"));

const buildUserMessage = (prompt) =>
    isImagePrompt(prompt)
        ? { role: "user", content: [{ type: "image_url", image_url: { url: prompt } }] }
        : { role: "user", content: prompt };

const buildSystemMessage = () => ({ role: "system", content: SYSTEM_PROMPT });

// Strip base64 image blobs out of stored history so the client never re-uploads
// them on follow-up questions. The textual analysis in the assistant reply is
// enough context for the model.
const sanitizeHistory = (history) =>
    history.map((msg) => {
        if (msg.role === "user" && Array.isArray(msg.content)) {
            return { role: "user", content: "[Image of historical item attached]" };
        }
        return msg;
    });

export async function AI(prompt, history = []) {
    const hasSystem = history.some((m) => m.role === "system");
    const baseHistory = hasSystem ? history : [buildSystemMessage(), ...history];
    const messages = [...baseHistory, buildUserMessage(prompt)];

    try {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null,
        });

        const assistantContent = completion.choices[0].message.content;
        const assistantMessage = { role: "assistant", content: assistantContent };
        const updatedHistory = sanitizeHistory([...messages, assistantMessage]);

        return { answer: assistantContent, history: updatedHistory };
    } catch (error) {
        console.error("Error during AI request:", error);
        throw new Error("Failed to get AI response. Please try again.");
    }
}
