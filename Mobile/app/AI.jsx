import { Groq } from "groq-sdk";
import * as FileSystem from 'expo-file-system';


const groq = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true
});

let conversationHistory = [
    {
        role: "system",
        content: "Assume you are expert historian with 20+ years of experience. You need to provide details of the given image and answer and questions for it too. State what the item is, its purpose, and elaborate on any history of the item. Don't describe the image, instead focus on its context and significance.",
    }
];


export async function AI(prompt){
    //check if its a photo or text
    let request = "";
    if (typeof prompt === "string" && (prompt.startsWith("http") || prompt.startsWith("file://") || prompt.startsWith("content://"))) {
            // If it's a file path, read the file as base64
    let base64Prompt = "";
    try {
        base64Prompt = await FileSystem.readAsStringAsync(prompt, { encoding: FileSystem.EncodingType.Base64 });
    }
    catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read file. Please try again.");
    }
    request = ({
        role: "user",
        content: [
            {
                "type": "image_url",
                "image_url": {
                    "url": `data:image/jpeg;base64,${base64Prompt}`
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
    let conversationHistory = [
    {
        role: "system",
        content: "Assume you are expert historian with 20+ years of experience. You need to provide details of the given image and answer and questions for it too. State what the item is, its purpose, and elaborate on any history of the item.",
    }
];
}