FROM node:25-alpine

WORKDIR /app
COPY ./backend/ .

RUN npm install
RUN npm run build

EXPOSE 8787
CMD ["npm", "run", "start"]

