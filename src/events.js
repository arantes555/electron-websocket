export class Event {
  constructor (type, data) {
    const { type_, data_ } = new.target._normalizeArgs(type, data)
    this.type = type_ || data_.toString()
    this.timeStamp = data_.timeStamp || (Date.now() * 1000) // Not very pretty, but makes do
    this.target = data_.target || null
    this.isTrusted = data_.isTrusted || false
    this.eventPhase = data_.eventPhase || 0
    this.bubbles = data_.bubbles || false
    this.cancelable = data_.cancelable || false
    this.defaultPrevented = data_.defaultPrevented || false
    this.composed = data_.composed || false
    this.cancelBubble = data_.cancelBubble || false
    this.NONE = data_.NONE || 0
    this.CAPTURING_PHASE = data_.CAPTURING_PHASE || 1
  }

  static _normalizeArgs (type, data) {
    let type_ = type
    let data_ = data
    if (!data_) {
      if (!type_) throw new TypeError('Not enough arguments to Event.')
      data_ = type_
      type_ = data_.type
    }
    return { type_, data_ }
  }

  preventDefault () {}

  stopImmediatePropagation () {}

  stopPropagation () {}
}

export class MessageEvent extends Event {
  constructor (type, data) {
    super(type, data)
    const { data_ } = new.target._normalizeArgs(type, data)
    this.type = 'message'
    this.data = data_.data
    this.origin = data_.origin
    this.ports = data_.ports
    this.source = data_.source
  }
}

export class CloseEvent extends Event {
  constructor (type, data) {
    super(type, data)
    const { data_ } = new.target._normalizeArgs(type, data)
    this.type = 'close'
    this.code = data_.code
    this.reason = data_.reason
    this.wasClean = data_.wasClean
  }
}
