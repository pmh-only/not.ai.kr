FROM alpine:latest AS build

RUN apk add --no-cache nodejs
RUN apk add --no-cache pnpm

WORKDIR /app

COPY package.json \
     pnpm-lock.yaml \
     ./

RUN pnpm i --prod

FROM alpine:latest AS runtime

RUN apk add --no-cache nodejs

ARG user=1000
ARG group=1000

USER $user:$group
WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY src src
COPY public public
COPY prompt prompt

ENTRYPOINT ["/usr/bin/node", "src/main.mjs"]
