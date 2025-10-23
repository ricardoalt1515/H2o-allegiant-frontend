# 🚀 Frontend Deployment Guide - AWS Amplify

Guía paso a paso para desplegar el frontend de H2O Allegiant en AWS Amplify.

---

## 📋 Pre-requisitos

Antes de empezar, asegúrate de tener:

- ✅ Backend desplegado en AWS ECS (con URL del ALB)
- ✅ Código en repositorio de GitHub
- ✅ Acceso a AWS Console con permisos de Amplify
- ✅ URL del ALB del backend (ej: `http://h2o-xxx.us-east-1.elb.amazonaws.com`)

---

## 🎯 PASO 1: Preparar Repositorio

### 1.1 Verificar archivos creados

Los siguientes archivos ya fueron creados en tu repositorio:

```
frontend/
├── amplify.yml           # ✅ Configuración de build
├── .amplifyignore        # ✅ Exclusiones de deploy
├── next.config.mjs       # ✅ Optimizado para producción
└── DEPLOYMENT.md         # ✅ Esta guía
```

### 1.2 Commit y Push

```bash
# Ir a la carpeta frontend (tu repositorio Git está aquí)
cd /Users/ricardoaltamirano/Developer/h2o-allegiant/frontend

# Ver archivos nuevos
git status

# Agregar archivos nuevos
git add amplify.yml .amplifyignore next.config.mjs DEPLOYMENT.md

# Commit
git commit -m "feat: add AWS Amplify deployment configuration

- Add amplify.yml with optimized build settings
- Add .amplifyignore to reduce deployment size
- Update next.config.mjs with production optimizations
- Add deployment documentation"

# Push a GitHub
git push origin main
```

---

## 🌐 PASO 2: Crear Aplicación en AWS Amplify

### 2.1 Acceder a AWS Amplify Console

1. Ir a: https://console.aws.amazon.com/amplify/
2. Región: **us-east-1** (misma que el backend)
3. Click en **"New app"** → **"Host web app"**

### 2.2 Conectar Repositorio GitHub

1. **Source code provider:** Seleccionar **GitHub**
2. Click en **"Connect GitHub"**
3. Autorizar AWS Amplify en GitHub (si es la primera vez)
4. **Seleccionar repositorio:** `H2o-allegiant-frontend`
5. **Branch:** `main`
6. Click **"Next"**

### 2.3 Configurar App Settings

**App name:** `h2o-allegiant-frontend`

**⚠️ IMPORTANTE - Monorepo detection:**
- **NO marcar "Monorepo"** ❌
- **App root directory:** Dejar vacío

**¿Por qué NO es monorepo?**
Tu repositorio de GitHub solo contiene el código del frontend.
El backend está en un repositorio separado.

**Build settings:**
- Amplify detectará automáticamente `amplify.yml`
- Verificar que muestre:
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm ci --legacy-peer-deps
  ```

**Advanced settings:**
- **Node version:** `20`
- Click **"Next"**

---

## 🔐 PASO 3: Configurar Variables de Entorno

**IMPORTANTE:** Antes de hacer el deploy, debes configurar estas variables.

### 3.1 En la pantalla de "Review" o después del primer deploy

1. Ir a **"Environment variables"** (en el sidebar izquierdo)
2. Click **"Manage variables"**
3. Agregar las siguientes variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://TU-ALB-URL/api/v1` | URL del backend (reemplazar TU-ALB-URL) |
| `NEXT_PUBLIC_DISABLE_API` | `0` | Habilitar llamadas al API |
| `NEXT_PUBLIC_ENABLE_AI_FEATURES` | `true` | Habilitar features de AI |
| `NEXT_PUBLIC_ENABLE_FILE_UPLOAD` | `true` | Habilitar subida de archivos |
| `NEXT_PUBLIC_ENABLE_SMART_IMPORT` | `true` | Habilitar importación inteligente |
| `NEXT_PUBLIC_DEBUG` | `false` | Deshabilitar debug en producción |

