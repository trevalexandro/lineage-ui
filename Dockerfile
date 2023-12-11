FROM node:21-alpine3.18

COPY . .
RUN npm ci
ENV NODE_ENV=production
RUN npm run build .
RUN npm i -g serve
ENTRYPOINT exec serve -s build -l 80