from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
from PIL import Image
import io
import requests

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

async def get_geo_score(lat: float, lng: float, gmaps_key: str) -> dict:
    """Get geo signals from Google Maps Places API"""
    
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    # Search for nearby grocery stores (competition)
    grocery_params = {
        "location": f"{lat},{lng}",
        "radius": 500,
        "keyword": "grocery",
        "key": gmaps_key
    }
    grocery_response = requests.get(base_url, params=grocery_params)
    competition_count = len(grocery_response.json().get("results", []))
    
    # Search for footfall attractors (schools, offices, stations)
    footfall_params = {
        "location": f"{lat},{lng}",
        "radius": 800,
        "keyword": "school|office|station|market",
        "key": gmaps_key
    }
    footfall_response = requests.get(base_url, params=footfall_params)
    footfall_count = len(footfall_response.json().get("results", []))
    
    # Calculate scores
    competition_density = min(competition_count / 5, 1.0)  # Normalize to 0-1
    footfall_score = min((footfall_count / 10) * 100, 100)  # Normalize to 0-100
    
    return {
        "competition_density": round(competition_density, 2),
        "footfall_score": round(footfall_score, 1),
        "geo_confidence": 0.75
    }
def fuse_and_estimate(vision_data: dict, geo_data: dict) -> dict:
    """Combine vision + geo into cash flow estimate"""
    
    # Base daily sales calculation
    shelf_density = vision_data["shelf_density_index"]
    sku_diversity = vision_data["sku_diversity_score"]
    inventory_value = (vision_data["inventory_value_range"][0] + vision_data["inventory_value_range"][1]) / 2
    
    # Formula: shelf density drives base, diversity adds, inventory scales
    base_daily = (shelf_density * 60) + (sku_diversity * 200)  # ₹60 per SDI point + ₹200 per SKU
    
    # Geo multiplier (footfall increases sales, competition decreases)
    footfall_multiplier = 0.8 + (geo_data["footfall_score"] / 100) * 0.6  # 0.8 to 1.4
    competition_discount = 1 - (geo_data["competition_density"] * 0.3)  # 0.7 to 1.0
    
    # Final daily sales range
    daily_base = base_daily * footfall_multiplier * competition_discount
    daily_low = int(daily_base * 0.75)
    daily_high = int(daily_base * 1.25)
    
    # Monthly estimates
    monthly_revenue_low = daily_low * 26  # ~26 business days/month
    monthly_revenue_high = daily_high * 26
    
    # Owner income (assumes 12-18% net margin)
    monthly_income_low = int(monthly_revenue_low * 0.12)
    monthly_income_high = int(monthly_revenue_high * 0.18)
    
    # Confidence score
    confidence = (vision_data["vision_confidence"] + geo_data["geo_confidence"]) / 2
    
    # Risk flags
    risk_flags = vision_data.get("fraud_flags", [])
    
    # Inventory-footfall mismatch
    if vision_data["inventory_value_range"][1] > 500000 and geo_data["footfall_score"] < 30:
        risk_flags.append("inventory_footfall_mismatch")
    
    # High inventory but low SKU diversity = slow-moving stock
    if vision_data["inventory_value_range"][1] > 500000 and sku_diversity < 5:
        risk_flags.append("low_sku_diversity_high_inventory")
    
    # Recommendation
    if confidence > 0.7 and len(risk_flags) == 0:
        recommendation = "approve"
    elif confidence > 0.65:
        recommendation = "needs_verification"
    else:
        recommendation = "reject"
    
    return {
        "daily_sales_range": [daily_low, daily_high],
        "monthly_revenue_range": [monthly_revenue_low, monthly_revenue_high],
        "monthly_income_range": [monthly_income_low, monthly_income_high],
        "confidence_score": round(confidence, 2),
        "risk_flags": risk_flags,
        "recommendation": recommendation,
        "vision_breakdown": {
            "shelf_density_index": vision_data["shelf_density_index"],
            "sku_diversity_score": vision_data["sku_diversity_score"],
            "refill_signal": vision_data["refill_signal"],
            "store_size": vision_data["store_size"]
        }
    }

@app.post("/analyze")
async def analyze(
    lat: float = Form(...),
    lng: float = Form(...),
    images: list[UploadFile] = File(...)
):
    try:
        if not images:
            return {"error": "At least 1 image required"}
        
        if len(images) > 5:
            return {"error": "Maximum 5 images allowed"}
        
        vision_data = await analyze_images(images)
        gmaps_key = os.getenv("GOOGLE_MAPS_API_KEY")
        geo_data = await get_geo_score(lat, lng, gmaps_key)
        
        final_estimate = fuse_and_estimate(vision_data, geo_data)
        
        return final_estimate
    
    except Exception as e:
        return {"error": str(e), "status": 500}
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_key": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
        "maps_key": "configured" if os.getenv("GOOGLE_MAPS_API_KEY") else "missing"
    }