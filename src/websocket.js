import { ipcMain, BrowserWindow, app, session } from 'electron'
import { Event, CloseEvent, MessageEvent } from './events'
import * as path from 'path'
import url from 'url'

const STATUS_CONSTANTS = {
  CONNECTING: 0, // The connection is not yet open.
  OPEN: 1, // The connection is open and ready to communicate.
  CLOSING: 2, // The connection is in the process of closing.
  CLOSED: 3 // The connection is closed or couldn't be opened.
}

let setReady, isClosed
export const isReady = (new Promise(resolve => { setReady = resolve })).then(() => console.log('isReady is true'))
let workerWindow, workerSession
function init () {
  console.log('initializing...')
  workerSession = session.fromPartition('electron-websocket')
  workerSession.clearStorageData()
  const workerWindow_ = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    webPreferences: {
      webSecurity: false,
      session: workerSession
    }
  })
  workerWindow_.webContents.once('did-finish-load', () => {
    console.log('window did-finish-load')
    setTimeout(() => {
      workerWindow = workerWindow_
      setReady()
    }, 100)
  })
  const URL = url.format({
    protocol: 'file',
    pathname: path.resolve(__dirname, '../contents/content.html'),
    slashes: true
  })
  console.log('loading url', URL)
  workerWindow_.once('closed', () => {
    workerWindow = null
    isClosed = true
  })
  workerWindow_.loadURL(URL)
  console.log('created window')
}

if (app.isReady()) init()
else app.once('ready', init)

export default class WebSocket {
  constructor (url, protocols) {
    console.log('Creating new websocket')
    if (isClosed) throw new Error('Trying to open a websocket but the background window has been closed')
    this._id = parseInt(Math.random() * 10e16)
    this._protocols = protocols
    this.onopen = null
    this.onmessage = null
    this.onerror = null
    this.onclose = null
    this._setValues({ url, readyState: STATUS_CONSTANTS.CONNECTING })
    this.binaryType = 'blob'
    ipcMain.on('websocket-' + this._id, (event, data) => {
      this._setValues(data.values) // update the values
      if (data.type === 'open' && typeof this.onopen === 'function') {
        this.onopen(new Event({
          type: 'open',
          target: this,
          timeStamp: data.eventData.timeStamp
        }))
      } else if (data.type === 'message' && typeof this.onmessage === 'function') {
        this.onmessage(new MessageEvent({
          target: this,
          timeStamp: data.eventData.timeStamp,
          data: data.eventData.data,
          origin: data.eventData.origin,
          ports: data.eventData.ports,
          source: data.eventData.source
        }))
      } else if (data.type === 'error' && typeof this.onclose === 'function') {
        this.onerror(new Event({
          type: 'error',
          target: this,
          timeStamp: data.eventData.timeStamp
        }))
      } else if (data.type === 'close') {
        ipcMain.removeAllListeners('websocket-' + this._id)
        if (typeof this.onclose === 'function') {
          this.onclose(new CloseEvent({
            target: this,
            timeStamp: data.eventData.timeStamp,
            code: data.eventData.code,
            reason: data.eventData.reason,
            wasClean: data.eventData.wasClean
          }))
        }
      }
    })
    this._sendToWindow('websocket', { id: this._id, url, protocols })
  }

  _setValues ({ url, readyState, protocol = '', extensions = '', bufferedAmount = 0 }) {
    this.url = url
    this.readyState = readyState
    this.protocol = protocol
    this.extensions = extensions
    this.bufferedAmount = bufferedAmount
  }

  _sendToWindow (...args) {
    const send = () => {
      console.log('Sending to window', args)
      workerWindow.webContents.send(...args)
    }
    if (!workerWindow) {
      if (isClosed) throw new Error('Trying to open a websocket but the background window has been closed')
      else {
        isReady.then(send)
      }
    } else send()
  }

  close (code, reason) {
    this.readyState = STATUS_CONSTANTS.CLOSING
    this._sendToWindow('websocket-' + this._id, {
      type: 'close',
      data: { code, reason }
    })
  }

  send (data) {
    if (this.readyState !== STATUS_CONSTANTS.OPEN) throw new Error('tried to send on an unopen socket') // TODO: better error
    this._sendToWindow('websocket-' + this._id, {
      type: 'send',
      data
    })
  }
}
