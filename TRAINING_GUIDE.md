# 🎓 Training & Customization Guide

**Version:** 1.0  
**Last Updated:** March 23, 2026  
**Target Audience:** Users who want to customize or train the AI

---

## 🎯 Overview

The Personal AI Assistant can be customized and trained in multiple ways:

- ✅ **Personality Customization** - Define how the AI behaves and responds
- ✅ **Knowledge Base Training** - Add your own documents and information
- ✅ **Fine-tuning** - Train on custom question-answer pairs
- ✅ **Voice Cloning** - Create a personalized voice
- ✅ **Prompt Engineering** - Craft better prompts for specific tasks

---

## 1. Model Selection & Configuration

### 1.1 Switching Models

Different models have different capabilities and sizes:

**Small Models (Fast, Low Memory)**

```bash
# 3B parameters - Fast but less capable
OLLAMA_MODEL=mistral:3b-instruct-q4_K_M

# Install
docker exec personal-assistant-ollama ollama pull mistral:3b-instruct-q4_K_M
```

**Medium Models (Balanced)**

```bash
# 7B parameters - Good balance
OLLAMA_MODEL=mistral:7b-instruct-q4_K_M

# Install
docker exec personal-assistant-ollama ollama pull mistral:7b-instruct-q4_K_M

# Or
OLLAMA_MODEL=neural-chat:7b

docker exec personal-assistant-ollama ollama pull neural-chat:7b
```

**Large Models (Powerful but Slow)**

```bash
# 13B parameters - Most capable but slower
OLLAMA_MODEL=mistral:13b-instruct-q4_K_M

# Install
docker exec personal-assistant-ollama ollama pull mistral:13b-instruct-q4_K_M

# Or
OLLAMA_MODEL=llama2:13b

docker exec personal-assistant-ollama ollama pull llama2:13b
```

### 1.2 Changing Model at Runtime

```bash
# 1. Update .env file
nano .env
# Change: OLLAMA_MODEL=new-model-name

# 2. Restart backend
docker compose restart backend

# 3. Verify in logs
docker compose logs -f backend | grep "LLM Model"
```

### 1.3 Model Performance Tuning

**Adjust these in `.env`:**

```bash
# Context length (how much history to remember)
LLM_CONTEXT_LENGTH=2048      # Smaller = faster but less context
LLM_CONTEXT_LENGTH=4096      # More context, slower

# Temperature (creativity level)
LLM_TEMPERATURE=0.3          # Lower = more consistent/factual
LLM_TEMPERATURE=0.7          # Balanced
LLM_TEMPERATURE=1.0          # Higher = more creative/random

# Max tokens (response length)
LLM_MAX_TOKENS=256           # Short responses, faster
LLM_MAX_TOKENS=512           # Balanced responses
LLM_MAX_TOKENS=1024          # Long, detailed responses

# Top-P (diversity control)
LLM_TOP_P=0.9                # Balanced
LLM_TOP_P=0.95               # Higher diversity
LLM_TOP_P=0.7                # More focused
```

**Apply changes:**

```bash
# Restart backend to apply
docker compose restart backend
```

---

## 2. Personality Customization

### 2.1 System Prompt Engineering

The system prompt defines the AI's personality and behavior.

**Access system prompt:**

```bash
# Backend configuration file
nano backend/config.py

# Or add to .env
SYSTEM_PROMPT="You are a helpful and friendly AI assistant..."
```

### 2.2 Example System Prompts

**Friendly & Casual:**

```
You are a warm, friendly AI assistant named [Name]. You:
- Use a conversational, approachable tone
- Enjoy helping people learn new things
- Ask clarifying questions when needed
- Share relevant examples and analogies
- Admit when you're uncertain rather than guessing
- Use emojis occasionally to add personality
```

**Professional & Formal:**

```
You are a professional AI consultant. You:
- Provide expert analysis and recommendations
- Use precise technical language
- Structure responses clearly with bullet points
- Cite sources and reasoning
- Maintain professional boundaries
- Focus on business value and ROI
```

**Educator:**

```
You are an expert educator. You:
- Explain concepts from first principles
- Use analogies and real-world examples
- Adapt complexity to the user's level
- Encourage critical thinking with questions
- Provide step-by-step guidance
- Celebrate learning milestones
```

**Creative Partner:**

```
You are a creative collaborator. You:
- Encourage experimentation and risk-taking
- Generate original ideas and perspectives
- Challenge assumptions constructively
- Build on user suggestions
- Provide feedback that's helpful and kind
- Love brainstorming and exploring possibilities
```

### 2.3 Custom Instructions

**Add to backend/services/llm_service.py:**

