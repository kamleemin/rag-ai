FROM node:20-slim
RUN apt-get update && apt-get install -y curl \
 && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package.json package-lock.json* ./
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
RUN npm ci --workspace=@rag-ai/server --workspace=@rag-ai/shared --production=false

COPY shared shared
COPY server server
RUN npm run build --workspace=@rag-ai/shared && npm run build --workspace=@rag-ai/server

WORKDIR /app/server
CMD ["node", "dist/server.js"]
