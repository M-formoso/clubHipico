# 🐴 MODELO DE CABALLO - COMPLETO Y EXPANDIDO

**Fecha:** 25 de Enero de 2026
**Estado:** ✅ MIGRACIÓN APLICADA - Base de datos actualizada

---

## 📋 RESUMEN DE CAMBIOS

Se ha expandido completamente el modelo de Caballo para incluir **TODOS** los datos requeridos para la gestión integral del club hípico.

### ✅ Nuevas Tablas Creadas:
1. `vacunas_registros` - Registro de vacunas y análisis
2. `revisiones_dentales` - Revisiones dentales periódicas
3. `estudios_medicos` - Radiografías, ecografías, etc.
4. `herrajes_registros` - Historial de herrajes
5. `antiparasitarios_registros` - Aplicaciones de antiparasitarios

### ✅ Nuevos Campos en Tabla `caballos`:
- Datos básicos obligatorios
- Información de alimentación
- Manejo diario
- Trabajo diario
- Otros detalles (embocaduras, cuidados especiales)
- QR Code automático

---

## 🗄️ ESTRUCTURA COMPLETA

### Tabla: `caballos`

#### **DATOS BÁSICOS OBLIGATORIOS** ⭐
```sql
nombre VARCHAR(100) NOT NULL  -- Nombre del caballo
numero_chip VARCHAR(50) NOT NULL UNIQUE  -- Número de microchip (OBLIGATORIO)
id_fomento VARCHAR(50) UNIQUE  -- ID de fomento
edad INTEGER  -- Edad del caballo
fecha_nacimiento DATE  -- Fecha de nacimiento
pedigree TEXT  -- Información del pedigree
```

#### **QR CODE** 📱
```sql
qr_code VARCHAR(500)  -- URL o path del QR generado automáticamente al crear
```

#### **ALIMENTACIÓN** 🌾
```sql
grano_balanceado VARCHAR(200)  -- Tipo de grano o balanceado
suplementos VARCHAR(500)  -- Suplementos que recibe
cantidad_comidas_dia INTEGER  -- Cantidad de comidas al día
detalles_alimentacion TEXT  -- Detalles adicionales de alimentación
```

#### **MANEJO DIARIO** 🏠
```sql
tipo_manejo ENUM  -- BOX | BOX_PIQUETE | PIQUETE | PALENQUE | CROSS_TIE
```

Opciones:
- **BOX**: Solo en box
- **BOX_PIQUETE**: Box y piquete
- **PIQUETE**: Solo piquete
- **PALENQUE**: Palenque
- **CROSS_TIE**: Cross tie

#### **TRABAJO DIARIO** 🏇
```sql
dias_trabajo VARCHAR(100)  -- Ej: "L,M,X,J,V"
dias_descanso VARCHAR(100)  -- Ej: "S,D"
jinete_asignado VARCHAR(100)  -- Nombre del jinete
tiempo_trabajo_diario INTEGER  -- Tiempo en minutos
trabajo_config JSONB  -- Configuración de tipos de trabajo
```

**Ejemplo de `trabajo_config`:**
```json
{
  "caminador": true,
  "cuerda": false,
  "manga": true,
  "montado": true
}
```

#### **OTROS DETALLES** 🎯
```sql
embocadura_1 VARCHAR(200)  -- Primera embocadura
embocadura_2 VARCHAR(200)  -- Segunda embocadura
cuidados_especiales TEXT  -- Cuidados especiales requeridos
otra_info_1 TEXT  -- Información adicional 1
otra_info_2 TEXT  -- Información adicional 2
```

---

### Tabla: `vacunas_registros`

**Registro de vacunas y análisis** 💉

