import Message from '#apps/messages/models/message'

export enum ActionSignalMessage {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export interface SignalMessage {
  action: ActionSignalMessage
  message: Message
  transmitClientId?: string
}
