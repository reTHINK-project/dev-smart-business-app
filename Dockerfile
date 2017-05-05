FROM ubuntu:14.04
RUN apt-get update
RUN sudo apt-get --yes --force-yes install curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo bash -
RUN sudo apt-get --yes --force-yes  install nodejs
RUN sudo apt-get --yes --force-yes  install git

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY . /usr/src/app/
RUN npm install
RUN npm install nodemon
CMD npm start
EXPOSE 443 
