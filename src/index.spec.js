import { deserialize, serialize } from 'websocket-util';
import { EventEmitter } from 'events';

import ChildProcessMessagePort from '.';

function setupMock() {
  const childProcess = new EventEmitter();

  childProcess.pid = 1234;
  childProcess.send = jest.fn();

  return {
    childProcess
  };
}

test('send text', () => {
  const { childProcess } = setupMock();
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.postMessage('Hello, World!');

  expect(childProcess.send).toHaveBeenCalledTimes(1);
  expect(childProcess.send.mock.calls[0][0]).toEqual(serialize('Hello, World!'));
});

test('send binary', () => {
  const { childProcess } = setupMock();
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.postMessage(Buffer.from('Hello, World!'));

  expect(childProcess.send).toHaveBeenCalledTimes(1);
  expect(childProcess.send.mock.calls[0][0]).toEqual(serialize(Buffer.from('Hello, World!')));
});

test('receive text', () => {
  const { childProcess } = setupMock();
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onmessage = jest.fn();

  childProcess.emit('message', serialize('Hello, World!'));

  expect(messagePort.onmessage).toHaveBeenCalledTimes(1);
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('data', 'Hello, World!');
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('origin', 'child-process://1234/');
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('source', messagePort);
});

test('receive buffer', () => {
  const { childProcess } = setupMock();
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onmessage = jest.fn();

  childProcess.emit('message', serialize(Buffer.from('Hello, World!')));

  expect(messagePort.onmessage).toHaveBeenCalledTimes(1);
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('data', Buffer.from('Hello, World!'));
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('origin', 'child-process://1234/');
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('source', messagePort);
});

test('receive invalid', () => {
  const { childProcess } = setupMock();
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onmessageerror = jest.fn();

  childProcess.emit('message', JSON.stringify({ invalid: 1 }));

  expect(messagePort.onmessageerror).toHaveBeenCalledTimes(1);
});