```sql
CREATE TABLE vacunas_registros (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    tipo VARCHAR(100) NOT NULL,  -- anemia, influenza, encefalomielitis, etc.
    fecha DATE NOT NULL,
    veterinario VARCHAR(200),
    marca VARCHAR(200),
    frecuencia_dias INTEGER,  -- Cada cuántos días repetir
    proxima_fecha DATE,  -- Próxima aplicación calculada
    observaciones TEXT,
    aplicada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### **Tipos de Vacunas/Análisis:**
1. **anemia** - Análisis de anemia infecciosa
2. **influenza** - Vacuna contra influenza
3. **encefalomielitis** - Vacuna contra encefalomielitis
4. **rinoneumonitis** - Vacuna contra rinoneumonitis
5. **rabia** - Vacuna antirrábica
6. **otra_vacuna_1** - Otra vacuna personalizada 1
7. **otra_vacuna_2** - Otra vacuna personalizada 2
8. **perfil** - Perfil bioquímico

---

### Tabla: `revisiones_dentales`

**Revisiones dentales periódicas** 🦷

```sql
CREATE TABLE revisiones_dentales (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    fecha DATE NOT NULL,
    veterinario VARCHAR(200),
    observaciones TEXT,
    proxima_revision DATE,
    created_at TIMESTAMP
);
```

---

### Tabla: `estudios_medicos`

**Radiografías, ecografías y otros estudios** 🏥

```sql
CREATE TABLE estudios_medicos (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    tipo VARCHAR(100) NOT NULL,  -- radiografia, ecografia, resonancia, etc.
    fecha DATE NOT NULL,
    veterinario VARCHAR(200),
    zona_estudiada VARCHAR(200),  -- miembro anterior derecho, etc.
    diagnostico TEXT,
    archivo_url VARCHAR(500),  -- URL del archivo/imagen del estudio
    observaciones TEXT,
    created_at TIMESTAMP
);
```

**Tipos de estudios:**
- Radiografía
- Ecografía
- Resonancia magnética
- Tomografía
- Endoscopía
- Otros

---

### Tabla: `herrajes_registros`

**Historial de herrajes** 🔨

```sql
CREATE TABLE herrajes_registros (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    fecha DATE NOT NULL,
    herrador VARCHAR(200),
    observaciones TEXT,
    proximo_herraje DATE,  -- Fecha estimada próximo herraje
    costo DECIMAL(10,2),
    created_at TIMESTAMP
);
```

---

### Tabla: `antiparasitarios_registros`

**Aplicaciones de antiparasitarios** 💊

```sql
CREATE TABLE antiparasitarios_registros (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    fecha DATE NOT NULL,
    marca VARCHAR(200),
    drogas VARCHAR(500),  -- Ivermectina, Moxidectina, etc.
    dosis VARCHAR(100),
    proxima_aplicacion DATE,
    observaciones TEXT,
    created_at TIMESTAMP
);
```

---

## 📸 MÚLTIPLES FOTOS

### Tabla: `fotos_caballo`

**Actualizada con campo `es_principal`**

```sql
CREATE TABLE fotos_caballo (
    id UUID PRIMARY KEY,
    caballo_id UUID REFERENCES caballos(id),
    url VARCHAR(500) NOT NULL,
    descripcion VARCHAR(255),
    es_principal BOOLEAN DEFAULT FALSE,  -- ✅ NUEVO
    created_at TIMESTAMP
);
```

---

## 🔄 FLUJO DE CREACIÓN DE CABALLO

### Al crear un nuevo caballo:

1. **Validar campos obligatorios:**
   - ✅ Nombre
   - ✅ Número de chip (único)

2. **Generar QR Code automáticamente:**
   - El QR contendrá: ID del caballo + URL de ficha
   - Se guardará en campo `qr_code`
   - Ejemplo: `https://clubecuestre.com/caballos/{id}/qr`

3. **Crear registros iniciales:**
   - Perfil médico vacío
   - Plan de alimentación básico
   - Configuración de trabajo por defecto

4. **Subir fotos:**
   - Primera foto se marca como `es_principal = true`
   - Resto de fotos como adicionales
   - Sin límite de cantidad de fotos

---

## 📊 VISTAS DISPONIBLES

### Ficha Completa del Caballo

La ficha incluirá tabs organizados:

#### **1. Información General**
- Datos básicos
- Foto principal
- Estado actual
- QR Code

#### **2. Historial Médico** 🏥
- Vacunas (con alertas de vencimiento)
- Revisiones dentales
- Estudios médicos (radiografías, eco, etc.)
- Gráficos de vacunación

#### **3. Herrajes** 🔨
- Historial de herrajes
- Próximo herraje programado
- Herrador habitual

#### **4. Antiparasitarios** 💊
- Historial de aplicaciones
- Próxima aplicación
- Marca y droga utilizada

#### **5. Alimentación** 🌾
- Grano/Balanceado actual
- Suplementos
- Comidas por día
- Detalles especiales

