import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['reactions'],

  ws: service(),

  init() {
    this._super(...arguments);
    this.set('reactions', []);
    this.ws.listen(this, 'onMessage');
  },

  onMessage(message) {
    if (message.type === 'reaction') {
      let { id: clientId, seq, payload } = message;
      let id = `${clientId}.${seq}`;
      let styles = [
        `top: ${Math.round(Math.random() * 80)}%;`,
        `margin-right: ${(Math.random() * 200 - 100).toFixed(2)}px;`,
        `font-size: ${Math.round(96 + Math.random() * 64)}px;`,
        `animation:`,
        `reaction-repeat ${(1 + Math.random() * 2).toFixed(2)}s ease-in-out infinite alternate-reverse,`,
        `reaction-exit ${(5 + Math.random() * 10).toFixed(2)}s ease-in ${(Math.random() * 2).toFixed(2)}s 1 both;`,
      ];

      this.reactions.pushObject({ id, emoji: decode(payload), style: htmlSafe(styles.join(' ')) });

      if (this.reactions.length > 100) {
        this.reactions.shiftObject();
      }
    }
  }
});

function decode(payload) {
  switch (payload.type) {
    case 'like':
      return '👍';

    case 'lol':
      return '😂';

    case 'shook':
      return '😮';

    case 'scream':
      return '😱';

    case 'sweat':
      return '😅';

    case 'angry':
      return '😡';

    case 'cry':
      return '😭';

    case 'scare':
      return '😨';

    case 'heart':
      return '❤️';

    case 'poop':
      return '💩';
  }
}
