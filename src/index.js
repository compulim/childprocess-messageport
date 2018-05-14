import { deserialize, hoistLegacyEventHandler, HTMLEventEmitter, serialize } from 'websocket-util';

export default class ChildProcessMessagePort extends HTMLEventEmitter {
  constructor(childProcess) {
    super();

    this.childProcess = childProcess;
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.origin = `child-process://${ this.childProcess.pid }/`;

    ['error', 'message', 'messageerror'].forEach(name => hoistLegacyEventHandler(this, name));

    childProcess.once('disconnect', this.handleDisconnect);
    childProcess.on('message', this.handleMessage);
  }

  handleDisconnect() {
    this.childProcess.removeListener('disconnect', this.handleDisconnect);
    this.childProcess.removeListener('message', this.handleMessage);
  }

  handleMessage(data) {
    let deserialized;

    try {
      deserialized = deserialize(data);
    } catch (err) {
      return this.emit('messageerror', {
        origin: this.origin,
        source: this,
        type: 'messageerror'
      });
    }

    this.emit('message', {
      data: deserialized,
      origin: this.origin,
      source: this,
      type: 'message'
    });
  }

  postMessage(data) {
    this.childProcess.send(serialize(data), error => {
      error && this.emit('error', { error });
    });
  }
}
