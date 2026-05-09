# VibeArchitect Backend

FastAPI backend service for AI-First boilerplate generation using Google Gemini.

## 🚀 Quick Start

### Opción 1: Modo MOCK (Sin API Key)

Perfecto para probar la estructura sin configurar nada:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

El backend generará datos de ejemplo automáticamente.

### Opción 2: Con Google AI Studio (Recomendado - 5 minutos)

**1. Obtener API Key:**
- Ve a https://aistudio.google.com/app/apikey
- Haz clic en "Create API key"
- Copia la API key generada

**2. Configurar:**
```bash
# Instalar dependencias
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edita .env y agrega: GEMINI_API_KEY=tu-api-key-aqui
```

**3. Iniciar:**
```bash
uvicorn main:app --reload --port 8000
```

**Modelos disponibles:**
- `gemini-2.5-flash` (Recomendado - Rápido y eficiente)
- `gemini-2.5-pro` (Máxima calidad, más lento)
- `gemini-flash-latest` (Siempre la última versión)

**Límites gratuitos:**
- 60 requests/minuto
- 1,500 requests/día
- Perfecto para desarrollo y demos

---

## 📡 API Endpoints

### Health Check
```bash
GET /
```

### Preview Boilerplate
```bash
POST /api/preview
Content-Type: application/json

{
  "description": "E-commerce platform for handmade crafts",
  "google_mode": true,
  "tech_preferences": {
    "css": "tailwind",
    "database": "firestore"
  }
}
```

**Response:**
```json
{
  "project_metadata": {
    "name": "e-commerce-platform",
    "stack_type": "google_mode",
    "explanation": "..."
  },
  "file_structure": [...],
  "dependencies": {...},
  "cursor_rules": {...},
  "known_limitations": [...]
}
```

### Generate & Download ZIP
```bash
POST /api/generate
Content-Type: application/json

{
  "description": "Task manager app",
  "google_mode": false,
  "tech_preferences": {
    "css": "tailwind"
  }
}
```

**Response:** ZIP file download

---

## 🛠️ Troubleshooting

### Error: "API key not valid"
- Verifica que copiaste la API key completa
- Genera una nueva en https://aistudio.google.com/app/apikey

### Error: "models/gemini-xxx is not found"
- Ejecuta `python list_gemini_models.py` para ver modelos disponibles
- Actualiza `GEMINI_MODEL` en tu `.env`

### Error: "Quota exceeded"
- Espera 1 minuto (límite de 60 req/min)
- Considera usar `gemini-2.5-flash` (más rápido)

---

## 🏗️ Arquitectura

El backend usa **Arquitectura Hexagonal (Ports & Adapters)**:

```
src/
├── domain/              # Entidades y puertos (interfaces)
├── application/         # Casos de uso (lógica de negocio)
├── infrastructure/      # Adaptadores (Gemini API, ZIP generator)
└── presentation/        # API REST (FastAPI routes)
```

Ver `ARCHITECTURE.md` para más detalles.

---

## 🚀 Deployment

### Cloud Run (Google Cloud)

```bash
gcloud run deploy vibearchitect-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key
```

### Docker

```bash
docker build -t vibearchitect-backend .
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your-key \
  vibearchitect-backend
```

---

## 📊 Costos Estimados

**Google AI Studio (Gemini 2.5 Flash):**
- Input: $0.00025 por 1K caracteres
- Output: $0.00075 por 1K caracteres
- **~$0.017 por generación**

**Ejemplo mensual (100 generaciones):**
- Con free tier: $0 (dentro de límites)
- Sin free tier: ~$1.70/mes

---

## 🔒 Seguridad

### Mejores Prácticas

✅ **Hacer:**
- Mantén `.env` local (nunca en Git)
- Rota API keys cada 90 días
- Restringe API key por dominio/IP en Google Cloud Console
- Monitorea uso en https://aistudio.google.com/app/usage

❌ **No hacer:**
- No compartas tu API key
- No la uses en el frontend
- No la hardcodees en el código
- No la incluyas en screenshots

---

## 📚 Stack Tecnológico

- **Framework:** FastAPI 0.110.0
- **AI:** Google Gemini 2.5 Flash (via AI Studio)
- **Validación:** Pydantic 2.6.1
- **Arquitectura:** Hexagonal (Ports & Adapters)
- **Python:** 3.11+

---

## 🧪 Testing

```bash
# Listar modelos disponibles
python list_gemini_models.py

# Probar endpoint de preview
curl -X POST http://localhost:8000/api/preview \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Blog platform",
    "google_mode": true,
    "tech_preferences": {"css": "tailwind"}
  }' | python3 -m json.tool
```

---

## 📖 Documentación Adicional

- **Arquitectura Hexagonal:** `ARCHITECTURE.md`
- **Gemini API Docs:** https://ai.google.dev/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