#### **6. Manejo y Trabajo** 🏇
- Tipo de manejo (box, piquete, etc.)
- Días de trabajo/descanso
- Jinete asignado
- Tiempo de trabajo
- Tipos de trabajo (caminador, cuerda, manga, montado)

#### **7. Otros Detalles** 🎯
- Embocaduras
- Cuidados especiales
- Información adicional

#### **8. Galería de Fotos** 📸
- Todas las fotos del caballo
- Subir nuevas fotos
- Marcar foto principal

---

## 🔔 ALERTAS AUTOMÁTICAS

El sistema generará alertas automáticas para:

### Vacunas:
- 30 días antes del vencimiento
- 15 días antes
- 7 días antes
- El día del vencimiento

### Herrajes:
- Al cumplirse la fecha estimada del próximo herraje

### Antiparasitarios:
- Cuando se acerque la fecha de próxima aplicación

### Revisión Dental:
- Recordatorio anual o según frecuencia configurada

---

## 🎨 QR CODE - FUNCIONALIDAD

### Generación Automática:
```python
import qrcode
from io import BytesIO

def generar_qr_caballo(caballo_id):
    """
    Genera QR code único para el caballo
    """
    url = f"https://clubecuestre.com/caballos/{caballo_id}/ficha"

    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Guardar en cloud storage
    buffer = BytesIO()
    img.save(buffer, format='PNG')

    # Subir a Cloudinary o similar
    qr_url = upload_to_cloudinary(buffer.getvalue())

    return qr_url
```

### Uso del QR:
1. **Impresión:** Imprimir y pegar en el box del caballo
2. **Escaneo:** Al escanear con celular → abre ficha completa
3. **Acceso rápido:** Personal puede ver info sin buscar

---

## 📝 EJEMPLO DE DATOS COMPLETOS

```json
{
  "id": "uuid-123",
  "nombre": "Thor",
  "numero_chip": "982000123456789",
  "id_fomento": "FOM-2024-001",
  "edad": 8,
  "fecha_nacimiento": "2016-03-15",
  "pedigree": "Padre: Zeus | Madre: Atenea | Abuelo: Poseidón",
  "raza": "Pura Sangre",
  "sexo": "macho",
  "color": "alazán",
  "qr_code": "https://cloudinary.com/qr/thor-123.png",

  "alimentacion": {
    "grano_balanceado": "Royal Horse Mix Premium 5kg/día",
    "suplementos": "Vitamina E, Omega 3, Electrolitos",
    "cantidad_comidas_dia": 3,
    "detalles_alimentacion": "Primera comida 6am, segunda 12pm, tercera 6pm"
  },

  "manejo": {
    "tipo_manejo": "box_piquete",
    "box_asignado": "Box 12"
  },

  "trabajo": {
    "dias_trabajo": "L,M,X,J,V",
    "dias_descanso": "S,D",
    "jinete_asignado": "Juan Pérez",
    "tiempo_trabajo_diario": 90,
    "trabajo_config": {
      "caminador": true,
      "cuerda": false,
      "manga": true,
      "montado": true
    }
  },

  "detalles": {
    "embocadura_1": "Bocado partido con anillas",
    "embocadura_2": "Kimberwick",
    "cuidados_especiales": "Sensible a moscas, usar repelente. Artritis leve en miembro anterior izquierdo."
  },

  "vacunas": [
    {
      "tipo": "influenza",
      "fecha": "2024-10-15",
      "veterinario": "Dr. García",
      "marca": "Equilis Prequenza",
      "frecuencia_dias": 180,
      "proxima_fecha": "2025-04-13"
    },
    {
      "tipo": "rabia",
      "fecha": "2024-11-20",
      "veterinario": "Dr. García",
      "marca": "Raboral",
      "frecuencia_dias": 365,
      "proxima_fecha": "2025-11-20"
    }
  ],

  "herrajes": [
    {
      "fecha": "2026-01-10",
      "herrador": "Carlos Martínez",
      "observaciones": "Cambio completo de herradura. Ajuste de pinzas.",
      "proximo_herraje": "2026-03-10",
      "costo": 15000.00
    }
  ]
}
```

---

## 🎯 ESTADO ACTUAL

