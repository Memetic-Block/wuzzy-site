import { connect, createSigner } from '@permaweb/aoconnect'
import AppConfig from '@/app-config'

interface BaseOptions { tags?: Array<{ name: string, value: string }> }
export interface SpawnOptions extends BaseOptions { processName: string }
interface BaseMessageOptions extends BaseOptions { processId: string }
export interface EvalOptions extends BaseMessageOptions { sourceTxId: string }
export interface MessageOptions extends BaseMessageOptions { data?: string }
export interface MessageResultOptions extends BaseMessageOptions { messageId: string }

export function useAoConnect() {

  const spawn = async (options: SpawnOptions) => {
    const signer = createSigner(window.arweaveWallet)
    const ao = connect({
      MODE: 'mainnet',
      signer,
      GATEWAY_URL: AppConfig.gatewayEndpoint,
      URL: AppConfig.hyperbeamEndpoint,
      SCHEDULER: AppConfig.scheduler
    })
    return ao.spawn({
      tags: [
        { name: 'App-Name', value: 'Wuzzy' },
        { name: 'Name', value: options.processName },
        { name: 'Authority', value: AppConfig.authority },
        ...(options.tags || [])
      ],
      authority: AppConfig.authority,
      module: AppConfig.aoModuleId,
      signer,
      data: 'WuzzySearch'
    })
  }

  const evalMessage = async (options: EvalOptions) => {
    const signer = createSigner(window.arweaveWallet)
    const ao = connect({
      MODE: 'mainnet',
      signer,
      GATEWAY_URL: AppConfig.gatewayEndpoint,
      URL: AppConfig.hyperbeamEndpoint,
      SCHEDULER: AppConfig.scheduler
    })
    // TODO -> Cache source data to avoid fetching from Arweave on every eval
    const data = await fetch(`${AppConfig.gatewayEndpoint}/${options.sourceTxId}`).then(res => res.text())
    return ao.message({
      process: options.processId,
      data,
      tags: [
        { name: 'App-Name', value: 'Wuzzy' },
        { name: 'Action', value: 'Eval' },
        ...(options.tags || [])
      ],
      signer
    })
  }

  const sendMessage = async (options: MessageOptions) => {
    const signer = createSigner(window.arweaveWallet)
    const ao = connect({
      MODE: 'mainnet',
      signer,
      GATEWAY_URL: AppConfig.gatewayEndpoint,
      URL: AppConfig.hyperbeamEndpoint,
      SCHEDULER: AppConfig.scheduler
    })
    const messageId = await ao.message({
      process: options.processId,
      data: options.data,
      tags: [
        { name: 'App-Name', value: 'Wuzzy' },
        ...(options.tags || [])
      ],
      signer
    })
    console.log(`Message sent with ID [${messageId}] to process [${options.processId}]`)
    await new Promise(resolve => setTimeout(resolve, 3000))
    const result = await getMessageResult({ processId: options.processId, messageId })
    console.log(`Message result for [${messageId}]`, result)
    return result
  }

  const getMessageResult = async (options: MessageResultOptions) => {
    const signer = createSigner(window.arweaveWallet)
    const ao = connect({
      MODE: 'mainnet',
      signer,
      GATEWAY_URL: AppConfig.gatewayEndpoint,
      URL: AppConfig.hyperbeamEndpoint,
      SCHEDULER: AppConfig.scheduler
    })
    return ao.result({
      process: options.processId,
      message: options.messageId
    })
  }

  return { spawn, evalMessage, sendMessage, getMessageResult }
}
