/* global WebSocket */
const { ipcRenderer, remote } = require('electron')
const console = {log: remote.getGlobal('console').log}

console.log('The window is created')

ipcRenderer.on('websocket', (event_, { id, url, protocols }) => {
  console.log('creating new websocket')
  const ws = new WebSocket(url, protocols) // TODO: try/catch
  ipcRenderer.on('websocket-' + id, (event, { type, data }) => {
    if (type === 'close') {
      ws.close(data.code, data.reason) // TODO: try/catch
    } else if (type === 'send') {
      ws.send(data) // TODO: try/catch
    }
  })
  const sendWithData = (event, toSend = []) => {
    const eventData = { timeStamp: event.timeStamp }
    for (const entry of toSend) {
      eventData[ entry ] = event[ entry ]
    }
    ipcRenderer.send('websocket-' + id, {
      type: event.type,
      values: {
        url: ws.url,
        readyState: ws.readyState,
        protocol: ws.protocol,
        extensions: ws.extensions,
        bufferedAmount: ws.bufferedAmount
      },
      eventData
    })
  }
  ws.onopen = (event) => sendWithData(event)
  ws.onmessage = (event) => sendWithData(event, [ 'data', 'origin', 'ports', 'source' ])
  ws.onerror = (event) => sendWithData(event)
  ws.onclose = (event) => {
    ipcRenderer.removeAllListeners('websocket-' + id)
    sendWithData(event, [ 'code', 'reason', 'wasClean' ])
  }
})
