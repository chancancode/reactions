import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('text', '');
  },

  update(status, expiration = null) {
    this.set('text', status);
    this.cleanup.perform(expiration);
  },

  clear() {
    this.update('');
  },

  cleanup: task(function* (expiration) {
    if (expiration) {
      yield timeout(expiration);
      this.set('text', '');
    }
  }).restartable(),
});
