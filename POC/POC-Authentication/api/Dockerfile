ARG NODE_IMAGE=node:20.10.0-alpine


FROM $NODE_IMAGE AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY=0
RUN corepack enable

RUN apk --no-cache add dumb-init
WORKDIR /home/node/app
RUN mkdir tmp

FROM base AS deps
COPY package.json .
COPY pnpm-lock.yaml .
RUN  pnpm install --frozen-lockfile


FROM base AS production-deps
COPY package.json .
COPY pnpm-lock.yaml .
RUN  pnpm install --frozen-lockfile --prod --ignore-scripts


FROM base AS build
COPY . .
COPY --from=deps /home/node/app/node_modules ./node_modules
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0

#RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod
COPY --from=build /home/node/app/build .
COPY --from=production-deps /home/node/app/node_modules ./node_modules
EXPOSE 80
CMD ["dumb-init", "node", "bin/server.js"]
