import { ARIO } from '@ar.io/sdk'

export function useArNS() {
  const ario = ARIO.mainnet()

  const getArNSRecordsForAddress = async (address: string) => {
    const records = await ario.getArNSRecordsForAddress({
      address,
      limit: 1000,
      sortBy: 'name',
      sortOrder: 'desc',
    })
    return records
  }

  return { getArNSRecordsForAddress }
}