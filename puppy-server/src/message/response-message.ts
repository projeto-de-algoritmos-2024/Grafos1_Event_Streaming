import { Message } from "./message";

export class ResponseMessage extends Message {
  override asBuffer() {
    return Buffer.from('')
  }

  static override load(buffer: Buffer): ResponseMessage {
    return new ResponseMessage()
  }
}