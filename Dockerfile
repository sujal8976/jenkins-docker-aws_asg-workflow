FROM node:iron-alpine3.22 AS frontend-build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:iron-alpine3.22 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:iron-alpine3.22
WORKDIR /app
COPY --from=frontend-build /app/frontend/dist/ ./public
COPY --from=backend-build /app/backend/dist ./dist
CMD ["node", "dist/index.js"]
