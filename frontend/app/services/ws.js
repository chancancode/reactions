import Service from '@ember/service';
import { alias, bool, or } from '@ember/object/computed';
import { bind } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';
import { Promise } from 'rsvp';
import config from '../config/environment';

/* eslint-disable no-unused-vars */
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;
/* eslint-enable no-unused-vars */

export default Service.extend({
  init() {
    window.WS = this;

    this._super(...arguments);
    this.set('listeners', []);
    this.set('seq', 0);
    this.connect.perform();
  },

  isConnected: bool('ws'),
  isConnecting: or('connect.isRunning', 'reconnect.isRunning'),
  isReconnecting: alias('reconnect.isRunning'),

  reset() {
    tryClose(this.ws);

    this.set('ws', null);
    this.set('clientId', null);
  },

  connect: task(function* () {
    this.reset();

    return new Promise((resolve, reject) => {
      let ws = new WebSocket(config.APP.WS_URL);

      ws.onopen = bind(() => {
        console.info('WS open');
        this.set('ws', ws);

        resolve(ws);
        reject = () => { };
      });

      ws.onclose = bind(event => {
        console.error('WS closed', event);
        reject();
        this.reconnect.perform();
      });

      ws.onmessage = bind(raw => {
        let message = JSON.parse(raw.data);

        switch (message.type) {
          case 'welcome':
            this.set('clientId', message.id);
            return;

          case 'reaction':
            dispatch(this.listeners, message);
            return;

          default:
            console.warn(`Ignoring unsupported message: ${message}`);
            return;
        }
      });

      ws.onerror = bind(error => {
        console.error('WS error', error);
        reject(error);
        this.reconnect.perform();
      });
    });
  }).drop(),

  reconnect: task(function* () {
    let backoff = 250;
    let jitter = 0.75 + Math.random() * 0.5; // +/- 25%
    let limit = 15 * 1000; // 15 seconds

    while (true) {
      backoff = Math.min(backoff * 1.5 * jitter, limit);

      this.reset();

      console.info(`Reconnect backoff: ${backoff} ms`);
      yield timeout(backoff);

      try {
        yield this.connect.perform();
        return;
      } catch (e) {
        continue;
      }
    }
  }).drop(),

  listen(target, method) {
    this.listeners.pushObject({ target, method });
  },

  unlisten(target, method) {
    let i = this.listeners.findIndex(listener =>
      listener.target === target && listener.method === method
    );

    this.listeners.removeAt(i, 1);
  },

  sendReaction(payload) {
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'reaction',
        id: this.clientId,
        seq: this.incrementProperty('seq'),
        payload
      }));
    }
  },
});

function tryClose(ws) {
  if (ws && ws.readyState === WS_OPEN) {
    ws.close('1000', 'client reset');
  }
}

function dispatch(listeners, message) {
  gc(listeners);

  listeners.forEach(({ target, method }) =>
    target[method](message)
  );
}

function gc(listeners) {
  let i = 0;

  while (i < listeners.length) {
    let { target } = listeners[i];

    if (target.isDestroying || target.isDetroyed) {
      listeners.removeAt(i, 1);
    } else {
      i++;
    }
  }
}
