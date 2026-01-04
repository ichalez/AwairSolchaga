FROM nginx:alpine

# Copiar archivos estáticos al directorio de Nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
COPY nginx.conf /etc/nginx/conf.d/default.conf
