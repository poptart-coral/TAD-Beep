import { ActionSignalWebhook, SignalWebhook } from '#apps/webhooks/models/signaling'
import {
  UpdateWebhookSchema,
  CreateWebhooksSchema,
  UpdateWebhookPictureSchema,
} from '#apps/webhooks/validators/webhook'
import StorageService from '#apps/storage/services/storage_service'
import { inject } from '@adonisjs/core'
import transmit from '@adonisjs/transmit/services/main'
import Webhook from '#apps/webhooks/models/webhook'
import WebhookAlreadyExistsException from '../exceptions/webhook_already_exists_exception.js'
import WebhookNotFoundException from '../exceptions/webhook_not_found_exception.js'
import Message from '#apps/messages/models/message'
import env from '#start/env'
import jwt from 'jsonwebtoken'
import WebhookJwtInvalidException from '#apps/webhooks/exceptions/webhook_jwt_invalid_exception'
import AuthenticationService from '#apps/authentication/services/authentication_service'
import User from '#apps/users/models/user'
import WebhookUserIdMissing from '#apps/users/exceptions/webhook_userId_missing_exception'
import WebhookTokenEmpty from '#apps/webhooks/exceptions/webhook_token_empty_exception'
import WebhookAppKeyMissing from '#apps/webhooks/exceptions/webhook_app_key_missing_exception'
import WebhookProcessingException from '#apps/webhooks/exceptions/webhook_processing_exception'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import TokenService from '#apps/webhooks/services/token_service'

export interface PayloadJWTSFUConnection {
  name?: string
}

@inject()
export default class WebhookService {
  constructor(
    protected storageService: StorageService,
    private readonly tokenService: TokenService
  ) {}
  authService = new AuthenticationService()

  async create(
    webhook: CreateWebhooksSchema,
    ownerId: string,
    channelId: string,
    serverId: string
  ) {
    // Vérifiez si un webhook avec le même nom existe déjà dans le canal
    const existingWebhook = await Webhook.query()
      .where('name', webhook.name)
      .andWhere('channelId', channelId)
      .first()

    if (existingWebhook) {
      throw new WebhookAlreadyExistsException(
        'Webhook with this name already exists in the channel',
        {
          status: 400,
          code: 'E_WEBHOOK_ALREADY_EXISTS',
        }
      )
    }

    // Création du webhook
    const createdWebhook = await Webhook.create({
      name: webhook.name,
      token: this.tokenService.generateToken({ name: webhook.name }),
      userId: ownerId,
      channelId: channelId,
      serverId: serverId || null,
    })

    // Diffusion de l'événement
    const signalWebhook: SignalWebhook = {
      webhook: createdWebhook,
      action: ActionSignalWebhook.create,
    }

    transmit.broadcast(`channels/${channelId}/webhook`, JSON.stringify(signalWebhook))

    return createdWebhook
  }

  async update(updatedWebhook: UpdateWebhookSchema, webhookId: string) {
    // Vérifiez si le webhook existe
    const webhook = await Webhook.find(webhookId)
    if (!webhook) {
      throw new WebhookNotFoundException('Webhook not found', {
        status: 404,
        code: 'E_WEBHOOK_NOT_FOUND',
      })
    }

    // Mise à jour du webhook
    try {
      await webhook.merge(updatedWebhook).save()
    } catch (error) {
      if (error.code === '23505') {
        // Gestion des contraintes DB
        throw new WebhookAlreadyExistsException(
          'Another webhook with this name already exists in the channel',
          {
            status: 400,
            code: 'E_WEBHOOK_NAME_CONFLICT',
          }
        )
      }
      throw error
    }

    // Diffusion de l'événement
    const signalWebhook: SignalWebhook = {
      webhook: webhook,
      action: ActionSignalWebhook.update,
    }

    transmit.broadcast(`channels/${webhook.channelId}/messages`, JSON.stringify(signalWebhook))

    return webhook
  }

