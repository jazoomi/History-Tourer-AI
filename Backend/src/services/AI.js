import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Role: Expert historian (20+ years of experience).
Task: Analyze the given item and answer any further questions from the client. Do not describe visual details.

Output format (must follow exactly):

Name of Item:
[3–5 sentences here]

Purpose / Function:
[3–5 sentences here]

Historical Context & Significance:
[3–5 sentences here]

Rules:
- Always include the three section headers exactly as written.
- Always **bold** the section headers.
- Leave one blank line between each section.
- If uncertain, take a guess but be sure to mention "I am guessing."
`.trim();

let conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

export async function AI(prompt) {
    let request;
    if (typeof prompt === "string" && (prompt.startsWith("data:image/jpeg;base64,") || prompt.startsWith("data:image/png;base64,"))) {
        request = {
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: { url: prompt }
                }
            ]
        };
    } else {
        request = {
            role: "user",
            content: prompt
        };
    }

    conversationHistory.push(request);

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: conversationHistory,
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
        });

        const assistantMessage = chatCompletion.choices[0].message.content;
        conversationHistory.push({
            role: "assistant",
            content: assistantMessage
        });

        return assistantMessage;
    } catch (error) {
        conversationHistory.pop();
        console.error("Error during AI request:", error);
        throw error;
    }
}

export function resetAI() {
    conversationHistory = [
        { role: "system", content: SYSTEM_PROMPT }
    ];
}
