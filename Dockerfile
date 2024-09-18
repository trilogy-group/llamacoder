FROM node:20
# copy code and skip node_modules and .next
WORKDIR /code
COPY --chown=node:node . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]

