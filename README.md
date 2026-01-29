
# 🧠 AI-Powered Question Generator (HyDE + RAG)

An AI-based system that generates **exam-ready questions** from uploaded syllabus material using **HyDE-enhanced Retrieval-Augmented Generation (RAG)**.

This project focuses on generating **high-quality, syllabus-aligned questions**, which form the **core content of a question paper**.

---

## 📌 Problem Statement

Preparing exam questions manually is:
- Time-consuming
- Prone to syllabus mismatch
- Difficult to balance difficulty levels

Traditional AI models may hallucinate or generate irrelevant content.

---

## 💡 Solution Overview

This project uses **HyDE (Hypothetical Document Embeddings)** combined with **RAG** to ensure that:
- All questions are generated **strictly from uploaded study material**
- Hallucinations are minimized
- Semantic retrieval accuracy is improved

---

## 🧠 Key Concepts Used

### 🔹 Retrieval-Augmented Generation (RAG)
- Study material is split into chunks
- Each chunk is converted into embeddings
- Stored in a vector database (Pinecone)
- Relevant content is retrieved before generation

### 🔹 HyDE (Hypothetical Document Embeddings)
- A hypothetical academic explanation is generated for the user query
- This explanation is embedded instead of the raw query
- Improves semantic similarity search and retrieval quality

---

## ⚙️ Tech Stack

### Backend
- **FastAPI**
- **Python**
- **OpenAI API** (embeddings + generation)
- **Pinecone** (vector database)
- **pdfplumber** (PDF text extraction)

### Frontend
- HTML, CSS, JavaScript
- Fetch API for backend communication

---

## 🗂️ Project Structure

**project-root**/ <br>
│-- app.py <br>
│-- rag_hyde.py <br>
│-- requirements.txt <br>
│-- .gitignore <br>
│── **template**/ <br>
│&nbsp;&nbsp;&nbsp;&nbsp;|-- index.html <br>
│── **Static**/ <br>
│&nbsp;&nbsp;&nbsp;&nbsp;|-- style.css <br>
│&nbsp;&nbsp;&nbsp;&nbsp;|-- scripts.js


---

## 🚀 Features

- Upload syllabus or study material (PDF)
- Generate:
  - MCQs
  - Short-answer questions
  - Long-answer questions
- User-defined:
  - Topic
  - Marks
  - Difficulty (free-text)
  - Question description/style
- HyDE-enhanced semantic retrieval
- REST API-based architecture

---

## 🧪 How It Works (Flow)

1. User uploads study material (PDF)
2. Text is chunked and embedded
3. Embeddings are stored in Pinecone
4. User enters topic and instructions
5. HyDE generates a hypothetical academic document
6. Relevant syllabus content is retrieved
7. AI generates questions using retrieved context only

---

## ▶️ Running the Project

### Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

## 🔮 Future Enhancements

- Full question paper formatting (sections, marks)

- PDF export

- Bloom’s taxonomy classification

- Answer key generation

- Duplicate question detection

- Analytics on syllabus coverage
