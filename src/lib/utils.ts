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
export const convertToHttpsUrl = async (
  wayfinderUrl: `ar://${string}`
) => {
  const url = new URL(wayfinderUrl)
  url.protocol = 'https:'
  url.host = wuzzyOffChainDomains
    .includes(window.location.hostname)
    ? 'arweave.net'
    : window.location.host

  return url.toString()
}

/**
 * Converts https:// URL to a Wayfinder-compatible ar:// URL
 * @param url standard URL
 * @returns wayfinder-compatible URL
 */
export const convertToWayfinderUrl = (url: string): `ar://${string}` => {
  return url
    .substring(0, url.length)
    .replace('https://', 'ar://')
    .replace('.arweave.net', '')
    .replace(/\/+$/, '') as `ar://${string}`
}
