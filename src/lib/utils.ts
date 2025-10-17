import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  createWayfinderClient,
  StaticGatewaysProvider
} from '@ar.io/wayfinder-core'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const wuzzyOffChainDomains = [
  'localhost',
  'wuzzy.io',
  'www.wuzzy.io',
  'stage.wuzzy.io',
  'www.stage.wuzzy.io',
]
const gatewayFromWindowLocationHost = wuzzyOffChainDomains
  .includes(window.location.hostname)
  ? 'https://arweave.net'
  : window.location.host
const wayfinder = createWayfinderClient({
  gatewaysProvider: new StaticGatewaysProvider({
    gateways: [ gatewayFromWindowLocationHost ],
  })
})
export const resolveUrlWithWayfinder = async (wayfinderUrl: `ar://${string}`) => {
  const url = await wayfinder.resolveUrl({ wayfinderUrl })
  return url.toString()
}
export const formatUrlForWayfinder = (url: string): `ar://${string}` => {
  return url
    .substring(0, url.length)
    .replace('https://', 'ar://')
    .replace('.arweave.net', '')
    .replace(/\/+$/, '') as `ar://${string}`
}
