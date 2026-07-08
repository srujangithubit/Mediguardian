def build_prompt(query: str, retrieved_context: list, chat_history: list = None) -> str:
    # Format the context
    context_str = ""
    for idx, item in enumerate(retrieved_context):
        meta = item["metadata"]
        context_str += f"--- Medicine {idx+1} ---\n"
        context_str += f"Medicine Name: {meta.get('Medicine Name', 'Unknown')}\n"
        context_str += f"Composition: {meta.get('Composition', 'Unknown')}\n"
        context_str += f"Uses: {meta.get('Uses', 'Unknown')}\n"
        context_str += f"Side Effects: {meta.get('Side_effects', 'Unknown')}\n"
        context_str += f"Manufacturer: {meta.get('Manufacturer', 'Unknown')}\n\n"

    # Format the chat history
    history_str = ""
    if chat_history and len(chat_history) > 0:
        history_str = "Conversation History:\n"
        for msg in chat_history:
            role = "User" if msg.get("role") == "user" else "AI"
            history_str += f"{role}: {msg.get('content')}\n"
        history_str += "\n"

    prompt = f"""You are an AI Medicine Assistant.
Answer ONLY from the retrieved medicine information.
Never invent medicines.
Never invent dosages.
Never diagnose diseases.
Never recommend prescriptions.
If the answer is not found in the retrieved context, reply EXACTLY: "I couldn't find that information in the medicine database."

Retrieved Context:
{context_str}

{history_str}
Question:
{query}

Answer:"""
    return prompt
