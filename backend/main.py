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

# Global constants
STORE_SIZE_BASE = {
    "small": 3000,
    "medium": 6000,
    "large": 12000
}

HIGH_MARGIN_CATEGORIES = ["personal care", "packaged foods", "beverages", "dairy", "snacks", "tobacco"]

@app.get("/")
def root():
    return {"status": "KiranaLens API running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_key": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
        "maps_key": "configured" if os.getenv("GOOGLE_MAPS_API_KEY") else "missing"
    }

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
    
    grocery_params = {
        "location": f"{lat},{lng}",
        "radius": 500,
        "keyword": "grocery",
        "key": gmaps_key
    }
    grocery_response = requests.get(base_url, params=grocery_params)
    competition_count = len(grocery_response.json().get("results", []))
    
    footfall_params = {
        "location": f"{lat},{lng}",
        "radius": 800,
        "keyword": "school|office|station|market",
        "key": gmaps_key
    }
    footfall_response = requests.get(base_url, params=footfall_params)
    footfall_count = len(footfall_response.json().get("results", []))
    
    competition_density = min(competition_count / 5, 1.0)
    footfall_score = min((footfall_count / 10) * 100, 100)
    
    # Dynamic geo confidence
    geo_confidence = 0.9 if footfall_score > 0 or competition_density > 0 else 0.4
    
    return {
        "competition_density": round(competition_density, 2),
        "footfall_score": round(footfall_score, 1),
        "geo_confidence": geo_confidence
    }

def validate_vision_data(vision_data: dict) -> dict:
    if vision_data["shelf_density_index"] > 90 and vision_data["store_size"] == "small":
        vision_data["shelf_density_index"] = min(vision_data["shelf_density_index"], 80)
        vision_data["fraud_flags"].append("sdi_store_size_mismatch")
    
    if vision_data["shelf_density_index"] < 30 and vision_data["vision_confidence"] > 0.8:
        vision_data["vision_confidence"] = 0.6
    
    if len(vision_data["category_mix"]) < 3 and vision_data["sku_diversity_score"] > 7:
        vision_data["sku_diversity_score"] = len(vision_data["category_mix"]) + 1
    
    return vision_data

def calculate_confidence(vision_data: dict, geo_data: dict, image_count: int) -> float:
    """Calculate confidence using multiple factors"""
    confidence_factors = []
    
    # Factor 1: Gemini vision confidence
    confidence_factors.append(vision_data["vision_confidence"])
    
    # Factor 2: More images = more confident
    image_confidence = min(image_count / 5, 1.0)
    confidence_factors.append(image_confidence)
    
    # Factor 3: Geo data quality
    confidence_factors.append(geo_data["geo_confidence"])
    
    # Factor 4: Internal consistency
    consistency = 1.0
    if vision_data["refill_signal"] == "overstocked" and vision_data["shelf_density_index"] > 80:
        consistency -= 0.15
    if vision_data["sku_diversity_score"] > 8 and len(vision_data["category_mix"]) < 3:
        consistency -= 0.1
    confidence_factors.append(consistency)
    
    return round(sum(confidence_factors) / len(confidence_factors), 2)

def calculate_fraud_score(vision_data: dict, geo_data: dict) -> dict:
    """Calculate fraud score with cross-signal detection"""
    fraud_score = 0
    flags = list(vision_data.get("fraud_flags", []))
    
    # Single signal flags
    if vision_data["inventory_value_range"][1] > 500000 and geo_data["footfall_score"] < 30:
        flags.append("inventory_footfall_mismatch")
        fraud_score += 20
    
    if vision_data["inventory_value_range"][1] > 500000 and vision_data["sku_diversity_score"] < 5:
        flags.append("low_sku_diversity_high_inventory")
        fraud_score += 15
    
    if geo_data["competition_density"] > 0.6 and geo_data["footfall_score"] < 40:
        flags.append("high_competition_low_demand")
        fraud_score += 15
    
    if vision_data["shelf_density_index"] < 40:
        flags.append("underutilized_space")
        fraud_score += 10
    
    if vision_data["sku_diversity_score"] < 3:
        flags.append("limited_product_range")
        fraud_score += 10
    
    if vision_data["vision_confidence"] < 0.6:
        flags.append("poor_image_quality")
        fraud_score += 10
    
    if vision_data["refill_signal"] == "overstocked":
        flags.append("possible_staged_inventory")
        fraud_score += 20

    # Cross-signal flags
    if (vision_data["shelf_density_index"] > 85 and
        geo_data["footfall_score"] < 25 and
        vision_data["refill_signal"] == "overstocked"):
        flags.append("staged_inspection_likely")
        fraud_score += 40
    
    if (vision_data["inventory_value_range"][1] > 400000 and
        vision_data["store_size"] == "small"):
        flags.append("inventory_store_size_mismatch")
        fraud_score += 25
    
    if (vision_data["shelf_density_index"] > 90 and
        vision_data["sku_diversity_score"] > 8 and
        vision_data["vision_confidence"] > 0.9):
        flags.append("suspiciously_perfect_scores")
        fraud_score += 20
    
    if geo_data["competition_density"] > 0.7:
        flags.append("high_competition_area_risk")
        fraud_score += 15

    return {
        "fraud_score": min(fraud_score, 100),
        "flags": list(set(flags))  # Remove duplicates
    }

