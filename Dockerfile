FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/fb-autoreply-frontend/browser ./dist
ENV PORT=3000
EXPOSE $PORT
CMD serve -s dist -l $PORT
