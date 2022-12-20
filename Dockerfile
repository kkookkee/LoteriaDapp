FROM node:16.13.2

WORKDIR /usr/scr/app
COPY . . 

RUN npm install package.json
RUN npm install -g truffle@5.5.4

EXPOSE 3000

ENTRYPOINT [ "sh" ]