def fuse_and_estimate(vision_data: dict, geo_data: dict, image_count: int) -> dict:
    """Fuse vision + geo into cash flow estimate"""
    shelf_density = vision_data["shelf_density_index"]
    sku_diversity = vision_data["sku_diversity_score"]
    store_size = vision_data["store_size"]

    # Base anchored to real kirana benchmarks
    base_daily = STORE_SIZE_BASE.get(store_size, 6000)
    
    # Multipliers
    sdi_multiplier = 0.5 + (shelf_density / 100)
    sku_multiplier = 0.7 + (sku_diversity / 10) * 0.6
    footfall_multiplier = 0.8 + (geo_data["footfall_score"] / 100) * 0.6
    competition_discount = 1 - (geo_data["competition_density"] * 0.3)
    
    daily_base = base_daily * sdi_multiplier * sku_multiplier * footfall_multiplier * competition_discount
    daily_low = int(daily_base * 0.75)
    daily_high = int(daily_base * 1.25)
    
    monthly_revenue_low = daily_low * 26
    monthly_revenue_high = daily_high * 26
    
    # Dynamic margin
    category_bonus = sum(
        1 for cat in vision_data["category_mix"]
        if cat.lower() in HIGH_MARGIN_CATEGORIES
    ) * 0.02
    margin_low = 0.12 + category_bonus
    margin_high = 0.18 + category_bonus
    
    monthly_income_low = int(monthly_revenue_low * margin_low)
    monthly_income_high = int(monthly_revenue_high * margin_high)
    
    # Confidence and fraud
    confidence = calculate_confidence(vision_data, geo_data, image_count)
    fraud_result = calculate_fraud_score(vision_data, geo_data)
    risk_flags = fraud_result["flags"]
    fraud_score = fraud_result["fraud_score"]

    # Recommendation
    if confidence > 0.75 and len(risk_flags) == 0:
        recommendation = "approve"
    elif confidence > 0.7 and len(risk_flags) <= 1:
        recommendation = "approve_with_conditions"
    elif confidence > 0.65 and len(risk_flags) <= 2:
        recommendation = "needs_verification"
    elif confidence > 0.6:
        recommendation = "needs_manual_review"
    else:
        recommendation = "reject"
    
    return {
        "daily_sales_range": [daily_low, daily_high],
        "monthly_revenue_range": [monthly_revenue_low, monthly_revenue_high],
        "monthly_income_range": [monthly_income_low, monthly_income_high],
        "confidence_score": confidence,
        "fraud_score": fraud_score,
        "risk_flags": risk_flags,
        "recommendation": recommendation,
        "vision_breakdown": {
            "shelf_density_index": shelf_density,
            "sku_diversity_score": sku_diversity,
            "refill_signal": vision_data["refill_signal"],
            "store_size": store_size,
            "category_mix": vision_data["category_mix"]
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
        
        image_count = len(images)  # ✅ This line is here
        vision_data = await analyze_images(images)
        vision_data = validate_vision_data(vision_data)
        
        gmaps_key = os.getenv("GOOGLE_MAPS_API_KEY")
        geo_data = await get_geo_score(lat, lng, gmaps_key)
        
        final_estimate = fuse_and_estimate(vision_data, geo_data, image_count)  # ✅ Pass all 3
        
        return final_estimate
    
    except Exception as e:
        return {"error": str(e), "status": 500}