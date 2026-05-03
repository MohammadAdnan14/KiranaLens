# KiranaLens

**Institutional-Grade Underwriting for the Unorganized Retail Sector**

KiranaLens is an AI-powered B2B SaaS platform that enables remote credit underwriting for small retail stores (Kirana stores) across India. By combining computer vision analysis with geo-intelligence, KiranaLens provides lenders with comprehensive store profiles and credit recommendations without physical visits.

---

## Screenshots

<!-- Add your screenshots to the docs/screenshots folder and uncomment the relevant lines below -->

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)

### Dashboard - Upload Form
![Dashboard Upload](docs/screenshots/dashboard-upload.png)

### Store Intelligence Profile
![Store Profile](docs/screenshots/store-profile.png)

### Cash Flow Analysis
![Cash Flow Analysis](docs/screenshots/cash-flow.png)

### Risk Assessment
![Risk Assessment](docs/screenshots/risk-assessment.png)

---

## Features

- **Vision AI Analysis** - Analyze store images to assess inventory quality, store organization, and business viability
- **Geo-Intelligence** - Validate store locations and analyze surrounding market dynamics
- **Cash Flow Estimation** - AI-powered cash flow projections based on visual and location data
- **Fraud Detection** - Multi-factor verification to identify potential fraudulent applications
- **Risk Scoring** - Comprehensive risk assessment with actionable insights
- **Credit Recommendations** - Automated credit limit suggestions with confidence scores

---

## Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS v4
- React Router v7
- Recharts for data visualization
- Lucide React for icons

### Backend
- FastAPI (Python)
- Google Generative AI (Gemini)
- Pillow for image processing

---

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm (or npm)
- Python 3.10+
- Google AI API Key (for Gemini)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Start the server
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## Project Structure

```
KiranaLens/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── landing/     # Landing page components
│   │   │   └── shared/ui/   # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities
│   │   └── index.css        # Global styles & design tokens
│   ├── index.html
│   └── package.json
├── docs/
│   └── screenshots/         # Product screenshots
└── README.md
```

---

## Adding Screenshots

To add screenshots to this README:

1. Take screenshots of your application
2. Save them to the `docs/screenshots/` folder with these names:
   - `landing-page.png` - Landing page hero section
   - `dashboard-upload.png` - Dashboard with upload form
   - `store-profile.png` - Store intelligence profile view
   - `cash-flow.png` - Cash flow analysis charts
   - `risk-assessment.png` - Risk scoring and flags
3. The images will automatically appear in this README

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze store image and location data |
| GET | `/health` | Health check endpoint |

---

## Environment Variables

### Backend (.env)
```
GOOGLE_API_KEY=your_google_ai_api_key
```

---

## License

This project was built for CRP TenzorX 2026 | Poonawalla Fincorp National AI Hackathon.

---

## Team

Built with care by the KiranaLens team.
