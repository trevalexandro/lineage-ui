FROM node:21-alpine3.18

COPY . .
RUN npm run build .
RUN npm i -g serve
ENTRYPOINT exec serve -s build -l SERVE_ENDPOINT -n