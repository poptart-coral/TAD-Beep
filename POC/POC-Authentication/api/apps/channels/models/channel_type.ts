export enum ChannelType {
  TEXT_SERVER = 0,
  VOICE_SERVER = 1,
  PRIVATE_CHAT = 2,
  FOLDER_SERVER = 3,
}

export function channelTypeToString(type: ChannelType): string {
  switch (type) {
    case ChannelType.TEXT_SERVER:
      return 'text_server'
    case ChannelType.VOICE_SERVER:
      return 'voice_server'
    case ChannelType.PRIVATE_CHAT:
      return 'private_chat'
    case ChannelType.FOLDER_SERVER:
      return 'folder_server'
  }
}
