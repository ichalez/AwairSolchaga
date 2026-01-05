# Guía de Despliegue - Localizador Fotográfico Cederna

## 📋 Descripción

Aplicación web estática para localizar fotografías en un mapa según sus metadatos EXIF GPS y generar fichas imprimibles.

## 🗂️ Estructura del Proyecto

```
Antigravity 01/
├── index.html              # Página principal
├── style.css               # Estilos (incluye estilos de impresión)
├── app.js                  # Lógica de la aplicación
├── leaflet.js              # Librería de mapas
├── leaflet.css             # Estilos de Leaflet
├── exifreader.js           # Librería para leer EXIF
├── dom-to-image.min.js     # Librería de captura (no usada actualmente)
├── marker-icon.png         # Icono del marcador del mapa
├── marker-icon-2x.png      # Icono retina
├── marker-shadow.png       # Sombra del marcador
└── DEPLOY.md               # Este archivo
```

## 🚀 Opciones de Despliegue

### Opción 1: Uso Local (Sin servidor)

**Ventajas:** Inmediato, sin configuración
**Limitaciones:** Funciona pero con restricciones de seguridad del navegador

1. Simplemente abre `index.html` en tu navegador
2. Arrastra una foto con datos GPS
3. Usa "Imprimir / Guardar PDF" para generar la ficha

### Opción 2: Servidor Local Simple

**Recomendado para desarrollo y uso regular**

#### Con Python (Mac/Linux):
```bash
# Python 3
cd "/Users/ichalez/Documents/Dev/Pruebas/Antigravity 01"
python3 -m http.server 8000

# Luego abre: http://localhost:8000
```

#### Con Node.js:
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
cd "/Users/ichalez/Documents/Dev/Pruebas/Antigravity 01"
http-server -p 8000

# Luego abre: http://localhost:8000
```

#### Con PHP:
```bash
cd "/Users/ichalez/Documents/Dev/Pruebas/Antigravity 01"
php -S localhost:8000

# Luego abre: http://localhost:8000
```

### Opción 3: Hosting Web Estático

**Para compartir con otros usuarios**

#### GitHub Pages (Gratis):
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings → Pages
4. Selecciona la rama `main` como fuente
5. Tu app estará en: `https://tu-usuario.github.io/nombre-repo`

#### Netlify (Gratis):
1. Arrastra la carpeta completa a [netlify.com/drop](https://app.netlify.com/drop)
2. Obtendrás una URL pública inmediatamente

#### Vercel (Gratis):
```bash
npm install -g vercel
cd "/Users/ichalez/Documents/Dev/Pruebas/Antigravity 01"
vercel
```

## 🔧 Configuración

### Requisitos del Sistema
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (solo para cargar tiles del mapa)

### Dependencias Incluidas
Todas las librerías están descargadas localmente:
- ✅ Leaflet 1.9.4
- ✅ ExifReader (última versión)
- ✅ Esri World Imagery (tiles satelitales)
- ✅ Esri Reference Layer (etiquetas de lugares)

## 📝 Uso de la Aplicación

1. **Cargar Foto:** Arrastra una imagen con datos GPS o haz clic para seleccionar
2. **Ver Información:** La app mostrará:
   - Vista previa de la foto
   - Fecha de captura
   - Ubicación (pueblo/ciudad más cercano)
   - Mapa satélite con etiquetas
3. **Generar Ficha:** Haz clic en "Imprimir / Guardar PDF"
4. **Guardar:** En el diálogo de impresión, selecciona "Guardar como PDF"

## 🌐 Acceso a Internet

La aplicación necesita conexión a internet para:
- Cargar tiles del mapa satélite (Esri)
- Cargar etiquetas de lugares
- Geocodificación inversa (obtener nombre del pueblo)

**Sin internet:** La app funcionará pero el mapa no se mostrará.

## 🔒 Privacidad

- ✅ Todo el procesamiento es local (en el navegador)
- ✅ Las fotos NO se suben a ningún servidor
- ✅ Los metadatos se leen localmente con ExifReader
- ⚠️ Solo se hace una petición externa para obtener el nombre del lugar (Nominatim OSM)

## 🐛 Solución de Problemas

### El mapa no carga
- Verifica tu conexión a internet
- Comprueba que no haya bloqueadores de contenido activos

### La foto no tiene ubicación
- Asegúrate de que la foto tenga datos GPS (tomada con smartphone con GPS activo)
- Algunas apps eliminan los metadatos al editar fotos

### El PDF no se genera
- Usa un navegador moderno actualizado
- Asegúrate de que el mapa haya cargado completamente antes de imprimir

### Los iconos del mapa no aparecen
- Verifica que los archivos `marker-icon*.png` estén en la misma carpeta que `index.html`

## 📱 Compatibilidad

| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome    | 90+            | ✅ Completo |
| Firefox   | 88+            | ✅ Completo |
| Safari    | 14+            | ✅ Completo |
| Edge      | 90+            | ✅ Completo |

## 🔄 Actualizaciones Futuras

Posibles mejoras:
- [ ] Soporte para múltiples fotos
- [ ] Exportación directa a PNG (requiere servidor)
- [ ] Modo offline completo con tiles precargados
- [ ] Integración con API de IA real para análisis de imágenes
- [ ] Soporte para otros formatos de metadatos

## 📞 Soporte

Para problemas o sugerencias, contacta al equipo de desarrollo del Proyecto Cederna.

---

**Versión:** 1.0  
**Última actualización:** Diciembre 2025  
**Desarrollado para:** Proyecto Cederna
