FROM arm64v8/node:gallium as development
LABEL maintainer="Stephan du Toit"

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules
RUN rm -f yarn.lock package-lock.json

RUN apt-get update -y && apt-get install -y libvips-dev
RUN yarn install
RUN npx prisma generate

COPY . .

CMD ["yarn"]
CMD ["node", "server.js"]
