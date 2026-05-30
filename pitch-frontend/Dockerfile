FROM node:24.10.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# serve using nginx

FROM nginx:alpine

RUN rm  -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Expose port 80 for Nginx
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
