FROM node:22-alpine AS builder

# builder
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run tsc

FROM node:22-alpine
WORKDIR /usr/src/app/dist
RUN apk add curl
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./

VOLUME ["/usr/src/app/output/logs"]

# EXPOSE 3456 2345
WORKDIR /usr/src/app
# CMD [ "ls" ]
CMD [ "node", "dist/OUC-AUTO-Login.js" ]
