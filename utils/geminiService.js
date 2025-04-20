import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store in .env

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ 1. Generate Interview Questions, Answers, and Feedback (as JSON)
export const generateInterviewQuestions = async (resumeText, jobPosition) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `I have a resume and a job position.
Resume: ${resumeText}
Job Position: ${jobPosition}

Generate:
1. Provide top 5 Interview questions based on the resume and job.
2. How to answer each question properly.
3. Resume feedback and improvements.

Strictly format the response as valid JSON. 
Do not use any markdown syntax (no asterisks '', no double asterisks '*', no underscores '_', etc.).
Avoid emojis and unnecessary characters.

Expected format:
{
  "questions": ["Question 1", "Question 2", ...],
  "answers": ["Answer 1", "Answer 2", ...],
  "feedback": "Resume improvement suggestions (in plain text, no markdown)"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Raw AI Response:", responseText);

    // Safely extract the JSON part from the output
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");
    const jsonString = responseText.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);

    // Extra cleanup (fallback in case markdown sneaks in)
    parsed.feedback = parsed.feedback
      .replace(/\\/g, "")              // remove bold
      .replace(/^\s*\*\s+/gm, "- ")      // convert bullet asterisks to hyphen
      .replace(/\*/g, "")                // remove remaining asterisks

    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return { questions: [], answers: [], feedback: "Error generating feedback" };
  }
};

// ✅ 2. Continue Chat with Gemini based on user's query
export const continueChatWithGemini = async (
  query,
  resumeText,
  jobPosition,
  previousResponse
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format previous Q&A for context
    let previousQAContext = "";
    if (
      previousResponse &&
      Array.isArray(previousResponse.questions) &&
      Array.isArray(previousResponse.answers) &&
      previousResponse.questions.length > 0 &&
      previousResponse.questions.length === previousResponse.answers.length
    ) {
      previousQAContext = previousResponse.questions.map((q, i) =>
        `Question: ${q}\nAnswer: ${previousResponse.answers[i]}`
      ).join("\n\n");
    }

    const feedbackContext = previousResponse && previousResponse.feedback
      ? `Previous Resume Feedback: ${previousResponse.feedback}`
      : "";

    const prompt = `
Context:
- Resume Text: ${resumeText}
- Job Position: ${jobPosition}
- Previous Interview Questions and Answers: 
${previousQAContext}

${feedbackContext}

The job seeker has the following question: "${query}"

Please provide a helpful, detailed response that considers all the context above.
Do NOT use any markdown formatting or asterisks ('', '*', etc.).
Do not include emojis. Just plain, clear text in paragraphs.
If the user asks for more practice questions, include them along with well-crafted answers.`;

    console.log("Sending prompt to Gemini API...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Response received from Gemini API");

    return responseText;

  } catch (error) {
    console.error("Gemini Chat API Error:", error.message);
    return "I apologize, but I encountered an error processing your request. Please try again.";
  }
};