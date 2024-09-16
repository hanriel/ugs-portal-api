FROM node:18-alpine
LABEL authors="Hanriel"

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /user/src/app

COPY . .

RUN npm ci --omit=dev --ignore-scripts

RUN npm run build

USER node

CMD ["npm", "run", "start:prod"]