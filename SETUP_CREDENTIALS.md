# 🔐 Guía de Configuración de Credenciales

## 📋 Variables de Entorno Necesarias

### 1. **Firebase Admin SDK** (Autenticación Backend)

#### Opción A: Service Account Key (Recomendado para Producción)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **vibe-architect-676ae**
3. Ve a **Project Settings** (⚙️ > Project settings)
4. Pestaña **Service accounts**
5. Click en **Generate new private key**
6. Guarda el archivo JSON descargado como `firebase-service-account.json` en `/backend`
7. En tu `.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
   ```

#### Opción B: Credenciales por Defecto (Desarrollo Local)

Para desarrollo local, puedes omitir esta variable y Firebase usará las credenciales por defecto de tu máquina.

---

### 2. **Firebase Storage** (Almacenamiento de ZIPs)

Firebase Storage ya está configurado automáticamente con tu proyecto de Firebase.

#### Características del Tier Gratuito:

- ✅ **5GB** de almacenamiento
- ✅ **1GB/día** de descarga
- ✅ **50,000** operaciones de descarga/día
- ✅ **20,000** operaciones de subida/día

#### Configuración:

El bucket se configura automáticamente. Solo necesitas agregar en tu `.env`:

```bash
FIREBASE_STORAGE_BUCKET=vibe-architect-676ae.firebasestorage.app
```

**¡Eso es todo!** No necesitas configurar nada más. Firebase Storage usa las mismas credenciales que Firebase Admin SDK.

---

## 🚀 Verificación

### Backend

1. Copia `.env.example` a `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales

3. Reinicia el servidor:
   ```bash
   source .venv/bin/activate
   uvicorn src.presentation.api.app:app --reload
   ```

4. Verifica en los logs:
   ```
   ✅ Firebase initialized successfully
   ✅ R2 client initialized successfully
   ```

### Frontend

Las credenciales de Firebase ya están configuradas en `/frontend/.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD3ZBknby5OdULA5ArMnL6LMhpNb_5ldJg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vibe-architect-676ae.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vibe-architect-676ae
# ... etc
```

---

## 📝 Resumen de Archivos

```
backend/
├── .env                          # ← Tus credenciales (NO commitear)
├── .env.example                  # ← Template
└── firebase-service-account.json # ← Service account (opcional, NO commitear)

frontend/
└── .env.local                    # ← Ya configurado ✅
```

---

## 🔒 Seguridad

**NUNCA** commitees estos archivos:
- ❌ `backend/.env`
- ❌ `backend/firebase-service-account.json`
- ❌ `frontend/.env.local`

Ya están en `.gitignore` ✅

---

## 🆘 Troubleshooting

### Error: "Firebase Storage not configured"
- Verifica que Firebase está inicializado correctamente
- Verifica que `FIREBASE_STORAGE_BUCKET` está en `.env`
- Verifica que el service account tiene permisos de Storage

### Error: "Invalid token"
- Verifica que Firebase está inicializado
- Verifica que el service account key es válido
- Verifica que el proyecto ID coincide

### Error: "Failed to upload to Firebase Storage"
- Verifica que el service account tiene permisos de Storage Admin
- Verifica que el bucket existe en Firebase Console
- Verifica que las reglas de Storage permiten escritura
