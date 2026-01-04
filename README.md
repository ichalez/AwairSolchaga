# Cómo usar el Awair Dashboard (Local API)

## Inicio Rápido

1. **Habilita la Local API en tu dispositivo Awair**:
   - Abre la app Awair Home
   - Ve a Awair+ → Awair APIs Beta → Local API
   - Activa la función

2. **Encuentra la IP de tu dispositivo**:
   - Revisa la lista de dispositivos conectados en tu router
   - O usa mDNS: `http://awair-elem-XXXXXX.local`

3. **Actualiza la IP en el código** (si es diferente a 192.168.68.103):
   - Edita `app.js` línea 55: `const DEVICE_IP = 'TU_IP_AQUI';`

4. **Abre el dashboard**:
   - Simplemente abre `index.html` en tu navegador
   - ¡Los datos se cargan automáticamente!

## Características
- ✅ Datos en tiempo real cada 10 segundos
- ✅ Sin necesidad de internet ni tokens
- ✅ Funciona solo en tu red local
- ✅ Gráficos históricos acumulados localmente
