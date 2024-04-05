export class Message {
  asBuffer(): Buffer {
    throw new Error('not implemented')
  }

  static load(buffer: Buffer): Message {
    throw new Error('not implemented')
  }
}