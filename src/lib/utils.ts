import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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

/**
 * Converts a Wayfinder-compatible ar:// URL to https:// URL using the current
 * gateway
 * @param wayfinderUrl Wayfinder-compatible ar:// URL
 * @returns standard URL
 */
export const convertToHttpsUrl = (
  wayfinderUrl: `ar://${string}`
) => {
  const gatewayRoot = wuzzyOffChainDomains
    .includes(window.location.hostname)
    ? 'arweave.net'
    : window.location.host.split('.').slice(1).join('.')

  const url = new URL(wayfinderUrl)
  url.protocol = 'https:'
  if (wayfinderUrl.length === 48 && !wayfinderUrl.substring(5).includes('/')) {
    url.host = gatewayRoot
    url.pathname = `/${wayfinderUrl.substring(5)}`
  } else {
    url.host = `${wayfinderUrl.split('/')[2]}.${gatewayRoot}`
  }

  return url.toString()
}

/**
 * Converts https:// URL to a Wayfinder-compatible ar:// URL
 * @param url standard URL
 * @returns wayfinder-compatible URL
 */
export const convertToWayfinderUrl = (url: string): `ar://${string}` => {
  
  const result = url
    .substring(0, url.length)
    .replace('https://', 'ar://')
    .replace('.arweave.net', '')
    .replace('arweave.net/', '')
    .replace(/\/+$/, '') as `ar://${string}`

  return result
}
