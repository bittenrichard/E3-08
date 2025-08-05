# frontend.Dockerfile

# --- Estágio de Build (Cria os arquivos estáticos do React) ---
FROM node:20 AS builder
WORKDIR /app

# Argumento que será recebido do comando de build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Estágio Final de Produção (Serve os arquivos com Nginx) ---
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove o conteúdo padrão do Nginx
RUN rm -rf ./*

# Copia os arquivos de build do estágio anterior
COPY --from=builder /app/dist .

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]