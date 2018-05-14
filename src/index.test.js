import ChildProcess from 'child_process';
import { join } from 'path';

import ChildProcessMessagePort from '.';

let childProcess;

function waitForEvent(emitter, name) {
  return new Promise((resolve, reject) => {
    emitter.once(name, resolve);
  });
}

beforeEach(() => {
  childProcess = ChildProcess.fork(join(__dirname, '__fixtures/echo.js'));
});

afterEach(() => {
  childProcess.kill();
});

test('send and receive text', async () => {
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onmessage = jest.fn();
  messagePort.postMessage('Hello, World!');

  await waitForEvent(messagePort, 'message');

  expect(messagePort.onmessage).toHaveBeenCalledTimes(1);
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('data', 'Hello, World!');
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('origin', `child-process://${ childProcess.pid }/`);
});

test('send and receive binary', async () => {
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onmessage = jest.fn();
  messagePort.postMessage(Buffer.from('Hello, World!'));

  await waitForEvent(messagePort, 'message');

  expect(messagePort.onmessage).toHaveBeenCalledTimes(1);
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('data', Buffer.from('Hello, World!'));
  expect(messagePort.onmessage.mock.calls[0][0]).toHaveProperty('origin', `child-process://${ childProcess.pid }/`);
});

test('send after kill', async () => {
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onerror = jest.fn();

  childProcess.kill();

  await waitForEvent(childProcess, 'close');

  messagePort.postMessage('Hello, World!');

  await waitForEvent(messagePort, 'error');

  expect(messagePort.onerror).toHaveBeenCalledTimes(1);
});

test('send after disconnect', async () => {
  const messagePort = new ChildProcessMessagePort(childProcess);

  messagePort.onerror = jest.fn();

  childProcess.disconnect();

  await waitForEvent(childProcess, 'disconnect');

  messagePort.postMessage('Hello, World!');

  await waitForEvent(messagePort, 'error');

  expect(messagePort.onerror).toHaveBeenCalledTimes(1);
});
