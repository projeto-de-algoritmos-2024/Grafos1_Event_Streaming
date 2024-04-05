import { Message } from "./message"
import { OperationMessage } from "./operation"
import { ResponseMessage } from "./response-message"

export class MessageCodec {
  private static OPERATION_BYTE = 0x00
  private static RESPONSE_MESSAGE_BYTE = 0x01
  static encode(message: Message): Buffer {
    let indicator: number = -1
    if (message instanceof OperationMessage) indicator = this.OPERATION_BYTE
    if (message instanceof ResponseMessage) indicator = this.RESPONSE_MESSAGE_BYTE
    return Buffer.concat([Buffer.from([indicator]), message.asBuffer()])
  }

  static decode(buffer: Buffer) {
    const flag = buffer[0]
    if (flag === this.OPERATION_BYTE) return OperationMessage.load(buffer.subarray(1))
    if (flag === this.RESPONSE_MESSAGE_BYTE) return ResponseMessage.load(buffer.subarray(1))

    throw new Error(`Unknown flag byte: ${flag}`)
  }
}