  async findAllByChannelId(channelId: string) {
    return Webhook.query().where('channelId', channelId).orderBy('created_at', 'desc')
  }

  async findAllByServerId(serverId: string) {
    return Webhook.query().where('serverId', serverId).orderBy('created_at', 'desc')
  }

  async findById(webhookId: string) {
    const webhook = await Webhook.find(webhookId)

    if (!webhook) {
      throw new WebhookNotFoundException('Webhook not found', {
        status: 404,
        code: 'E_WEBHOOK_NOT_FOUND',
      })
    }

    return webhook
  }

  // Supprime un webhook et garder les messages
  async delete(webhookId: string) {
    const webhook = await Webhook.find(webhookId)

    if (!webhook) {
      throw new WebhookNotFoundException('Webhook not found', {
        status: 404,
        code: 'E_WEBHOOK_NOT_FOUND',
      })
    }

    await webhook.delete()

    const signalWebhook: SignalWebhook = {
      webhook: webhook,
      action: ActionSignalWebhook.delete,
    }

    transmit.broadcast(`channels/${webhook.channelId}/webhook`, JSON.stringify(signalWebhook))

    return webhook
  }

  async trigger(webhookId: string, messageContent: string) {
    // Find the webhook by ID
    const webhook = await Webhook.findOrFail(webhookId)

    // Validate the webhook token
    try {
      if (webhook.token) {
        const appKey = env.get('APP_KEY')
        if (!appKey) {
          throw new WebhookAppKeyMissing('Application key is not configured in the environment', {
            status: 500,
            code: 'E_APP_KEY_MISSING',
          })
        }

        try {
          jwt.verify(webhook.token, appKey)
        } catch (jwtError) {
          throw new WebhookJwtInvalidException('Invalid JWT token provided', {
            status: 401,
            code: 'E_INVALID_JWT',
            cause: jwtError,
          })
        }
      } else {
        throw new WebhookTokenEmpty('Webhook token is required but was not provided', {
          status: 400,
          code: 'E_TOKEN_MISSING',
        })
      }
    } catch (err) {
      if (!(err instanceof WebhookJwtInvalidException)) {
        throw new WebhookProcessingException(
          'An error occurred while processing the webhook token',
          {
            status: 500,
            code: 'E_WEBHOOK_PROCESSING',
            cause: err,
          }
        )
      }
      throw err // Re-throw specific JWT exception
    }

    // Validate the userId field
    if (!webhook.userId) {
      throw new WebhookUserIdMissing('Webhook userId is required but was not provided', {
        status: 400,
        code: 'E_USERID_MISSING',
      })
    }

    // Ensure the user exists in the database
    const userExists = await User.find(webhook.userId)
    if (!userExists) {
      throw new UserNotFoundException(`User with ID ${webhook.userId} does not exist`, {
        status: 404,
        code: 'E_USER_NOT_FOUND',
      })
    }

    // Create the message
    const createdMessage = await Message.create({
      content: messageContent,
      webhookId: webhook.id,
      channelId: webhook.channelId,
      ownerId: webhook.userId,
    })

    // Construct the payload for the broadcast
    const signalWebhook: SignalWebhook = {
      webhook: webhook,
      action: ActionSignalWebhook.trigger,
      message: createdMessage.content,
    }

    // Broadcast the webhook event to the channel
    transmit.broadcast(`channels/${webhook.channelId}/webhook`, JSON.stringify(signalWebhook))

    // Return the result
    return {
      webhook,
      message: createdMessage,
      status: 'Webhook triggered and message created successfully',
    }
  }

  async updateWebhookPicture(payload: UpdateWebhookPictureSchema): Promise<void> {
    const webhook = await Webhook.findOrFail(payload.params.webhookId)
    webhook.webhookPicture = await new StorageService().updatePicture(
      payload.attachment,
      webhook.id
    )
    await webhook.save()
  }
}
