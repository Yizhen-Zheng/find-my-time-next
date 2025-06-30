"use server";
import { Task } from "@/utils/types";
/**
 * Processes a natural language string to extract structured task data using the Gemini API.
 * @param existingTasks - An array of tasks that already exist, for context.
 * @param text - The natural language input from the user.
 * @returns A promise that resolves to an object with the extracted tasks or an error message.
 */
export async function extractTasksFromText(
  existingTasks: Task[],
  text: string
): Promise<{ tasks?: Task[]; error?: string }> {
  // Ensure the API key is available. It's read from .env.local on the server.
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(apiKey); //undefined
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable.");
    return { error: "Server configuration error: Missing API key." };
  }

  if (!text) {
    return { error: "Input text cannot be empty." };
  }

  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  const formattedToday = today.toISOString().split("T")[0];
  const formattedOneWeekFromNow = oneWeekFromNow.toISOString().split("T")[0];

  // The core of the request: a detailed prompt telling the AI exactly what to do.
  const prompt = `
      Analyze the user's request below to extract one or more tasks.
      Today's date is ${formattedToday}.
  
      **Instructions:**
      1.  Identify individual tasks from the text.
      2.  For each task, provide a clear, concise title.
      3.  Estimate the duration of the task in minutes.
      4.  Categorize the task into one of the following types: 'Meeting', 'Work', 'Personal', 'Learning', 'Health', 'Other'.
      5.  Determine the task's importance: 'High', 'Medium', or 'Low'.
      6.  Assign a 'dueDate'. This date MUST be between today (${formattedToday}) and one week from now (${formattedOneWeekFromNow}). Choose a logical date based on the text (e.g., "tomorrow", "end of the week").
      7.  Consider the list of "Existing Tasks" for context. Avoid creating duplicate tasks if they seem to be already listed.
      8.  Return ONLY a JSON object with a single key "tasks" which is an array of the extracted task objects. Do not add any other text or explanations.
  
      **Existing Tasks (for context):**
      ${JSON.stringify(existingTasks, null, 2)}
  
      **User Request:**
      "${text}"
    `;

  // Define the strict JSON schema we expect Gemini to return.
  const responseSchema = {
    type: "OBJECT",
    properties: {
      tasks: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            type: {
              type: "STRING",
              enum: [
                "Meeting",
                "Work",
                "Personal",
                "Learning",
                "Health",
                "Other",
              ],
            },
            duration: { type: "NUMBER" },
            importance: { type: "STRING", enum: ["High", "Medium", "Low"] },
            dueDate: { type: "STRING" },
          },
          required: ["title", "type", "duration", "importance", "dueDate"],
        },
      },
    },
    required: ["tasks"],
  };

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error Response:", errorBody);
      return { error: `API request failed with status ${response.status}` };
    }

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content?.parts?.[0]?.text
    ) {
      const jsonText = result.candidates[0].content.parts[0].text;
      const parsedJson = JSON.parse(jsonText);

      // Add a unique ID to each task returned by the AI
      const newTasksWithIds = parsedJson.tasks.map(
        (task: Omit<Task, "id">) => ({
          ...task,
          id: crypto.randomUUID(),
        })
      );

      return { tasks: newTasksWithIds };
    } else {
      console.error("Unexpected API response structure:", result);
      // Check for safety ratings or other reasons for no content
      if (result.promptFeedback?.blockReason) {
        return {
          error: `Request blocked due to: ${result.promptFeedback.blockReason}`,
        };
      }
      return {
        error:
          "Failed to extract tasks. The AI returned an empty or invalid response.",
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
      return { error: "Failed to parse the AI's response. Invalid JSON." };
    }
    return {
      error: "An unexpected error occurred while contacting the AI service.",
    };
  }
}
