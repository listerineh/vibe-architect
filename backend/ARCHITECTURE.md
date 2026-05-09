# Backend Architecture - Hexagonal Architecture (Ports & Adapters)

## Overview

El backend de VibeArchitect sigue una **Arquitectura Hexagonal** (también conocida como Ports & Adapters), que separa la lógica de negocio de los detalles de implementación.

## Estructura de Capas

```
src/
├── domain/                 # Núcleo del negocio (sin dependencias externas)
│   ├── entities/          # Entidades de dominio
│   │   └── project.py     # ProjectRequest, Boilerplate, etc.
│   └── ports/             # Interfaces (contratos)
│       ├── ai_service.py  # Port para servicios de IA
│       └── file_generator.py  # Port para generación de archivos
│
├── application/           # Casos de uso (orquestación)
│   └── use_cases/
│       ├── generate_boilerplate.py  # Generar y descargar
│       └── preview_boilerplate.py   # Solo preview
│
├── infrastructure/        # Implementaciones concretas
│   ├── config/
│   │   └── settings.py    # Configuración de la aplicación
│   └── adapters/
│       ├── vertex_ai_adapter.py     # Implementación de AIServicePort
│       └── zip_file_generator.py   # Implementación de FileGeneratorPort
│
└── presentation/          # Capa de presentación (API REST)
    └── api/
        ├── app.py         # Factory de FastAPI
        ├── routes.py      # Endpoints HTTP
        ├── schemas.py     # DTOs (Pydantic)
        └── mappers.py     # Conversión DTO ↔ Domain
```

## Principios Aplicados

### 1. Dependency Inversion Principle (DIP)
- El dominio **no depende** de la infraestructura
- Las dependencias apuntan hacia adentro (hacia el dominio)
- Los adapters implementan los ports definidos en el dominio

### 2. Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- Use cases orquestan, no implementan lógica de negocio
- Adapters solo traducen entre sistemas externos y el dominio

### 3. Open/Closed Principle (OCP)
- Fácil agregar nuevos adapters (OpenAI, Claude, etc.) sin modificar el dominio
- Nuevos casos de uso sin cambiar entidades existentes

## Flujo de Datos

```
HTTP Request
    ↓
[Presentation Layer]
    ├── routes.py recibe ProjectRequestDTO
    ├── mappers.py convierte a ProjectRequest (domain)
    ↓
[Application Layer]
    ├── use_case.execute(ProjectRequest)
    ├── Llama a AIServicePort.generate_boilerplate()
    ↓
[Infrastructure Layer]
    ├── VertexAIAdapter implementa AIServicePort
    ├── Llama a Vertex AI (Gemini)
    ├── Retorna Boilerplate (domain entity)
    ↓
[Application Layer]
    ├── use_case llama a FileGeneratorPort.create_archive()
    ↓
[Infrastructure Layer]
    ├── ZipFileGenerator crea el ZIP
    ↓
[Presentation Layer]
    ├── mappers.py convierte a BoilerplateResponseDTO
    ├── routes.py retorna HTTP Response
```

## Ventajas de esta Arquitectura

### ✅ Testabilidad
- Fácil crear mocks de los ports para testing
- Use cases se pueden probar sin infraestructura real

### ✅ Flexibilidad
- Cambiar de Vertex AI a OpenAI solo requiere crear un nuevo adapter
- Cambiar de ZIP a tar.gz solo requiere implementar FileGeneratorPort

### ✅ Mantenibilidad
- Lógica de negocio aislada en `domain/`
- Cambios en FastAPI no afectan el dominio
- Cambios en Vertex AI no afectan los use cases

### ✅ Escalabilidad
- Fácil agregar nuevos casos de uso
- Fácil agregar nuevos adapters (cache, database, etc.)

## Componentes Clave

### Domain Layer

**Entities** (`domain/entities/project.py`):
- `ProjectRequest`: Solicitud del usuario
- `Boilerplate`: Estructura generada
- `TechPreferences`, `FileStructure`, etc.

**Ports** (`domain/ports/`):
- `AIServicePort`: Interfaz para servicios de IA
- `FileGeneratorPort`: Interfaz para generadores de archivos

### Application Layer