**Ejemplo de `NEXT_PUBLIC_API_BASE_URL`:**
```
http://h2o-allegiant-prod-alb-1234567890.us-east-1.elb.amazonaws.com/api/v1
```

4. Click **"Save"**

---

## 🏗️ PASO 4: Iniciar Deploy

### 4.1 Primera Compilación

1. Review todas las configuraciones
2. Click **"Save and deploy"**
3. Amplify comenzará el build automáticamente

### 4.2 Monitorear Build

El build tiene 3 fases:

1. **Provision** (~1 min) - Preparar servidor de build
2. **Build** (~5-10 min) - Instalar deps y compilar Next.js
3. **Deploy** (~2 min) - Subir a CDN y activar

**Logs en tiempo real:**
- Click en el build actual (barra naranja)
- Ver logs de cada fase
- Buscar errores si algo falla

### 4.3 Verificar Build Exitoso

✅ Mensaje esperado:
```
✅ Build completed successfully
Deployment complete!
```

🎉 Tu app estará disponible en:
```
https://main.dxxxxxxxxxxxxx.amplifyapp.com
```

---

## 🔗 PASO 5: Configurar CORS en Backend

Una vez tengas la URL de Amplify, debes actualizar el backend para permitir requests desde el frontend.

### 5.1 Obtener URL de Amplify

En Amplify Console:
- Copiar la URL completa (ej: `https://main.d2abc123xyz.amplifyapp.com`)

### 5.2 Actualizar CORS en Backend (ECS)

**Opción A: Via AWS Console**

1. Ir a: **ECS** → **Clusters** → `h2o-allegiant-prod-cluster`
2. Click en **Services** → `h2o-allegiant-prod-backend`
3. Click **"Update service"**
4. En **Environment variables override**, actualizar:
   ```
   CORS_ORIGINS=https://main.d2abc123xyz.amplifyapp.com
   ```
5. Click **"Update"**
6. Esperar que el servicio se reinicie (~2-3 min)

**Opción B: Via Terraform**

```hcl
# infrastructure/terraform/prod/ecs.tf
# En el container_definitions, actualizar:

environment = [
  {
    name  = "CORS_ORIGINS"
    value = "https://main.d2abc123xyz.amplifyapp.com"
  },
  # ... otras variables
]
```

Luego:
```bash
cd infrastructure/terraform/prod
terraform apply
```

---

## ✅ PASO 6: Testing y Validación

### 6.1 Smoke Testing

1. **Abrir la app:** `https://main.dxxxxx.amplifyapp.com`
2. **Verificar carga inicial:** Debe cargar en <3 segundos
3. **Test de navegación:** Ir a diferentes páginas

### 6.2 Testing de Integración Backend

1. **Registro de usuario:**
   - Ir a `/register`
   - Crear cuenta nueva
   - Verificar que se crea en DB

2. **Login:**
   - Usar credenciales creadas
   - Verificar que redirige a dashboard

3. **Crear proyecto:**
   - Dashboard → New Project
   - Verificar que se guarda

4. **Generar propuesta (AI):**
   - Dentro de un proyecto
   - Generate Proposal
   - Verificar que llama al backend

### 6.3 Verificar CORS

Abrir DevTools (F12) → Console:

✅ **Correcto:** Requests a backend funcionan sin errores
❌ **Error CORS:** Ver mensaje:
```
Access to fetch at 'http://xxx' from origin 'https://xxx'
has been blocked by CORS policy
```

**Solución:** Verificar que configuraste CORS correctamente en Paso 5.

### 6.4 Performance Testing

1. Abrir DevTools → **Lighthouse** tab
2. Click **"Generate report"**
3. Verificar scores:
   - **Performance:** >85 (objetivo: >90)
   - **Accessibility:** >90
   - **Best Practices:** >90
   - **SEO:** >80

---

## 🔄 PASO 7: Configurar Auto-Deploy (CI/CD)

### 7.1 Auto-Deploy está habilitado por defecto

Cada push a `main` triggeará automáticamente un nuevo deploy:

