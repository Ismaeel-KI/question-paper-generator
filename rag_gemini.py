import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from google import genai


# ---------------- GEMINI SETUP ---------------- #

client = genai.Client(api_key="use your own key")

# ---------------- EMBEDDING MODEL ---------------- #

embedder = SentenceTransformer("all-MiniLM-L6-v2")
DIM = 384  # embedding dimension

# ---------------- VECTOR STORE ---------------- #

index = faiss.IndexFlatL2(DIM)
stored_texts = []


# ---------------- ADD DOCUMENT CHUNKS ---------------- #

def add_texts(chunks):
    """
    Store document chunks in FAISS
    """
    global stored_texts

    embeddings = embedder.encode(chunks)
    index.add(np.array(embeddings, dtype="float32"))
    stored_texts.extend(chunks)


# ---------------- HyDE (Gemini) ---------------- #

def generate_hypothetical_doc(query: str):
    prompt = f"""
Write a detailed academic explanation as if answering
an exam question on the topic below.

Topic:
{query}

Use formal, syllabus-oriented language.
"""
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text



# ---------------- RETRIEVAL ---------------- #

def retrieve_context_hyde(query, top_k=3):
    """
    HyDE-based retrieval
    """
    if index.ntotal == 0:
        return ""

    hypothetical_doc = generate_hypothetical_doc(query)
    hyde_embedding = embedder.encode([hypothetical_doc])

    distances, indices = index.search(
        np.array(hyde_embedding, dtype="float32"),
        top_k
    )

    contexts = [stored_texts[i] for i in indices[0]]
    return "\n".join(contexts)


# ---------------- QUESTION GENERATION ---------------- #

def generate_questions(context, marks, difficulty, qtype, num):
    prompt = f"""
You are an AI question paper generator.

Generate {num} {qtype} questions.
Marks: {marks}
Difficulty: {difficulty}

IMPORTANT RULES:
- Use ONLY the context below
- Do NOT add outside knowledge
- Questions must be exam-appropriate

Context:
{context}
"""
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text

