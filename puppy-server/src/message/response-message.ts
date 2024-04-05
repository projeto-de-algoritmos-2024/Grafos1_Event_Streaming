import { Message } from "./message";

/**

{
  status: 'OK' | 'ERROR' | 'RCVD',
  messageId: string
  details?: string
}

binary
  status: 1B | messageIdSize: 1B | messageId | detailMessageFlag: 1B | detailMessage
*/

type ResponseMessageStatus = 'OK' | 'ERROR' | 'RCVD'

const STATUS_TO_BYTE_MAP: Record<ResponseMessageStatus, number> = {
  OK: 0x01,
  ERROR: 0x02,
  RCVD: 0x03
}

const BYTE_TO_STATUS_MAP: Record<number, ResponseMessageStatus> = {
  0x01: "OK",
  0x02: "ERROR",
  0x03: "RCVD"
}

export class ResponseMessage extends Message {
  status: ResponseMessageStatus
  messageId: string
  details: string | null

  constructor(options: {
    status: ResponseMessageStatus
    messageId: string
    details?: string | null
  }) {
    super()
    this.status = options.status
    this.messageId = options.messageId
    this.details = options.details ?? null
  }

  override asBuffer() {
    const statusBuf = Buffer.from([STATUS_TO_BYTE_MAP[this.status]])
    const messageIdBuf = Buffer.from(this.messageId)
    const messageIdSize = Buffer.alloc(1)
    messageIdSize.writeUInt8(messageIdBuf.byteLength)
    
    const detailsMessageFlag = Buffer.alloc(1, 0)
    if (this.details) {
      detailsMessageFlag.writeUint8(1)
    }

    const arr = [
      statusBuf,
      messageIdSize,
      messageIdBuf,
      detailsMessageFlag
    ]

    if (this.details) arr.push(Buffer.from(this.details))

    return Buffer.concat(arr)
  }

  static override load(buffer: Buffer): ResponseMessage {
    let offset = 0
    const status = BYTE_TO_STATUS_MAP[buffer.readUInt8(offset++)]
    const messageIdSize = buffer.readUInt8(offset++)
    const messageId = buffer.subarray(offset, offset+messageIdSize).toString()
    offset += messageIdSize
    let details = null
    const detailsFlag = buffer.readUInt8(offset++) !== 0
    if (detailsFlag) {
      details = buffer.subarray(offset).toString()
    }
    return new ResponseMessage({
      messageId,
      status,
      details
    })
  }
}