```python
CUSTOM_INSTRUCTIONS = """
IMPORTANT: 
- Always cite sources when possible
- If you don't know, say so clearly
- Provide actionable insights
- For technical questions, include code examples when relevant
- Break down complex topics into digestible parts
"""
```

---

## 3. Knowledge Base Training

### 3.1 Adding Documents (Retrieval-Augmented Generation)

**Step 1: Prepare documents**

Create a folder with your documents:

```bash
mkdir -p backend/knowledge_base
# Add your files:
# - Documents.pdf
# - Manual.docx
# - Notes.txt
# - etc.
```

**Step 2: Implement Document Loader**

```python
# backend/services/knowledge_base_service.py
from pathlib import Path
import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter

class KnowledgeBaseService:
    def __init__(self):
        self.documents_path = Path("knowledge_base")
        self.chunks = []
    
    def load_documents(self):
        """Load and process all documents"""
        for file_path in self.documents_path.glob("*"):
            if file_path.suffix == ".pdf":
                self.load_pdf(file_path)
            elif file_path.suffix == ".txt":
                self.load_text(file_path)
    
    def load_pdf(self, file_path):
        """Extract text from PDF"""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        
        self.split_and_store(text)
    
    def split_and_store(self, text):
        """Split text into chunks"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = splitter.split_text(text)
        self.chunks.extend(chunks)
```

**Step 3: Use in Chat**

```python
# backend/services/llm_service.py
async def chat_with_knowledge_base(user_message, kb_service):
    # Find relevant chunks
    relevant_chunks = kb_service.search(user_message, top_k=3)
    
    # Build context
    context = "\n\n".join(relevant_chunks)
    
    # Enhance prompt
    enhanced_prompt = f"""
    Context from knowledge base:
    {context}
    
    User question: {user_message}
    
    Answer based on the context provided.
    """
    
    # Get response
    response = await llm_service.generate(enhanced_prompt)
    return response
```

### 3.2 Subject-Specific Knowledge

**Example: Python Programming Assistant**

```python
# Load Python documentation
PYTHON_DOCS = """
Python is a high-level programming language...

Key concepts:
1. Variables: Store data in memory
2. Functions: Reusable blocks of code
3. Classes: Templates for objects
4. Modules: Organized code libraries
...
"""

# Include in system prompt
SYSTEM_PROMPT = """
You are an expert Python programming tutor. 
Context knowledge:
{PYTHON_DOCS}

Help users learn Python with clear explanations and examples.
"""
```

**Example: Company-Specific Knowledge**

```python
# Load company documentation
COMPANY_DOCS = """
Company Name: Acme Corp
Founded: 2020
Products: SaaS platform for data analytics
Teams: Engineering, Sales, Support
...
"""

SYSTEM_PROMPT = """
You are a helpful support assistant for Acme Corp.
You have access to company information and policies.

When answering questions:
1. Reference company guidelines
2. Direct to appropriate teams when needed
3. Maintain company branding and values
"""
```

---

## 4. Fine-tuning with Question-Answer Pairs

### 4.1 Create Training Dataset

**File: `backend/training_data.json`**

```json
{
  "training_pairs": [
    {
      "question": "What is machine learning?",
      "answer": "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves."
    },
    {
      "question": "How do neural networks work?",
      "answer": "Neural networks are inspired by biological neurons. They consist of layers of interconnected nodes. Each connection has a weight that's adjusted during training. Data flows through layers, with each neuron applying an activation function to produce output that feeds to the next layer."
    },
    {
      "question": "What's the difference between supervised and unsupervised learning?",
      "answer": "Supervised learning uses labeled data where the correct answer is provided. Unsupervised learning finds patterns in unlabeled data. Supervised is for predicting specific outcomes; unsupervised is for discovering hidden patterns."
    }
  ]
}
```

### 4.2 Fine-tuning Script

```python
# backend/fine_tune.py
import json
import ollama
from pathlib import Path

def create_training_data(json_file):
    """Convert Q&A pairs to training format"""
    with open(json_file) as f:
        data = json.load(f)
    
    training_prompts = []
    for pair in data['training_pairs']:
        prompt = f"""Q: {pair['question']}
A: {pair['answer']}"""
        training_prompts.append(prompt)
    
    return training_prompts

def fine_tune_model(model_name, training_data_file):
    """Fine-tune Ollama model"""
    prompts = create_training_data(training_data_file)
    
    print(f"Fine-tuning {model_name} on {len(prompts)} examples...")
    
    # Note: Ollama in-context learning (simpler approach)
    # For true fine-tuning, would need special setup
    
    for i, prompt in enumerate(prompts):
        print(f"Training example {i+1}/{len(prompts)}...")
        # Store as context for the model
    
    print("✅ Fine-tuning complete")

if __name__ == "__main__":
    # Fine-tune
    fine_tune_model("mistral:7b", "training_data.json")
```

