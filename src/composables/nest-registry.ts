import AppConfig from '@/app-config'
import { generateRegistrationCode } from '@/lib/generate-registration-code'
import { useAoConnect } from './ao-connect'

export function useNestRegistry() {

  const baseUrl = `${AppConfig.hyperbeamEndpoint}/${AppConfig.nestRegistryId}/now`
  const nestRegistryViewModuleUrl = `${baseUrl}/~lua@5.3a&module=${AppConfig.nestRegistryViewModuleId}`

  const getNestRegistryState = async () => {
    if (!AppConfig.nestRegistryId) {
      throw new Error('Nest Registry ID is not configured')
    }

    const result = await fetch(`${nestRegistryViewModuleUrl}/registry_info/serialize~json@1.0`)
    const registry_info = await result.json()
    console.log('Nest registry state', registry_info)

    return registry_info
  }

  const listNestsByAddress = async (address: string) => {
    if (!AppConfig.nestRegistryId) {
      throw new Error('Nest Registry ID is not configured')
    }

    const result = await fetch(`${nestRegistryViewModuleUrl}/nests_by_address/serialize~json@1.0?address=${address}`)
    const nests = await result.json()
    console.log(`Nests for address ${address}`, nests)

    return nests
  }

// hash: "3754fbff177fe856a54332f29c291c9d71a69eda291743cfdcfa1422fec2ef22d3426c27bb20f30742c8184d1f4575b190f093c9332c60fb50e824f1f081db8e"
// secret: "ad8c9165b29b9ca8f08e1974705a4efc58baba01d18606ceea21352e0d0ad94c"

// "secret": "713910fa52ee7b1ddf0473c116111d908bedc222de1fbc202f5d838c54b44472",
// "hash": "26f542091e3baecb9b2a82fd268a8cc6ce8a85d75367c3a96a56e1bca6c027b14161c0ee87bf2846ee531a8835bacc14852210c3b20e29fbd5345f1cb46fd7aa"

  const addRegistrationCode = async () => {
    if (!AppConfig.nestRegistryId) {
      throw new Error('Nest Registry ID is not configured')
    }

    const registrationCode = await generateRegistrationCode()
    console.log('Adding registration code', registrationCode)

    const ao = useAoConnect()
    return ao.sendMessage({
      processId: AppConfig.nestRegistryId,
      data: registrationCode.hash,
      tags: [
        { name: 'Action', value: 'Add-Registration-Code' },
        { name: 'Registration-Hash', value: registrationCode.hash }
      ]
    })
  }

  return { getNestRegistryState, listNestsByAddress, addRegistrationCode }
}
