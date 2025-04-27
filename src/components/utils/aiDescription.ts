import OpenAI from "openai";
import { CreateTaskData } from "@/types/task";

const openai = new OpenAI({
  apiKey: atob(import.meta.env.VITE_OPENAI_API_KEY),
  dangerouslyAllowBrowser: true,
});

// Generate a more detailed and concise task description from user input
export const generateTaskDescription = async (
  userInput: string
): Promise<string> => {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is missing");
    }

    if (!userInput || userInput.trim().length < 3) {
      throw new Error(
        "Please provide more details for the AI to generate a description"
      );
    }

    const prompt = `
      Turn the following brief description into a more detailed task description:
      
      "${userInput.trim()}"
      
      Focus on rephrasing the description and giving a better and concise but comprehensive (50 words max) and only return with the description and nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates clear, detailed task descriptions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "The AI could not generate a description. Please try again with more details."
    );
  } catch (error: any) {
    console.error("Error generating task description:", error);

    if (error.message.includes("API key")) {
      return "AI description generation is currently unavailable. Please enter a description manually.";
    }

    return `Unable to generate description: ${
      error.message || "Unknown error"
    }. Please try again or enter a description manually.`;
  }
};

// Generate and update form with AI-generated description
export const handleAIDescriptionGenerate = async (
  userInput: string,
  setFormData: React.Dispatch<React.SetStateAction<CreateTaskData>>
) => {
  try {
    setFormData((prev: CreateTaskData) => ({
      ...prev,
      description: "Generating description...",
    }));

    const generatedDescription = await generateTaskDescription(userInput);

    setFormData((prev: CreateTaskData) => ({
      ...prev,
      description: generatedDescription,
    }));
  } catch (error) {
    console.error("Error in AI description generation:", error);
    setFormData((prev: CreateTaskData) => ({
      ...prev,
      description:
        prev.description === "Generating description..."
          ? "Failed to generate description. Please try again or enter manually."
          : prev.description,
    }));
  }
};

// Generate a short TLDR summary from the full task description
export const generateTLDR = async (description: string): Promise<string> => {
  try {
    if (!description || description.trim().length < 30) {
      return description;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Create a very concise TLDR (1 sentence) that captures the essence of this task description and that could be understood by a 15 year old.",
        },
        { role: "user", content: description },
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    return (
      response.choices[0]?.message?.content?.trim() || "Summary unavailable"
    );
  } catch (error) {
    console.error("Error generating TLDR summary:", error);
    return "Unable to generate summary";
  }
};
