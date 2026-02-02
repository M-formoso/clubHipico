# Configuración de Servicios Externos

Este documento explica cómo configurar Cloudinary y SMTP para el Sistema Club Hípico.

## 📸 Cloudinary (Upload de Imágenes)

### Opción 1: Configuración Real (Producción)

1. **Crear cuenta en Cloudinary**
   - Ir a: https://cloudinary.com/users/register/free
   - Crear cuenta gratuita (hasta 25GB y 25,000 transformaciones/mes)

2. **Obtener credenciales**
   - Una vez logueado, ir al Dashboard
   - Encontrarás tus credenciales en la sección "Account Details":
     - Cloud Name
     - API Key
     - API Secret

3. **Actualizar el archivo `.env`**
   ```bash
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

### Opción 2: Desarrollo Local Sin Cloudinary

Si no quieres usar Cloudinary en desarrollo, puedes guardar imágenes localmente:

1. **Modificar `backend/app/core/config.py`**
   ```python
   # Agregar al final de la clase Settings:
   USE_LOCAL_STORAGE: bool = True  # Cambiar a False en producción con Cloudinary
   LOCAL_UPLOAD_DIR: str = "uploads"
   ```

2. **Las imágenes se guardarán en `backend/uploads/`**

---

## 📧 SMTP (Envío de Emails)

### Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar verificación en 2 pasos**
   - Ir a: https://myaccount.google.com/security
   - Activar la verificación en 2 pasos

2. **Crear contraseña de aplicación**
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro (nombre personalizado)"
   - Nombrar: "Club Ecuestre"
   - Copiar la contraseña de 16 dígitos generada

3. **Actualizar el archivo `.env`**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASSWORD=contraseña_aplicacion_de_16_digitos
   EMAIL_FROM=tu_email@gmail.com
   EMAIL_FROM_NAME=Club Ecuestre
   ```

### Opción 2: Mailtrap (Recomendado para testing)

Mailtrap captura todos los emails enviados sin enviarlos realmente.

1. **Crear cuenta en Mailtrap**
   - Ir a: https://mailtrap.io/register/signup
   - Crear cuenta gratuita

2. **Obtener credenciales SMTP**
   - Ir a "Email Testing" > "Inboxes" > "My Inbox"
   - Copiar las credenciales SMTP

3. **Actualizar el archivo `.env`**
   ```bash
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=tu_usuario_mailtrap
   SMTP_PASSWORD=tu_password_mailtrap
   EMAIL_FROM=noreply@clubecuestre.com
   EMAIL_FROM_NAME=Club Ecuestre
   ```

### Opción 3: SendGrid (Recomendado para producción)

1. **Crear cuenta en SendGrid**
   - Ir a: https://signup.sendgrid.com/
   - Plan gratuito: 100 emails/día

2. **Crear API Key**
   - Ir a: Settings > API Keys > Create API Key
   - Seleccionar "Full Access"
   - Copiar la API Key

3. **Actualizar el archivo `.env`**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=tu_api_key_de_sendgrid
   EMAIL_FROM=tu_email_verificado@tudominio.com
   EMAIL_FROM_NAME=Club Ecuestre
   ```

### Opción 4: Desarrollo Sin Email Real

Si no quieres configurar SMTP en desarrollo:

1. **Usar logging en lugar de envío real**
   - Los emails se imprimirán en la consola del backend
   - Útil para desarrollo y debugging

2. **Modificar `backend/app/core/config.py`**
   ```python
   # Agregar al final de la clase Settings:
   SEND_REAL_EMAILS: bool = False  # Cambiar a True en producción
   ```

---

## ✅ Verificar Configuración

### Test de Cloudinary

```python
# Ejecutar en terminal desde backend/
python3 << EOF
from app.core.config import settings
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

try:
    # Test upload
    result = cloudinary.uploader.upload(
        "https://via.placeholder.com/150",
        folder="test"
    )
    print("✅ Cloudinary configurado correctamente!")
    print(f"URL de prueba: {result['secure_url']}")
except Exception as e:
    print(f"❌ Error en Cloudinary: {e}")
EOF
```

### Test de SMTP

```python
# Ejecutar en terminal desde backend/
python3 << EOF
from app.core.config import settings
import aiosmtplib
import asyncio
from email.mime.text import MIMEText

async def test_email():
    try:
        message = MIMEText("Test email desde Club Ecuestre")
        message["Subject"] = "Test SMTP"
        message["From"] = settings.EMAIL_FROM
        message["To"] = settings.SMTP_USER

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True
        )
        print("✅ SMTP configurado correctamente!")
    except Exception as e:
        print(f"❌ Error en SMTP: {e}")

asyncio.run(test_email())
EOF
```

---

## 🚀 Configuración Recomendada por Ambiente

### Desarrollo Local
```bash
# Cloudinary: Opción 2 (Local Storage)
USE_LOCAL_STORAGE=true

# Email: Opción 4 (Console Logging) o Mailtrap
SEND_REAL_EMAILS=false
```

### Testing/Staging
```bash
# Cloudinary: Opción 1 (Cuenta de desarrollo)
CLOUDINARY_CLOUD_NAME=club-dev
# ...

# Email: Mailtrap o Gmail
SMTP_HOST=sandbox.smtp.mailtrap.io
# ...
```

### Producción
```bash
# Cloudinary: Opción 1 (Cuenta de producción)
CLOUDINARY_CLOUD_NAME=club-prod
# ...

# Email: SendGrid o servicio profesional
SMTP_HOST=smtp.sendgrid.net
# ...
```

---

## 📝 Notas Importantes

### Cloudinary
- **Gratis**: 25GB almacenamiento, 25,000 transformaciones/mes
- **Formatos soportados**: JPG, PNG, GIF, WebP, PDF
- **Transformaciones**: Redimensionamiento, recorte, optimización automática
- **CDN global**: Carga rápida de imágenes desde cualquier ubicación

### SMTP/Email
- **Gmail**: Límite de 500 emails/día
- **Mailtrap**: Solo para testing, no envía emails reales
- **SendGrid**: 100 emails/día gratis, escalable
- **Seguridad**: Nunca subir passwords al repositorio, usar variables de entorno

### Seguridad
1. **NUNCA** commitear el archivo `.env` con credenciales reales
2. Usar `.env.example` como template sin credenciales
3. En producción, usar variables de entorno del servidor
4. Rotar secrets y API keys periódicamente

---

## 🆘 Troubleshooting

### Cloudinary - "Invalid credentials"
- Verificar que copiaste correctamente las credenciales
- Revisar que no haya espacios al inicio/final
- Cloud Name es case-sensitive

### SMTP - "Authentication failed"
- Gmail: Verificar que creaste contraseña de aplicación
- Verificar usuario y contraseña sin espacios
- Revisar que el puerto sea 587 (TLS) o 465 (SSL)

### SMTP - "Connection timeout"
- Verificar firewall/antivirus
- Algunos ISPs bloquean puerto 587, usar VPN o puerto 465
- Verificar que `SMTP_HOST` sea correcto

### Emails no llegan
- Revisar carpeta de spam
- Verificar que `EMAIL_FROM` sea un email válido
- En Gmail, verificar "Aplicaciones menos seguras" si no usas contraseña de app

---

## 📚 Recursos

- [Documentación Cloudinary](https://cloudinary.com/documentation)
- [Documentación SendGrid](https://docs.sendgrid.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Mailtrap Docs](https://mailtrap.io/docs/)
