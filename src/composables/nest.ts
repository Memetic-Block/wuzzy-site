import AppConfig from '@/app-config'
import { sendAosDryRun } from '../lib/send-aos-message'
import { useAoConnect } from './ao-connect'

export function useNests() {

  const spawnNest = async (processName: string, registrationCode: string) => {
    const ao = useAoConnect()
    const nestId = await ao.spawn({
      processName,
      tags: [
        { name: 'Registration-Code', value: registrationCode },
        { name: 'Nest-Registry', value: AppConfig.nestRegistryId },
        { name: 'Crawl-Request-Queue', value: AppConfig.crawlRequestQueueId }
      ]
    })
    const evalMessageId = await ao.evalMessage({ processId: nestId, sourceTxId: AppConfig.nestModuleId })
    const result = await ao.getMessageResult({ processId: nestId, messageId: evalMessageId })
    console.log('Spawned nest', nestId, result)

    return nestId
  }

  const getNestById = async (nestId: string) => {
    const { result } = await sendAosDryRun({
      processId: nestId,
      tags: [{ name: 'Action', value: 'View-State' }]
    })

    if (result.Messages && result.Messages.length > 0) {
      const nest = JSON.parse(result.Messages[0].Data)
      console.log('Got nest', nestId, nest)
      return nest
    }

    throw new Error(`Could not retrieve nest [${nestId}]: ${result.Error || (result as any)['error']}`)
  }

  return { getNestById, spawnNest }
}