import { randomUUID } from "crypto";
import { Message } from "./message";

/**
```ts
{
  operation: 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'MESSAGE',
  topic: string,
  metadata: Record<string, any>,
  data: Buffer | null
  messageId: string | null
}
```

Message Binary:

operationNumber: 1 byte | topicSize: 2 bytes BE | topic | messageIdSize: 1 byte BE | messageId | dataByte | messageData
 */

type MessageOperation = 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'MESSAGE'

const BYTE_TO_OP_MAP: Record<number, MessageOperation> = {
  0x01: 'MESSAGE',
  0x02: 'PUBLISH',
  0x03: 'SUBSCRIBE',
  0x04: 'UNSUBSCRIBE'
}

const OP_TO_BYTE_MAP: Record<MessageOperation, number> = {
  MESSAGE: 0x01,
  PUBLISH: 0x02,
  SUBSCRIBE: 0x03,
  UNSUBSCRIBE: 0x04
}

export class OperationMessage extends Message {
  messageId: string
  topic: string
  metadata: Record<string, any>
  data: Buffer | null
  operation: MessageOperation

  constructor(options: {
    operation: MessageOperation
    topic: string
    data: Buffer | null
    metadata?: Record<string, any>
    messageId?: string
  }) {
    super()
    this.messageId = options.messageId ?? randomUUID()
    this.metadata = options.metadata ?? {}
    this.operation = options.operation
    this.data = options.data,
      this.topic = options.topic
  }

  override asBuffer(): Buffer {
    const topicBuf = Buffer.from(this.topic)
    const messageIdBuf = Buffer.from(this.messageId)

    const topicSizeBuf = Buffer.alloc(2)
    topicSizeBuf.writeUInt16BE(topicBuf.byteLength)

    const messageIdSize = Buffer.alloc(1)
    messageIdSize.writeUInt8(messageIdBuf.byteLength)

    const dataByte = Buffer.alloc(1, 0)
    if (this.data) dataByte.writeUInt8(1)

    const arr = [
      Buffer.from([OP_TO_BYTE_MAP[this.operation]]),
      topicSizeBuf,
      topicBuf,
      messageIdSize,
      messageIdBuf,
      dataByte
    ]

    if (this.data) arr.push(this.data)
    return Buffer.concat(arr)
  };

  static override load(buffer: Buffer): OperationMessage {
    try {
      let offset = 0
      const operation = BYTE_TO_OP_MAP[buffer.readUInt8(offset++)]
      const topicSize = buffer.readUint16BE(offset++)
      offset++
      const topic = buffer.subarray(offset, offset + topicSize).toString()
      offset += topicSize

      const messageIdSize = buffer.readUInt8(offset++)

      const messageId = buffer.subarray(offset, offset + messageIdSize).toString()
      offset += messageIdSize

      const containsData = buffer.readUInt8(offset++) !== 0


      let data = null
      if (containsData) {
        data = buffer.subarray(offset)
      }

      return new OperationMessage({
        data,
        operation,
        topic,
        messageId,
      })
    } catch (err) {
      console.error(err)
      throw new Error('Malformed message')
    }
  }
}