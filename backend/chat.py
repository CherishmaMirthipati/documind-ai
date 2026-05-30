from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import User, PDF, ChatHistory
from auth import get_current_user
from pdf_processor import save_pdf, extract_text_from_pdf, chunk_text
from rag_pipeline import store_chunks_in_chromadb, process_query, delete_pdf_collection
from pydantic import BaseModel
import os

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    pdf_id: int

# Upload PDF
@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    filepath = save_pdf(content, f"{current_user.id}_{file.filename}")

    # Save to DB
    pdf = PDF(filename=file.filename, filepath=filepath, user_id=current_user.id)
    db.add(pdf)
    db.commit()
    db.refresh(pdf)

    # Extract and store in ChromaDB
    text = extract_text_from_pdf(filepath)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    chunks = chunk_text(text)
    store_chunks_in_chromadb(chunks, pdf.id)

    return {"message": "PDF uploaded successfully", "pdf_id": pdf.id, "filename": file.filename}

# Ask a question
@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify PDF belongs to user
    pdf = db.query(PDF).filter(PDF.id == request.pdf_id, PDF.user_id == current_user.id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # Get answer from RAG pipeline
    answer = process_query(request.question, request.pdf_id)

    # Save to chat history
    chat = ChatHistory(
        question=request.question,
        answer=answer,
        pdf_id=request.pdf_id,
        user_id=current_user.id
    )
    db.add(chat)
    db.commit()

    return {"question": request.question, "answer": answer}

# Get all PDFs for current user
@router.get("/pdfs")
async def get_pdfs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdfs = db.query(PDF).filter(PDF.user_id == current_user.id).all()
    return [{"id": p.id, "filename": p.filename, "uploaded_at": p.uploaded_at} for p in pdfs]

# Get chat history for a PDF
@router.get("/history/{pdf_id}")
async def get_chat_history(
    pdf_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(ChatHistory).filter(
        ChatHistory.pdf_id == pdf_id,
        ChatHistory.user_id == current_user.id
    ).all()
    return [{"question": h.question, "answer": h.answer, "created_at": h.created_at} for h in history]

# Delete a PDF
@router.delete("/pdf/{pdf_id}")
async def delete_pdf(
    pdf_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf = db.query(PDF).filter(PDF.id == pdf_id, PDF.user_id == current_user.id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # Delete file
    if os.path.exists(pdf.filepath):
        os.remove(pdf.filepath)

    # Delete ChromaDB collection
    delete_pdf_collection(pdf_id)

    # Delete from DB
    db.delete(pdf)
    db.commit()

    return {"message": "PDF deleted successfully"}