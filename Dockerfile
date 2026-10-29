FROM node:24.22.1-alpine AS build

RUN npm install --global pnpm@10

WORKDIR /app

COPY package.json \
     pnpm-lock.yaml \
     ./

RUN pnpm i --prod

FROM node:24.22.1-alpine AS runtime

ARG user=1000
ARG group=1000

USER $user:$group
WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY src src
COPY public public
COPY prompt prompt

ENTRYPOINT ["/usr/local/bin/node", "src/main.mjs"]
