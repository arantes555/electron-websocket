electron-websocket
==========

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage status][codecov-image]][codecov-url]

A module to use chromium websockets in electron's background process.


## Motivation

Why not simply use the multiple websocket implementations for Node.js?
Well, Electron's chromium stack does a better job than Node.js at handling web proxies.


## Features

- Stay consistent with `WebSocket` API.


## Difference from client-side WebSocket

- See [Known Differences](https://github.com/arantes555/electron-websocket/blob/master/LIMITS.md) for details.
- If you happen to use a missing feature that `WebSocket` offers, feel free to open an issue.
- Pull requests are welcomed too!


[npm-image]: https://img.shields.io/npm/v/electron-websocket.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/electron-websocket
[travis-image]: https://img.shields.io/travis/arantes555/electron-websocket.svg?style=flat-square
[travis-url]: https://travis-ci.org/arantes555/electron-websocket
[codecov-image]: https://img.shields.io/codecov/c/github/arantes555/electron-websocket.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/arantes555/electron-websocket
