FROM node:latest

RUN set -ex \
  && export WATCHMAN_VERSION=4.9.0 \
  && curl -SL "https://github.com/facebook/watchman/archive/v${WATCHMAN_VERSION}.tar.gz" | tar -xz -C /tmp/ \
  && cd /tmp/watchman-${WATCHMAN_VERSION} \
  && ./autogen.sh \
  && ./configure \
  && apt-get update && apt-get install -y --no-install-recommends python-dev \
  && make \
  && make install \
  && apt-get purge -y --auto-remove python-dev \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /tmp/*

RUN yarn global add ember-cli

VOLUME /frontend
VOLUME /frontend/node_modules
VOLUME /frontend/tmp
VOLUME /usr/local/share/.cache/
EXPOSE 4200 35730

WORKDIR /frontend
CMD yarn && yarn start