```bash
# Hacer cambios en código
git add .
git commit -m "feat: add new feature"
git push origin main

# Amplify detecta el push y despliega automáticamente
```

### 7.2 Ver Historial de Deploys

En Amplify Console:
- Sidebar → **"App settings"** → **"Build history"**
- Ver todos los deploys anteriores
- Hacer rollback si es necesario

### 7.3 Configurar Branch Previews (Opcional)

Para testing de PRs antes de merge:

1. Amplify Console → **"App settings"** → **"Branch management"**
2. Click **"Add branch"**
3. Seleccionar branch (ej: `develop`, `staging`)
4. Cada PR tendrá su propia URL preview

---

## 📊 Monitoreo y Logs

### Monitoreo

1. **Amplify Metrics:**
   - Requests por minuto
   - Errores 4xx/5xx
   - Data transfer

2. **CloudWatch:**
   - Logs de build
   - Errores de runtime

### Alarmas Recomendadas

Configurar SNS alerts para:
- Build failures
- Deploy failures
- High error rate (>5% de requests con 5xx)

---

## 🐛 Troubleshooting

### Build falla con "Environment variable not set"

**Causa:** `NEXT_PUBLIC_API_BASE_URL` no configurado

**Solución:**
1. Amplify Console → Environment variables
2. Agregar todas las vars del Paso 3
3. Redeploy

### Build falla con "Cannot find module"

**Causa:** Dependencia faltante o error en package.json

**Solución:**
```bash
# Local: verificar que build funciona
npm ci
npm run build

# Si funciona local, revisar logs de Amplify
```

### App carga pero muestra "Failed to fetch"

**Causa:** CORS no configurado o backend caído

**Solución:**
1. Verificar backend está corriendo (ECS tasks)
2. Verificar CORS_ORIGINS en backend
3. Verificar URL del backend en env vars

### Imágenes no cargan

**Causa:** Dominio no permitido en next.config.mjs

**Solución:**
Ya está configurado en `next.config.mjs` para permitir `*.elb.amazonaws.com`

---

## 🎯 Costos Estimados

### AWS Amplify Pricing (Región us-east-1)

**Build:**
- $0.01 por minuto de build
- Build típico: 8-10 minutos
- Costo por deploy: ~$0.10

**Hosting:**
- Primeros 5 GB almacenados: Gratis
- Primeros 15 GB servidos: Gratis
- $0.15 por GB adicional

**Estimado mensual para MVP:**
- 10 deploys/mes: $1.00
- <5 GB storage: $0
- <15 GB data transfer: $0
- **Total: $1-5/mes**

---

## 📝 Siguiente Pasos Opcionales

### 1. Dominio Personalizado

Configurar `www.h2o-allegiant.com` en vez de `*.amplifyapp.com`:

1. Amplify Console → **Domain management**
2. Click **"Add domain"**
3. Ingresar tu dominio
4. Seguir wizard para configurar DNS

### 2. HTTPS en Backend (ALB)

Actualmente el backend usa HTTP. Para producción:

1. Obtener certificado SSL (AWS Certificate Manager - gratis)
2. Configurar HTTPS listener en ALB
3. Actualizar `NEXT_PUBLIC_API_BASE_URL` a usar `https://`

### 3. Monitoring Avanzado

- Sentry para error tracking
- Google Analytics / Vercel Analytics
- CloudWatch dashboards personalizados

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] Frontend accesible en URL de Amplify
- [ ] Login/Register funcionan
- [ ] Proyectos se pueden crear
- [ ] Propuestas AI se generan correctamente
- [ ] CORS configurado (sin errores en console)
- [ ] Lighthouse score >85
- [ ] Auto-deploy funciona (push → deploy automático)
- [ ] Variables de entorno configuradas
- [ ] Backend permite requests desde Amplify domain

---

## 📚 Referencias

- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Next.js on Amplify](https://docs.amplify.aws/guides/hosting/nextjs/)
- [Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)

---

**Deployment Guide v1.0**
Última actualización: Octubre 2025
