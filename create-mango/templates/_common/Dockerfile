FROM node:18-alpine as build

COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:18-alpine as production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build package.json .
COPY --from=build dist/ dist/

RUN yarn install --frozen-lockfile --production

# copies admin static files
# [ ] Use symlinks instead of copying files
COPY --from=build node_modules/mangobase/dist/admin dist/admin

EXPOSE 5000
ENV PORT=5000

CMD ["node", "dist/index.js"]
