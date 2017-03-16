/* global describe, it, before */
import chai from 'chai'
import chaiPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'

import WebSocket, { isReady } from '../src'

chai.use(chaiPromised)
chai.use(dirtyChai)
const { assert } = chai

describe('electron-websocket', function () {
  this.timeout(10000)

  before(() => isReady) // Wait for ready. Not necessary per-say, but why not

  it('should open websocket', () => {
    const ws = new WebSocket('wss://echo.websocket.org/')
    return new Promise((resolve, reject) => {
      ws.onmessage = event => resolve(event.data)
      ws.onerror = event => reject(new Error())
      ws.onopen = () => {
        ws.send('toto')
      }
    }).then(result => {
      assert.equal(result, 'toto')
    })
  })
})
