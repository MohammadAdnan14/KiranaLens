from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
from PIL import Image
import io

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="KiranaLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "KiranaLens API running"}


async def analyze_images(images: list[UploadFile]) -> dict:
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    pil_images = []
    for img in images:
        contents = await img.read()
        pil_images.append(Image.open(io.BytesIO(contents)))
    
    prompt = """
    You are an expert financial analyst for Indian NBFCs specializing in kirana store underwriting.
    
    Analyze these images of a kirana store and extract signals for cash flow estimation.
    
    Respond ONLY in this exact JSON format, no explanation, no markdown:
    {
        "shelf_density_index": <0-100, percentage of shelf space stocked>,
        "sku_diversity_score": <1-10, number of distinct product categories>,
        "inventory_value_range": [<low INR>, <high INR>],
        "refill_signal": "<genuine_demand | possibly_staged | overstocked>",
        "store_size": "<small | medium | large>",
        "category_mix": ["<category1>", "<category2>"],
        "fraud_flags": ["<flag if suspicious, else empty array>"],
        "vision_confidence": <0.0-1.0>
    }
    """
    
    response = model.generate_content([prompt] + pil_images)
    
    cleaned = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(cleaned)


@app.post("/analyze")
async def analyze(
    lat: float = Form(...),
    lng: float = Form(...),
    images: list[UploadFile] = File(...)
):
    vision_data = await analyze_images(images)
    return {"vision_data": vision_data, "lat": lat, "lng": lng}