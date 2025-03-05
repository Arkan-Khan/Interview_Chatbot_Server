import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store in .env

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateInterviewQuestions = async (resumeText, jobPosition) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Updated to latest model

    const prompt = `I have a resume and a job position.
    Resume: ${resumeText}
    Job Position: ${jobPosition}

    Generate:
    1. Provide top 5 Interview questions based on the resume and job.
    2. How to answer each question properly.
    3. Resume feedback and improvements.

    Format the response strictly as JSON:
    {
      "questions": ["Question 1", "Question 2", ...],
      "answers": ["Answer 1", "Answer 2", ...],
      "feedback": "Resume improvement suggestions"
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Raw AI Response:", responseText); // Debugging

    // Extract JSON safely
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    const jsonString = responseText.substring(jsonStart, jsonEnd + 1);

    return JSON.parse(jsonString); // Convert response to JSON

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return { questions: [], answers: [], feedback: "Error generating feedback" };
  }
};
