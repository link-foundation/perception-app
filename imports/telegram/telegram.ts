import { DeepClient } from '@deep-foundation/deeplinks/imports/client'
import { TELEGRAM_PACKAGE_NAME } from './package-name'

export const createTestMessage = async (deep: DeepClient, message: string = 'test') => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
    await deep.insert({
        type_id: await deep.id(TELEGRAM_PACKAGE_NAME, 'message'),
        string: { data: { value: message } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
            }
        }
    })
}

export const createTestChatId = async (deep: DeepClient, chat_id: number) => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
    await deep.insert({
        type_id: await deep.id(TELEGRAM_PACKAGE_NAME, 'chatId'),
        number: { data: { value: chat_id } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
            }
        }
    })
}

export const createTestToken = async (deep: DeepClient, token: string) => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
    await deep.insert({
        type_id: await deep.id(TELEGRAM_PACKAGE_NAME, 'tokenBot'),
        string: { data: { value: token } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
            }
        }
    })
}

export const createTestHost = async (deep: DeepClient, host: string) => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
    await deep.insert({
        type_id: await deep.id(TELEGRAM_PACKAGE_NAME, 'host'),
        string: { data: { value: host } },
        in: {
            data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
            }
        }
    })
}