import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias, not } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  tagName: 'button',
  classNameBindings: [':reaction-button', 'isActive', 'isDisabled'],
  attributeBindings: ['isDisabled:disabled'],

  ws: service(),
  status: service(),

  isActive: alias('sendReaction.isRunning'),
  isDisabled: not('ws.isConnected'),

  start() {
    this.sendReaction.perform();
  },

  cancel() {
    this.sendReaction.cancelAll();
    this.status.clear();
  },

  mouseDown() {
    this.start();
  },

  touchStart() {
    this.start();
  },

  mouseUp() {
    this.cancel();
  },

  mouseLeave() {
    this.cancel();
  },

  touchEnd() {
    this.cancel();
  },

  touchCancel() {
    this.cancel();
  },

  focusOut() {
    this.cancel();
  },

  sendReaction: task(function* () {
    if (this.isDisabled) {
      return;
    }

    this.status.update(pick(
      'Steady...',
      "Don't move...",
      'Hold it right there...'
    ));

    yield timeout(750);

    this.status.update(pick(
      'Almost there...',
      'You can do this...',
      'Just a little longer...'
    ));

    yield timeout(750);

    this.status.update(pick(
      'Awesome!',
      'Nailed it!',
      'You did it!'
    ), 2000);

    this.ws.sendReaction({ type: this.type });
  }).drop(),
});

function pick(...options) {
  let i = Math.floor(Math.random() * options.length);
  return options[i];
}
