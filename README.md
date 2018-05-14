# childprocess-messageport

[![npm version](https://badge.fury.io/js/childprocess-messageport.svg)](https://badge.fury.io/js/childprocess-messageport) [![Build Status](https://travis-ci.org/compulim/childprocess-messageport.svg?branch=master)](https://travis-ci.org/compulim/childprocess-messageport)

Turns [`ChildProcess`](https://nodejs.org/api/child_process.html) IPC into [MessagePort](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort).

# Background

Instead of learning/using different API for different communication channels, we should unite them into a single interface pattern, either [MessagePort](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort) or [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

# How to use

```js
const childProcess = ChildProcess.fork('echo.js');
const messagePort = new ChildProcessMessagePort(childProcess);

messagePort.onmessage = event => {
  // Could be either a string or Buffer
  console.log(event.data);
};

messagePort.postMessage('Hello, World!');
```

> Instead of subscribing to `onmessage`, you can also subscribe using `on('message', handler)`.

If the underlying `childProcess.send` is failed, an `error` event will be emitted.

# Contributions

Like us? [Star](https://github.com/compulim/childprocess-messageport/stargazers) us.

Want to make it better? [File](https://github.com/compulim/childprocess-messageport/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/childprocess-messageport/pulls) a pull request.
