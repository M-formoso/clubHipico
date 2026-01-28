# Skill: Implementar flujo de autenticación completo

## Componentes del sistema de auth

1. **Hashing de passwords** (passlib)
2. **JWT tokens** (access + refresh)
3. **Dependencies FastAPI** (get_current_user)
4. **Permisos por rol**
5. **Frontend: interceptor Axios**
6. **Almacenamiento de tokens**

## Backend - Implementación completa

### 1. Configuración (core/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"

settings = Settings()
```

### 2. Utilidades de seguridad (core/security.py)

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que el password coincida con el hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera hash del password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Crea JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """Decodifica y valida un JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 3. Dependencies (core/deps.py)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.usuario import Usuario, RolEnum
from uuid import UUID

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Obtiene el usuario actual desde el JWT."""
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    user = db.query(Usuario).filter(Usuario.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    return user

async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """Verifica que el usuario esté activo."""
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user

async def require_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """Requiere rol de administrador."""
    if current_user.rol not in [RolEnum.ADMIN, RolEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user
```

### 4. Endpoint de Login (api/v1/endpoints/auth.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.models.usuario import Usuario
from app.schemas.auth import Token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login de usuario."""
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

## Frontend - Implementación

### 1. Axios Interceptor (services/api.ts)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - manejar 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Auth Store (stores/authStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  rol: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 3. Login Page (pages/auth/LoginPage.tsx)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data.email, data.password);
      login(response.user, response.access_token, response.refresh_token);
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error al iniciar sesión',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Club Ecuestre
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="tu@email.com"
              className="border-gray-300 focus:border-beige-500 focus:ring-beige-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="border-gray-300 focus:border-beige-500 focus:ring-beige-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-beige-500 hover:bg-beige-600 text-white"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

## Checklist

- [ ] Backend: Security utils implementadas
- [ ] Backend: Dependencies de autenticación
- [ ] Backend: Endpoints de login/refresh
- [ ] Frontend: Axios interceptor configurado
- [ ] Frontend: Auth store con Zustand
- [ ] Frontend: Página de login
- [ ] Tokens almacenados en localStorage
- [ ] Refresh token automático en 401
- [ ] Protected routes implementadas
- [ ] Colores beige y gris en UI de auth
