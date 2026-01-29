import pdfplumber
from fastapi import FastAPI, File, UploadFile, Form
from rag_gemini import (
    add_texts,
    retrieve_context_hyde,
    generate_questions
)
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="AI Question Paper Generator (Gemini + HyDE)")

# Serve static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve HTML templates
templates = Jinja2Templates(directory="templates")


def chunk_text(text, size=800):
    """
    Larger chunks to reduce embedding calls
    """
    words = text.split()
    return [
        " ".join(words[i:i + size])
        for i in range(0, len(words), size)
    ]


@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload syllabus / notes PDF
    """
    text = ""

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    if not text.strip():
        return {
            "status": "failed",
            "reason": "No extractable text found in PDF"
        }

    chunks = chunk_text(text)
    add_texts(chunks)

    return {
        "status": "Document indexed successfully",
        "chunks_added": len(chunks)
    }


@app.post("/generate")
async def generate(
    topic: str = Form(...),
    marks: str = Form(...),
    difficulty: str = Form(...),
    qtype: str = Form(...),
    num: int = Form(5)
):
    """
    Generate questions using Gemini + HyDE
    """
    context = retrieve_context_hyde(topic)

    if not context.strip():
        return {
            "status": "failed",
            "reason": "No relevant content found. Upload documents first."
        }

    questions = generate_questions(
        context=context,
        marks=marks,
        difficulty=difficulty,
        qtype=qtype,
        num=num
    )

    return {
        "topic": topic,
        "questions": questions
    }
