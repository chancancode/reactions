FROM node:latest as frontend
WORKDIR /frontend
RUN yarn global add ember-cli
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn
COPY frontend ./
RUN ember build -prod

FROM rust:latest as ws
WORKDIR /ws
COPY ws/Cargo.toml ws/Cargo.lock ./
RUN mkdir -p src && \
  echo "fn main() {}" >> src/main.rs && \
  cargo build --release && \
  rm -rf src
COPY ws ./
RUN touch src/main.rs && cargo build --release

FROM ubuntu:latest
RUN apt-get update && apt-get install -y git curl gnupg
ARG HEROKU_VERSION=latest
RUN HEROKU_VERSION=${HEROKU_VERSION} curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
RUN git config --global user.email "deploy@reactions.live"
RUN git config --global user.name "Deploy"
WORKDIR /app
COPY --from=frontend /frontend/dist ./public_html/
COPY --from=ws /ws/target/release/reactions .
COPY deploy/nginx.conf.erb config/
COPY deploy/Procfile .
COPY tmp/deploy/.netrc /root/.netrc
RUN git init . && \
  git remote add origin https://git.heroku.com/reactions-live.git && \
  git add . && \
  git commit -m "Deploy"
CMD git push -f origin master
