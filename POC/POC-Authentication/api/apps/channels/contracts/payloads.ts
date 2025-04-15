interface JoinChannelPayload {
  serverId: string
  channelId: string
}

interface StreamPayload {
  channel_id: string
  audio: Blob
}

export type { JoinChannelPayload, StreamPayload }