**Use Cases** (`application/use_cases/`):
- `GenerateBoilerplateUseCase`: Genera y descarga
- `PreviewBoilerplateUseCase`: Solo muestra estructura

### Infrastructure Layer

**Adapters** (`infrastructure/adapters/`):
- `VertexAIAdapter`: Implementa `AIServicePort` usando Gemini
- `ZipFileGenerator`: Implementa `FileGeneratorPort` usando zipfile

**Config** (`infrastructure/config/`):
- `Settings`: Configuración centralizada (Pydantic)

### Presentation Layer

**API** (`presentation/api/`):
- `app.py`: Factory de FastAPI con dependency injection
- `routes.py`: Endpoints HTTP
- `schemas.py`: DTOs para validación
- `mappers.py`: Conversión entre DTOs y entidades de dominio

## Dependency Injection

El archivo `app.py` actúa como **Composition Root**:

```python
def create_app() -> FastAPI:
    # Crear adapters (infraestructura)
    ai_adapter = VertexAIAdapter()
    file_generator = ZipFileGenerator()
    
    # Inyectar en use cases (aplicación)
    generate_use_case = GenerateBoilerplateUseCase(ai_adapter, file_generator)
    preview_use_case = PreviewBoilerplateUseCase(ai_adapter)
    
    # Inyectar en router (presentación)
    router = create_router(generate_use_case, preview_use_case)
    
    return app
```

## Testing Strategy

### Unit Tests (Domain)
```python
def test_project_request_validation():
    with pytest.raises(ValueError):
        ProjectRequest(description="short", ...)
```

### Integration Tests (Use Cases)
```python
def test_preview_use_case():
    mock_ai = MockAIService()
    use_case = PreviewBoilerplateUseCase(mock_ai)
    result = await use_case.execute(request)
    assert result.project_metadata.name == "expected"
```

### E2E Tests (API)
```python
def test_preview_endpoint():
    response = client.post("/api/preview", json={...})
    assert response.status_code == 200
```

## Extensibilidad

### Agregar nuevo AI Provider (OpenAI)

1. Crear `infrastructure/adapters/openai_adapter.py`:
```python
class OpenAIAdapter(AIServicePort):
    async def generate_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        # Implementación con OpenAI
        pass
```

2. Modificar `app.py`:
```python
ai_adapter = OpenAIAdapter()  # En lugar de VertexAIAdapter
```

### Agregar Cache Layer

1. Crear `infrastructure/adapters/cached_ai_adapter.py`:
```python
class CachedAIAdapter(AIServicePort):
    def __init__(self, ai_service: AIServicePort, cache: Cache):
        self._ai_service = ai_service
        self._cache = cache
    
    async def generate_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        cached = self._cache.get(request)
        if cached:
            return cached
        result = await self._ai_service.generate_boilerplate(request)
        self._cache.set(request, result)
        return result
```

## Modo Mock (Desarrollo sin Vertex AI)

El `VertexAIAdapter` incluye un modo mock que se activa automáticamente cuando no hay credenciales de GCP:

```python
if not self._initialized or not self._model:
    return self._generate_mock_boilerplate(request)
```

Esto permite:
- ✅ Desarrollar sin configurar Vertex AI
- ✅ Probar la API completa localmente
- ✅ Demos sin costos de IA

## Comparación: Antes vs Después

### Antes (Arquitectura Plana)
```
backend/
├── main.py              # Todo mezclado
├── models.py            # Pydantic models
├── config.py            # Settings
└── services/
    ├── vertex_ai.py     # Lógica + infraestructura
    └── zip_generator.py
```

**Problemas:**
- ❌ Difícil testear sin Vertex AI real
- ❌ Cambiar de IA requiere modificar múltiples archivos
- ❌ Lógica de negocio mezclada con FastAPI

### Después (Arquitectura Hexagonal)
```
backend/
├── main.py              # Solo importa app
└── src/
    ├── domain/          # Lógica pura
    ├── application/     # Casos de uso
    ├── infrastructure/  # Implementaciones
    └── presentation/    # API REST
```

**Ventajas:**
- ✅ Testeable con mocks
- ✅ Cambiar IA = crear nuevo adapter
- ✅ Lógica de negocio aislada

## Referencias

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports & Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)
