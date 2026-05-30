import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_or_create_collection(pdf_id: int):
    collection_name = f"pdf_{pdf_id}"
    try:
        return chroma_client.get_collection(collection_name)
    except:
        return chroma_client.create_collection(collection_name)

def store_chunks_in_chromadb(chunks: list[str], pdf_id: int):
    collection = get_or_create_collection(pdf_id)
    
    # Generate embeddings
    embeddings = embedding_model.encode(chunks).tolist()
    
    # Store in ChromaDB
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{pdf_id}_{i}" for i in range(len(chunks))]
    )
    return True

def retrieve_relevant_chunks(query: str, pdf_id: int, top_k: int = 5) -> list[str]:
    collection = get_or_create_collection(pdf_id)
    
    # Embed the query
    query_embedding = embedding_model.encode([query]).tolist()
    
    # Search ChromaDB
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(top_k, collection.count())
    )
    
    return results["documents"][0] if results["documents"] else []

def generate_answer(question: str, context_chunks: list[str], ) -> str:
    context = "\n\n".join(context_chunks)
    
    prompt = f"""You are DocuMind AI, an intelligent document assistant.
Use the following document context to answer the question accurately.
If the answer is not in the context, say "I couldn't find that information in the document."

Context:
{context}

Question: {question}

Answer:"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        temperature=0.1
    )
    
    return response.choices[0].message.content

def process_query(question: str, pdf_id: int) -> str:
    # Step 1: Retrieve relevant chunks
    relevant_chunks = retrieve_relevant_chunks(question, pdf_id)
    
    if not relevant_chunks:
        return "No relevant content found in the document."
    
    # Step 2: Generate answer using Groq LLM
    answer = generate_answer(question, relevant_chunks)
    return answer

def delete_pdf_collection(pdf_id: int):
    try:
        chroma_client.delete_collection(f"pdf_{pdf_id}")
    except:
        pass