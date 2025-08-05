# backend.Dockerfile

# --- Estágio de Build (Compila o TypeScript) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:server

# --- Estágio Final de Produção ---
FROM node:20-alpine
WORKDIR /app

# Copia as dependências de produção do estágio de build
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copia o backend compilado
COPY --from=builder /app/dist-server ./dist-server

# Expõe a porta que o servidor Express está ouvindo
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "./dist-server/server.js"]