import { Groq } from "groq-sdk";


const groq = new Groq({
    apiKey: "", // API key here
    dangerouslyAllowBrowser: true
});

let conversationHistory = [
    {
        role: "system",
        content: 
`
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
`
 }
];


export async function AI(prompt){
    //check if its a photo or text
    let request = "";
    if (typeof prompt === "string" && (prompt.startsWith("data:image/jpeg;base64,") || prompt.startsWith("data:image/png;base64,"))) {
    request = ({
        role: "user",
        content: [
            {
                "type": "image_url",
                "image_url": {
                    "url": `${prompt}`
                }
            }
        ]
    });

} else {
    request = ({
        role: "user",
        content: prompt
    });
}

    //update conversation
    conversationHistory.push(request);
    // ask groq for a response
    console.log("Sending to AI:", conversationHistory);
    let chatCompletion = null;
    try {
    chatCompletion = await groq.chat.completions.create({
        "messages": conversationHistory,
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "temperature": 1,
        "max_completion_tokens": 1024,
        "top_p": 1,
        "stream": false,
        "stop": null
    });
} catch (error) {
    console.error("Error during AI request:", error);
    alert("Failed to get AI response. Please try again.");
    return;
}
    //groq's reply
    const assistantMessage = chatCompletion.choices[0].message.content;
    conversationHistory.push(
        {
            role: "assistant",
            content: assistantMessage
        }
    );
    console.log("Total", conversationHistory);
    return assistantMessage;

}
export function resetAI() {
    conversationHistory = [
    {
        role: "system",
        content: "Assume you are expert historian with 20+ years of experience. You need to provide details of the given image and answer and questions for it too. State what the item is, its purpose, and elaborate on any history of the item.",
    }
];

}