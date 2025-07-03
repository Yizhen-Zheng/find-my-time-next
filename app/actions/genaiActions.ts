"use server";

import { Task, TaskFromSupabase } from "@/utils/types";
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
            taskType: {
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
          required: ["title", "taskType", "duration", "importance", "dueDate"],
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
      const newTasksFromAI = JSON.parse(jsonText)?.tasks;

      if (newTasksFromAI.length === 0) {
        return { tasks: [] }; // No new tasks found
      }
      //   return generated tasks to db
      return { tasks: newTasksFromAI as TaskFromSupabase[] };
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

export async function extractTasksFromImage(
  existingTasks: Task[],
  imageFile: File
): Promise<{ tasks?: Task[]; error?: string }> {
  // Ensure the API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable.");
    return { error: "Server configuration error: Missing API key." };
  }

  if (!imageFile) {
    return { error: "No image file provided." };
  }

  // Validate file type
  if (!imageFile.type.startsWith("image/")) {
    return { error: "Invalid file type. Please upload an image." };
  }

  // Validate file size (max 10MB)
  if (imageFile.size > 10 * 1024 * 1024) {
    return { error: "Image file size must be less than 10MB." };
  }

  try {
    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Get the mime type
    const mimeType = imageFile.type;

    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedOneWeekFromNow = oneWeekFromNow.toISOString().split("T")[0];

    // The core of the request: a detailed prompt for analyzing the image
    const prompt = `
        Analyze the uploaded image to extract tasks, to-do items, or actionable items.
        Today's date is ${formattedToday}.
    
        **Instructions:**
        1. Carefully examine the image for any text, notes, handwritten items, digital text, or visual elements that represent tasks or to-do items.
        2. For each task identified, provide a clear, concise title.
        3. Estimate the duration of the task in minutes based on the type of task.
        4. Categorize the task into one of the following types: 'Meeting', 'Work', 'Personal', 'Learning', 'Health', 'Other'.
        5. Determine the task's importance: 'High', 'Medium', or 'Low'.
        6. Assign a 'dueDate'. This date MUST be between today (${formattedToday}) and one week from now (${formattedOneWeekFromNow}). If no specific date is mentioned, use a logical default based on the task type.
        7. Consider the list of "Existing Tasks" for context. Avoid creating duplicate tasks if they seem to be already listed.
        8. If the image contains no discernible tasks or to-do items, return an empty tasks array.
        9. Return ONLY a JSON object with a single key "tasks" which is an array of the extracted task objects. Do not add any other text or explanations.
    
        **Existing Tasks (for context):**
        ${JSON.stringify(existingTasks, null, 2)}
    
        **Image Analysis:**
        Please analyze the uploaded image for tasks, to-do items, notes, reminders, or any actionable content.
      `;

    // Define the strict JSON schema we expect Gemini to return
    const responseSchema = {
      type: "OBJECT",
      properties: {
        tasks: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              taskType: {
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
            required: [
              "title",
              "taskType",
              "duration",
              "importance",
              "dueDate",
            ],
          },
        },
      },
      required: ["tasks"],
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
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
      const newTasksFromAI = JSON.parse(jsonText)?.tasks;

      if (!newTasksFromAI || newTasksFromAI.length === 0) {
        return { tasks: [] }; // No new tasks found
      }

      // Return generated tasks to be saved to db
      return { tasks: newTasksFromAI as TaskFromSupabase[] };
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
          "Failed to extract tasks from image. The AI returned an empty or invalid response.",
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for image analysis:", error);
    if (error instanceof SyntaxError) {
      return { error: "Failed to parse the AI's response. Invalid JSON." };
    }
    return {
      error: "An unexpected error occurred while processing the image.",
    };
  }
}
