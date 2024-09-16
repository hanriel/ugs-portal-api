FROM node:18-alpine
LABEL authors="Hanriel"

WORKDIR /user/src/app

COPY . .

RUN npm ci --omit=dev --ignore-scripts

RUN npm run build

USER node

CMD ["npm", "run", "start:prod"]