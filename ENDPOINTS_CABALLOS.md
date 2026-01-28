# 🐴 ENDPOINTS API - CABALLOS

**Fecha:** 26 de Enero de 2026
**Estado:** ✅ IMPLEMENTADO Y VERIFICADO

---

## 📋 ÍNDICE

1. [CRUD Caballo](#crud-caballo)
2. [Fotos](#fotos)
3. [Vacunas](#vacunas)
4. [Herrajes](#herrajes)
5. [Antiparasitarios](#antiparasitarios)
6. [Revisiones Dentales](#revisiones-dentales)
7. [Estudios Médicos](#estudios-médicos)
8. [Autenticación](#autenticación)

---

## 🐴 CRUD CABALLO

### **GET** `/api/v1/caballos/`
Lista todos los caballos con paginación y filtros.

**Query Params:**
- `skip` (int): Registros a omitir (default: 0)
- `limit` (int): Límite de registros (default: 100, max: 500)
- `activo_solo` (bool): Solo caballos activos (default: true)
- `propietario_id` (UUID): Filtrar por propietario

**Response:** `List[CaballoSchema]`

**Auth:** Usuario activo

---

### **GET** `/api/v1/caballos/buscar`
Busca caballos por nombre o raza.

**Query Params:**
- `q` (string, required): Término de búsqueda
- `skip` (int): Registros a omitir (default: 0)
- `limit` (int): Límite de registros (default: 100)

**Response:** `List[CaballoSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/`
Crea un nuevo caballo. **Genera QR automáticamente.**

**Body:** `CaballoCreate`
```json
{
  "nombre": "Thor",
  "numero_chip": "982000123456789",  // OBLIGATORIO - único
  "id_fomento": "FOM-2024-001",      // Opcional - único si se proporciona
  "edad": 8,
  "fecha_nacimiento": "2016-03-15",
  "pedigree": "Padre: Zeus | Madre: Atenea",
  "raza": "Pura Sangre",
  "sexo": "macho",
  "color": "alazán",
  "altura": 1.65,
  "peso": 500.00,
  "propietario_id": "uuid-123",
  "box_asignado": "Box 12",

  // Alimentación
  "grano_balanceado": "Royal Horse Mix Premium 5kg/día",
  "suplementos": "Vitamina E, Omega 3",
  "cantidad_comidas_dia": 3,
  "detalles_alimentacion": "Primera comida 6am...",

  // Manejo
  "tipo_manejo": "box_piquete",  // box | box_piquete | piquete | palenque | cross_tie

  // Trabajo
  "dias_trabajo": "L,M,X,J,V",
  "dias_descanso": "S,D",
  "jinete_asignado": "Juan Pérez",
  "tiempo_trabajo_diario": 90,  // minutos
  "trabajo_config": {
    "caminador": true,
    "cuerda": false,
    "manga": true,
    "montado": true
  },

  // Otros
  "embocadura_1": "Bocado partido con anillas",
  "embocadura_2": "Kimberwick",
  "cuidados_especiales": "Sensible a moscas, usar repelente",
  "caracteristicas": "Carácter tranquilo..."
}
```

**Response:** `CaballoSchema` (201 Created)

**Auth:** Admin

---

### **GET** `/api/v1/caballos/{caballo_id}`
Obtiene un caballo específico por ID.

**Response:** `CaballoSchema`

**Auth:** Usuario activo

---

### **GET** `/api/v1/caballos/{caballo_id}/completo`
Obtiene un caballo con TODAS sus relaciones (fotos, vacunas, herrajes, antiparasitarios).

**Response:** `CaballoCompleto`
```json
{
  // ... todos los campos de CaballoSchema
  "fotos": [...],
  "vacunas": [...],
  "herrajes": [...],
  "antiparasitarios": [...]
}
```

**Auth:** Usuario activo

---

### **PUT** `/api/v1/caballos/{caballo_id}`
Actualiza un caballo existente.

**Body:** `CaballoUpdate` (todos los campos opcionales)

**Response:** `CaballoSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/{caballo_id}`
Elimina un caballo (soft delete - cambia estado a RETIRADO).

**Response:** 204 No Content

**Auth:** Admin

---

## 📸 FOTOS

### **GET** `/api/v1/caballos/{caballo_id}/fotos`
Lista todas las fotos de un caballo.

**Response:** `List[FotoCaballoSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/fotos`
Agrega una foto al caballo.
**Si es la primera foto, se marca automáticamente como principal.**

**Body:** `FotoCaballoCreate`
```json
{
  "url": "https://cloudinary.com/imagen.jpg",
  "descripcion": "Vista lateral",
  "es_principal": false  // Opcional
}
```

**Response:** `FotoCaballoSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/fotos/{foto_id}/principal`
Marca una foto como principal (desmarca las demás automáticamente).

**Response:** `FotoCaballoSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/fotos/{foto_id}`
Elimina una foto.

**Response:** 204 No Content

**Auth:** Admin

---

## 💉 VACUNAS

### **GET** `/api/v1/caballos/{caballo_id}/vacunas`
Lista todas las vacunas de un caballo (ordenadas por fecha descendente).

**Response:** `List[VacunaRegistroSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/vacunas`
Registra una nueva vacuna.
**Calcula automáticamente `proxima_fecha` si se proporciona `frecuencia_dias`.**

**Body:** `VacunaRegistroCreate`
```json
{
  "tipo": "influenza",
  "fecha": "2024-10-15",
  "veterinario": "Dr. García",
  "marca": "Equilis Prequenza",
  "frecuencia_dias": 180,  // Próxima fecha se calcula automáticamente
  "observaciones": "Sin reacciones adversas",
  "aplicada": true
}
```

**Tipos de vacunas sugeridos:**
- `anemia` - Análisis de anemia infecciosa
- `influenza` - Vacuna contra influenza
- `encefalomielitis` - Vacuna contra encefalomielitis
- `rinoneumonitis` - Vacuna contra rinoneumonitis
- `rabia` - Vacuna antirrábica
- `perfil` - Perfil bioquímico
- O cualquier otro tipo personalizado

**Response:** `VacunaRegistroSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/vacunas/{vacuna_id}`
Actualiza un registro de vacuna.
**Recalcula `proxima_fecha` si cambia `fecha` o `frecuencia_dias`.**

**Body:** `VacunaRegistroUpdate` (todos los campos opcionales)

**Response:** `VacunaRegistroSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/vacunas/{vacuna_id}`
Elimina un registro de vacuna.

**Response:** 204 No Content

**Auth:** Admin

---

## 🔨 HERRAJES

### **GET** `/api/v1/caballos/{caballo_id}/herrajes`
Lista todos los herrajes de un caballo (ordenados por fecha descendente).

**Response:** `List[HerrajeRegistroSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/herrajes`
Registra un nuevo herraje.

**Body:** `HerrajeRegistroCreate`
```json
{
  "fecha": "2026-01-10",
  "herrador": "Carlos Martínez",
  "observaciones": "Cambio completo de herradura. Ajuste de pinzas.",
  "proximo_herraje": "2026-03-10",
  "costo": 15000.00
}
```

**Response:** `HerrajeRegistroSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/herrajes/{herraje_id}`
Actualiza un registro de herraje.

**Body:** `HerrajeRegistroUpdate` (todos los campos opcionales)

**Response:** `HerrajeRegistroSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/herrajes/{herraje_id}`
Elimina un registro de herraje.

**Response:** 204 No Content

**Auth:** Admin

---

## 💊 ANTIPARASITARIOS

### **GET** `/api/v1/caballos/{caballo_id}/antiparasitarios`
Lista todos los antiparasitarios de un caballo (ordenados por fecha descendente).

**Response:** `List[AntiparasitarioRegistroSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/antiparasitarios`
Registra una aplicación de antiparasitario.

**Body:** `AntiparasitarioRegistroCreate`
```json
{
  "fecha": "2026-01-15",
  "marca": "Ivomec",
  "drogas": "Ivermectina 1.87%",
  "dosis": "1 jeringa completa",
  "proxima_aplicacion": "2026-04-15",
  "observaciones": "Aplicación sin complicaciones"
}
```

**Response:** `AntiparasitarioRegistroSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/antiparasitarios/{antiparasitario_id}`
Actualiza un registro de antiparasitario.

**Body:** `AntiparasitarioRegistroUpdate` (todos los campos opcionales)

**Response:** `AntiparasitarioRegistroSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/antiparasitarios/{antiparasitario_id}`
Elimina un registro de antiparasitario.

**Response:** 204 No Content

**Auth:** Admin

---

## 🦷 REVISIONES DENTALES

### **GET** `/api/v1/caballos/{caballo_id}/revisiones-dentales`
Lista todas las revisiones dentales de un caballo (ordenadas por fecha descendente).

**Response:** `List[RevisionDentalSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/revisiones-dentales`
Registra una revisión dental.

**Body:** `RevisionDentalCreate`
```json
{
  "fecha": "2026-01-20",
  "veterinario": "Dra. López",
  "observaciones": "Desgaste normal. Limpieza y limado realizados.",
  "proxima_revision": "2027-01-20"
}
```

**Response:** `RevisionDentalSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/revisiones-dentales/{revision_id}`
Actualiza una revisión dental.

**Body:** `RevisionDentalUpdate` (todos los campos opcionales)

**Response:** `RevisionDentalSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/revisiones-dentales/{revision_id}`
Elimina una revisión dental.

**Response:** 204 No Content

**Auth:** Admin

---

## 🏥 ESTUDIOS MÉDICOS

### **GET** `/api/v1/caballos/{caballo_id}/estudios-medicos`
Lista todos los estudios médicos de un caballo (ordenados por fecha descendente).

**Response:** `List[EstudioMedicoSchema]`

**Auth:** Usuario activo

---

### **POST** `/api/v1/caballos/{caballo_id}/estudios-medicos`
Registra un estudio médico.

**Body:** `EstudioMedicoCreate`
```json
{
  "tipo": "radiografia",
  "fecha": "2026-01-18",
  "veterinario": "Dr. Hernández",
  "zona_estudiada": "Miembro anterior derecho",
  "diagnostico": "Sin fracturas visibles. Ligera inflamación en tendón.",
  "archivo_url": "https://cloudinary.com/radiografia.jpg",
  "observaciones": "Reposo de 2 semanas recomendado"
}
```

**Tipos de estudios:**
- `radiografia` - Radiografía
- `ecografia` - Ecografía
- `resonancia` - Resonancia magnética
- `tomografia` - Tomografía
- `endoscopia` - Endoscopía
- O cualquier otro tipo personalizado

**Response:** `EstudioMedicoSchema` (201 Created)

**Auth:** Admin

---

### **PUT** `/api/v1/caballos/estudios-medicos/{estudio_id}`
Actualiza un estudio médico.

**Body:** `EstudioMedicoUpdate` (todos los campos opcionales)

**Response:** `EstudioMedicoSchema`

**Auth:** Admin

---

### **DELETE** `/api/v1/caballos/estudios-medicos/{estudio_id}`
Elimina un estudio médico.

**Response:** 204 No Content

**Auth:** Admin

---

## 🔐 AUTENTICACIÓN

Todos los endpoints requieren autenticación mediante token JWT en el header:

```
Authorization: Bearer <token>
```

### Niveles de acceso:

- **Usuario Activo**: Puede leer/consultar información
  - GET endpoints (listar, buscar, obtener)

- **Admin**: Puede crear, actualizar y eliminar
  - POST, PUT, DELETE endpoints

---

## 🎯 FUNCIONALIDADES AUTOMÁTICAS

### 1. Generación de QR Code
Al crear un caballo, se genera automáticamente un QR code que contiene la URL a su ficha:
```
https://clubecuestre.com/caballos/{id}/ficha
```
El QR se guarda en formato base64 data URL en el campo `qr_code`.

### 2. Cálculo de Próxima Fecha (Vacunas)
Al registrar o actualizar una vacuna con `frecuencia_dias`, se calcula automáticamente `proxima_fecha`:
```python
proxima_fecha = fecha + timedelta(days=frecuencia_dias)
```

### 3. Foto Principal Automática
Al agregar la primera foto a un caballo, se marca automáticamente como `es_principal = true`.
Si se marca otra foto como principal, las demás se desmarcan automáticamente.

### 4. Validaciones de Unicidad
- `numero_chip`: Debe ser único en toda la base de datos
- `id_fomento`: Debe ser único si se proporciona (puede ser null)

Estas validaciones se realizan tanto al crear como al actualizar.

### 5. Soft Delete
Al eliminar un caballo, no se borra de la base de datos. Se cambia su estado a `RETIRADO`.

---

## 📊 ESTADOS DE CABALLO

Los caballos pueden tener los siguientes estados:

- `activo` - Caballo activo en el club
- `retirado` - Caballo retirado (soft delete)
- `en_tratamiento` - Caballo en tratamiento médico
- `fallecido` - Caballo fallecido

Por defecto, al crear un caballo su estado es `activo`.

---

## 🔢 EJEMPLO DE FLUJO COMPLETO

### 1. Crear caballo
```bash
POST /api/v1/caballos/
```

### 2. Subir fotos
```bash
POST /api/v1/caballos/{id}/fotos
POST /api/v1/caballos/{id}/fotos
POST /api/v1/caballos/{id}/fotos
```

### 3. Marcar una foto como principal
```bash
PUT /api/v1/caballos/fotos/{foto_id}/principal
```

### 4. Registrar historial médico
```bash
POST /api/v1/caballos/{id}/vacunas
POST /api/v1/caballos/{id}/herrajes
POST /api/v1/caballos/{id}/antiparasitarios
POST /api/v1/caballos/{id}/revisiones-dentales
```

### 5. Obtener ficha completa
```bash
GET /api/v1/caballos/{id}/completo
```

---

## 🔧 BASE URL

**Desarrollo:** `http://localhost:8000`
**Producción:** `https://api.clubecuestre.com`

---

## ✅ ESTADO

**Backend COMPLETO y FUNCIONAL** ✅

Próximo paso: Implementar frontend (formularios, fichas, galerías, calendarios).
