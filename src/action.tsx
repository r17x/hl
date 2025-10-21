'use server'

import type { Message } from "./schema"

const systemPrompt =
  `You are a medical documentation assistant. Your task is to analyze conversations between a Doctor and a Patient and generate a structured medical record.

ROLE IDENTIFICATION:
- Messages prefixed with [doctor]: are from the doctor
- Messages prefixed with [patient]: are from the patient

TASK:
Generate a simple medical record based on the conversation above with the following sections:

**Chief Complaint:**
[Brief statement of the main reason for the visit, in the patient's own words]

**Symptoms:**
[List of symptoms reported by the patient, including duration and severity]

**Assessment:**
[Doctor's preliminary assessment or working diagnosis based on the symptoms]

**Plan:**
[Recommended next steps, treatments, tests, or follow-up care]

FORMAT:
Use clear, concise medical language. Keep each section focused and relevant to the conversation provided.`



const toAPIPayload = (messages: Message[]) => messages.map((message) => ({
  role: message.role !== "system" ? "user" : "system",
  content: message.role !== "system" ? `[${message.role}]: ${message.content}` : message.content
}))

const generateFromMessage = (messages: Message[]) => {
  return fetch('http://localhost:11434/v1/chat/completions', {
    method: "POST",
    headers: {
      Authorization: "Bearer sk-nHNIIIOpRoFwCTPbJxaS904PG5OkZRBbdkItfCwtfeczWUyA"
    },
    body: JSON.stringify({
      model: "deepseek-r1:1.5b",
      messages: toAPIPayload([
        {

          role: "system",
          content: systemPrompt
        },
        ...messages
      ])
    })
  }).then(res => res.json()).then(json =>
    json.choices && Array.isArray(json.choices) && json.choices.length > 0 &&
      json.choices[0].message && json.choices[0].message.content ? Promise.resolve(json.choices[0].message.content as string) : Promise.reject("No result")
  ).catch(String)
}

export async function generateRecord(messages: Message[]) {
  const errors = null
  const result = await generateFromMessage(messages)
  return {
    messages, errors, generatedMessage: result.replace(
      /<think\b[^>]*>\s*([\s\S]*?)\s*<\/think>/g,
      (_, inner) => `> ${inner.trim()}`
    )
  }
}