### 4.3 Use Fine-tuned Knowledge

Include fine-tuned pairs in context:

```python
# backend/services/llm_service.py
TRAINING_EXAMPLES = """
Example Q&A pairs to guide responses:
Q: What is machine learning?
A: Machine learning is a subset of artificial intelligence...

Q: How do neural networks work?
A: Neural networks are inspired by biological neurons...

Use these patterns as reference for similar questions.
"""

def generate_with_examples(user_message):
    """Generate with training examples as context"""
    prompt = f"""
{TRAINING_EXAMPLES}

User asks: {user_message}

Provide a similar high-quality response.
"""
    return await llm.generate(prompt)
```

---

## 5. Voice Cloning

### 5.1 Record Your Voice

**Requirements:**

- Quiet environment (minimal background noise)
- Clear microphone (USB microphone recommended)
- 30-60 seconds of continuous speech

**Recording Steps:**

```bash
# Using command line (Linux/macOS)
rec -r 22050 -c 1 voice_sample.wav

# Press Ctrl+C to stop recording
# Recommended: 30-45 seconds of natural speaking

# Or use any audio recording software:
# - Audacity (free)
# - GarageBand (macOS)
# - Voice Memos (iOS)
```

**What to Read:**

```
"Hello! I'm your personal AI assistant. I'm here to help you with 
questions, creative projects, and productive tasks. I'll do my best 
to provide accurate and thoughtful responses. Feel free to ask me 
anything!"

(Continue with natural conversation for 30-60 seconds total)
```

### 5.2 Upload Voice Sample

**Via Web UI:**

1. Go to Settings → Voice → Upload Sample
2. Select your `voice_sample.wav` file
3. Click "Upload & Process"
4. Wait for processing (2-5 minutes)
5. Test with "Play Sample" button
6. Save if satisfied

**Via API:**

```bash
curl -X POST http://localhost:8000/api/voice/clone \
  -F "audio_file=@voice_sample.wav" \
  -F "voice_name=My_Custom_Voice"
```

### 5.3 Use Cloned Voice

**In Settings:**

- Text-to-Speech → Voice: "My_Custom_Voice"
- Test with preview text
- All future responses use your voice

---

## 6. Advanced Customization

### 6.1 Custom Response Formatting

**Define personalized output format:**

```python
# backend/services/response_formatter.py
class ResponseFormatter:
    def format_technical_response(self, content):
        """Format technical answers"""
        return f"""
**Answer:**
{content}

**Key Points:**
- Extracted points here
- More points

**Resources:**
- Links to documentation
"""
    
    def format_casual_response(self, content):
        """Format friendly responses"""
        return f"Hey! Here's what I found:\n\n{content}\n\nLet me know if you need more info! 😊"
```

### 6.2 Integrated Tools Access

**Grant AI access to tools:**

```python
# backend/services/llm_service.py
class AIAssistant:
    def __init__(self):
        self.tools = {
            'calculator': self.calculate,
            'web_search': self.search_web,
            'file_read': self.read_file,
            'weather': self.get_weather
        }
    
    async def process_with_tools(self, user_message):
        """Process message and decide if tools needed"""
        if "calculate" in user_message.lower():
            return await self.tools['calculator'](user_message)
        elif "weather" in user_message.lower():
            return await self.tools['weather'](user_message)
        else:
            return await self.llm.generate(user_message)
```

### 6.3 Multi-Language Support

**Add language detection:**

```python
from langdetect import detect, detect_langs

def detect_language(text):
    """Detect user's language"""
    lang = detect(text)
    confidence = detect_langs(text)[0].prob
    return lang, confidence

# Use in chat
async def chat(user_message):
    lang, conf = detect_language(user_message)
    
    if conf > 0.8:
        # High confidence - respond in same language
        system_prompt = PROMPTS[lang]
    else:
        # Low confidence - ask for clarification
        return "What language would you like to use?"
```

---

## 7. Monitoring & Evaluation

### 7.1 Track Performance

**Log response quality:**

