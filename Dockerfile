FROM node:20-alpine

WORKDIR /app
COPY ./backend/ .

RUN npm install -g wrangler
RUN npm install

EXPOSE 8787
CMD ["wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]

