from ollama import Client

client = Client(host='http://127.0.0.1:11434')

def generate_response(prompt: str, model: str = "llama3:8b") -> str:
    try:
        response = client.generate(model=model, prompt=prompt)
        return response.get('response', '')
    except Exception as e:
        print(f"Ollama generation error: {e}")
        return "I'm having trouble connecting to my local inference engine. Make sure Ollama is running."
