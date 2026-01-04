# Despliegue en Coolify

## Requisitos Previos
- Servidor Coolify en `192.168.68.200`
- Dispositivo Awair en `192.168.68.103`
- Ambos en la misma red local

## Opción 1: Despliegue Simple con Nginx (Recomendado)

### Paso 1: Crear Dockerfile

Crea un archivo `Dockerfile` en la raíz del proyecto:

```dockerfile
FROM nginx:alpine

# Copiar archivos estáticos
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Paso 2: Crear repositorio Git

```bash
cd "/Users/ichalez/Documents/Dev/Pruebas/Antigravity 01"

# Inicializar Git
git init

# Crear .gitignore
echo "server.py
package.json
node_modules/
.DS_Store" > .gitignore

# Añadir archivos
git add index.html style.css app.js Dockerfile README.md

# Commit inicial
git commit -m "Initial commit - Awair Dashboard"
```

### Paso 3: Subir a GitHub/GitLab

```bash
# Opción A: GitHub
gh repo create awair-dashboard --private --source=. --remote=origin --push

# Opción B: Manual
# 1. Crea un repositorio en GitHub/GitLab
# 2. Añade el remote:
git remote add origin https://github.com/TU_USUARIO/awair-dashboard.git
git branch -M main
git push -u origin main
```

### Paso 4: Configurar en Coolify

1. **Accede a Coolify**: `http://192.168.68.200`

2. **Crear nuevo proyecto**:
   - Click en "New Resource"
   - Selecciona "Application"
   - Elige "Public Repository" o "Private Repository"

3. **Configurar repositorio**:
   - Repository URL: `https://github.com/TU_USUARIO/awair-dashboard.git`
   - Branch: `main`
   - Build Pack: `Dockerfile`

4. **Configurar dominio**:
   - Domain: `awair.local` o `awair.192.168.68.200.sslip.io`
   - O usa la IP directamente: `192.168.68.200`

5. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine el build

6. **Acceder**:
   - `http://192.168.68.200` (o el dominio configurado)
   - Desde cualquier dispositivo en tu red

---

## Opción 2: Despliegue con Docker Compose

### Paso 1: Crear docker-compose.yml

```yaml
version: '3.8'

services:
  awair-dashboard:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    container_name: awair-dashboard
```

### Paso 2: Subir a repositorio

```bash
git add docker-compose.yml
git commit -m "Add docker-compose configuration"
git push
```

### Paso 3: En Coolify

- Selecciona "Docker Compose" como tipo de aplicación
- Coolify detectará automáticamente el `docker-compose.yml`
- Deploy

---

## Opción 3: Despliegue Estático Simple

Si no quieres usar Docker:

### Paso 1: Crear configuración Nginx

Crea `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache estático
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Paso 2: Actualizar Dockerfile

```dockerfile
FROM nginx:alpine

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Verificación Post-Despliegue

1. **Verifica que el contenedor está corriendo**:
   - En Coolify, ve a tu aplicación
   - Revisa los logs
   - Estado debe ser "Running"

2. **Prueba el acceso**:
   - Abre `http://192.168.68.200` (o tu dominio)
   - Verifica que carga el dashboard
   - Comprueba que se conecta al dispositivo Awair

3. **Verifica la conectividad**:
   - El dashboard debe mostrar datos del Awair en `192.168.68.103`
   - Si no funciona, revisa que ambos estén en la misma red

---

## Troubleshooting

### Error: No se conecta al dispositivo Awair

**Problema**: CORS o red diferente

**Solución**: Asegúrate de que:
- El servidor Coolify (`192.168.68.200`) está en la misma red que el Awair (`192.168.68.103`)
- El navegador puede acceder a ambas IPs

### Error: Build falla

**Solución**:
```bash
# Prueba el build localmente primero
docker build -t awair-dashboard .
docker run -p 8080:80 awair-dashboard

# Accede a http://localhost:8080
```

### Actualizar el despliegue

```bash
# Hacer cambios en el código
git add .
git commit -m "Update dashboard"
git push

# En Coolify, click en "Redeploy"
```

---

## Acceso desde Dispositivos Móviles

Una vez desplegado en Coolify:

1. **Desde tu iPhone/iPad/Android**:
   - Conéctate a la misma WiFi
   - Abre Safari/Chrome
   - Ve a `http://192.168.68.200`

2. **Añadir a pantalla de inicio** (iOS):
   - Abre el dashboard en Safari
   - Toca el botón "Compartir"
   - Selecciona "Añadir a pantalla de inicio"
   - ¡Ahora tienes una app nativa!

3. **Añadir a pantalla de inicio** (Android):
   - Abre el dashboard en Chrome
   - Menú → "Añadir a pantalla de inicio"

---

## Próximos Pasos Opcionales

1. **HTTPS con certificado local**:
   - Configura un certificado autofirmado en Coolify
   - O usa Let's Encrypt si tienes dominio público

2. **Dominio local personalizado**:
   - Configura DNS local: `awair.local`
   - Edita `/etc/hosts` en tus dispositivos

3. **Autenticación**:
   - Añade autenticación básica en Nginx
   - O usa Authelia/Authentik con Coolify

4. **Monitoreo**:
   - Configura alertas en Coolify
   - Uptime monitoring
