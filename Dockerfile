# --- Estágio 1: Build do Frontend (React + Vite) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Estágio 2: Build do Backend (TypeScript) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:server

# --- Estágio 3: Imagem Final de Produção ---
FROM node:20-alpine
WORKDIR /app

# Copia as dependências de produção do estágio do backend
COPY --from=backend-builder /app/package*.json ./
RUN npm install --production

# Copia o backend compilado
COPY --from=backend-builder /app/dist-server ./dist-server

# Copia o frontend compilado para uma pasta pública dentro do backend
COPY --from=frontend-builder /app/dist ./dist-server/public

# Expõe a porta que o servidor Express está ouvindo
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "./dist-server/server.js"]