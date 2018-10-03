FROM rust:latest as ws

ENV CARGO_HOME /cargo
ENV CARGO_TARGET_DIR /cargo/target

VOLUME /ws
VOLUME /cargo
EXPOSE 8000

WORKDIR /ws
CMD cargo watch -x 'run -- --host 0.0.0.0'