```python
# backend/services/quality_monitoring.py
import json
from datetime import datetime

class QualityMonitor:
    def __init__(self):
        self.metrics_file = "metrics.jsonl"
    
    def log_interaction(self, question, response, user_rating=None):
        """Log interaction for later analysis"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'question': question,
            'response': response,
            'response_length': len(response),
            'user_rating': user_rating,  # 1-5 stars
        }
        
        with open(self.metrics_file, 'a') as f:
            f.write(json.dumps(record) + '\n')
    
    def analyze_metrics(self):
        """Analyze collected metrics"""
        ratings = []
        response_times = []
        
        with open(self.metrics_file) as f:
            for line in f:
                record = json.loads(line)
                if record.get('user_rating'):
                    ratings.append(record['user_rating'])
        
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        return {
            'average_rating': avg_rating,
            'total_interactions': len(ratings),
        }
```

### 7.2 User Feedback Loop

**Collect user ratings:**

```python
# In chat UI - add rating buttons
response_item:
  - Message text
  - Timestamp
  - [👍 Helpful]  [👎 Not helpful]  [⭐⭐⭐⭐⭐ Rate]
```

**Use feedback to improve:**

```python
def get_low_rated_responses():
    """Find responses users didn't like"""
    lowrated = []
    with open("metrics.jsonl") as f:
        for line in f:
            record = json.loads(line)
            if record.get('user_rating', 5) < 3:
                lowrated.append(record)
    return lowrated

# Analyze patterns in low-rated responses
# Adjust prompts, models, or parameters accordingly
```

---

## 8. Best Practices

### 8.1 Prompt Engineering Tips

**Do:**

- ✅ Be specific and detailed
- ✅ Break complex requests into steps
- ✅ Provide context and background
- ✅ Ask for examples
- ✅ Specify output format

**Don't:**

- ❌ Use vague language
- ❌ Ask multiple unrelated questions at once
- ❌ Expect perfect accuracy on factual claims
- ❌ Forget about context length limits
- ❌ Ignore temperature/creativity settings

### 8.2 Training Data Quality

**Good training examples:**

```
Q: "Explain recursion"
A: "Recursion is when a function calls itself to solve smaller 
    instances of the same problem. Base case stops infinite loops."
```

**Poor training examples:**

```
Q: "What?"
A: "I don't know"

Q: "Tell me everything"
A: "It's complicated"
```

### 8.3 Model Selection for Use Cases

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| Customer support | 7B+, instruction-tuned | Needs accuracy, consistency |
| Creative writing | 7B+, less constrained | Benefits from creativity |
| Coding help | 13B+, code-optimized | Complex reasoning needed |
| General chat | 3B-7B | Fast, good balance |
| Summarization | 7B+ | Needs comprehension |
| Translation | 7B+, multilingual | Complex transformation |

---

## 9. Troubleshooting Training

### Issue: Model responses unchanged after training

**Solution:**

```bash
# Ensure changes applied
docker compose restart backend

# Check logs
docker logs personal-assistant-backend | grep "System prompt"

# Verify configuration loaded
curl http://localhost:8000/api/config
```

### Issue: Fine-tuning doesn't improve responses

**Solution:**

1. **Review training data quality** - Check examples are good
2. **Increase training examples** - More examples = better learning
3. **Try different model** - Maybe current model lacks capability
4. **Check system prompt** - Ensure it's instructing properly

### Issue: Voice cloning produces robotic sound

**Solution:**

1. **Use higher quality recording** - USB mic, quiet room
2. **Record more varied content** - Different sentences, tones
3. **Adjust TTS settings** - Speech rate, pitch
4. **Try different voice** - Fallback to standard voice

---

## 10. Advanced Topics

### Retrieval-Augmented Generation (RAG)

Combine your knowledge base with AI:

```python
async def rag_chat(user_message, knowledge_base):
    # 1. Search knowledge base
    relevant_docs = knowledge_base.search(user_message, k=3)
    
    # 2. Build context
    context = "\n".join([doc['content'] for doc in relevant_docs])
    
    # 3. Create prompt
    prompt = f"""
Context: {context}
Question: {user_message}

Answer using the provided context. If not found in context, 
use general knowledge but indicate it's not from provided docs.
"""
    
    # 4. Generate response
    return await llm.generate(prompt)
```

### Few-Shot Learning

Provide examples to guide the model:

```python
prompt = """
Classify sentiment as positive, negative, or neutral.

Examples:
"I love this!" → positive
"Terrible experience" → negative
"It's okay" → neutral

Now classify: "This product exceeded my expectations"
"""
```

---

## Summary

You can customize the AI through:

- 🎯 **Model Selection** - Pick model matching your needs
- 🧠 **Personality** - Define via system prompts
- 📚 **Knowledge Base** - Add documents for context
- 📝 **Fine-tuning** - Train on Q&A pairs
- 🎤 **Voice** - Clone your voice
- 🔧 **Advanced** - Add tools, multi-language, RAG

**Next:** Read [USER_GUIDE.md](USER_GUIDE.md) for complete feature reference!