### ✅ Base de Datos - COMPLETADO
- ✅ **Migración aplicada exitosamente**
- ✅ **Todas las tablas creadas**
- ✅ **Nuevos ENUMs creados** (ManejoEnum, TipoTrabajoEnum)
- ✅ **Índices creados** en número_chip, id_fomento, nombre
- ✅ **Relaciones configuradas**

### ✅ Backend - COMPLETADO
- ✅ **Schemas Pydantic completos** - Todos los modelos (Caballo, Vacunas, Herrajes, Antiparasitarios, Revisiones Dentales, Estudios Médicos, Fotos)
- ✅ **Servicio de Caballo expandido** con toda la lógica de negocio:
  - ✅ Generación automática de QR Code al crear caballo
  - ✅ Validación de unicidad de numero_chip e id_fomento
  - ✅ Cálculo automático de próxima_fecha para vacunas
  - ✅ Manejo inteligente de foto principal (primera foto se marca automáticamente)
  - ✅ CRUD completo para todos los registros médicos
- ✅ **Endpoints API completos** - 40+ endpoints RESTful:
  - ✅ CRUD Caballo (crear, listar, obtener, actualizar, eliminar)
  - ✅ GET `/caballos/{id}/completo` - Caballo con todas sus relaciones
  - ✅ Fotos (listar, agregar, marcar principal, eliminar)
  - ✅ Vacunas (listar, registrar, actualizar, eliminar)
  - ✅ Herrajes (listar, registrar, actualizar, eliminar)
  - ✅ Antiparasitarios (listar, registrar, actualizar, eliminar)
  - ✅ Revisiones Dentales (listar, registrar, actualizar, eliminar)
  - ✅ Estudios Médicos (listar, registrar, actualizar, eliminar)
- ✅ **Dependencia qrcode[pil] instalada** en requirements.txt
- ✅ **Todo compilado y verificado** sin errores

### 📋 Próximos Pasos - Frontend

1. **Actualizar formulario de creación de caballo**
   - Agregar todos los campos nuevos (numero_chip, id_fomento, pedigree, etc.)
   - Sección de alimentación (grano_balanceado, suplementos, etc.)
   - Sección de manejo (tipo_manejo con select)
   - Sección de trabajo (dias_trabajo, jinete, tiempo, trabajo_config)
   - Otros detalles (embocaduras, cuidados especiales)

2. **Crear ficha completa del caballo con tabs**
   - Tab 1: Información General + QR Code
   - Tab 2: Historial Médico (Vacunas, Revisiones Dentales, Estudios)
   - Tab 3: Herrajes
   - Tab 4: Antiparasitarios
   - Tab 5: Alimentación
   - Tab 6: Manejo y Trabajo
   - Tab 7: Galería de Fotos

3. **Componentes específicos**
   - Visor de QR Code
   - Galería de fotos con upload múltiple
   - Calendario de vacunas con alertas de vencimiento
   - Timeline de herrajes
   - Gráficos de historial médico

---

## 📁 ARCHIVOS IMPLEMENTADOS

### Backend:

1. **`backend/app/schemas/caballo.py`** - Schemas Pydantic completos
   - CaballoBase, CaballoCreate, CaballoUpdate, CaballoSchema
   - FotoCaballo schemas
   - VacunaRegistro schemas
   - RevisionDental schemas
   - EstudioMedico schemas
   - HerrajeRegistro schemas
   - AntiparasitarioRegistro schemas
   - CaballoCompleto (con todas las relaciones)

2. **`backend/app/services/caballo_service.py`** - Servicio expandido
   - Funciones de utilidad (generar_qr_caballo, calcular_proxima_fecha)
   - CRUD Caballo con validaciones
   - Gestión de fotos con marca de principal
   - Gestión de vacunas con cálculo automático de fechas
   - Gestión de herrajes, antiparasitarios, revisiones dentales, estudios médicos

3. **`backend/app/api/v1/endpoints/caballos.py`** - Endpoints API
   - 40+ endpoints RESTful para todas las operaciones
   - Autenticación y autorización configurada
   - Validaciones y manejo de errores

4. **`backend/requirements.txt`** - Dependencias actualizadas
   - qrcode[pil]==8.2 agregado

---

## 🔐 AUTENTICACIÓN DE ENDPOINTS

Todos los endpoints requieren autenticación:
- **Lectura**: Requiere usuario activo (`get_current_active_user`)
- **Escritura**: Requiere rol admin (`require_admin`)
