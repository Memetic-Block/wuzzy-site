/**
 * Transactions withheld from GraphQL search results in response to takedown
 * notices. Wuzzy does not host this data: the transactions remain on Arweave
 * and stay reachable by anyone holding the id, they are simply not surfaced by
 * search. Removal here is a courtesy, not hosting compliance.
 *
 * Entries are grouped by the notice that produced them so an id can be traced
 * back to its source, and so a whole notice can be lifted if it is retracted or
 * successfully countered.
 */
const notices: { reference: string; ids: string[] }[] = [
  {
    reference: '2026-08-21',
    ids: [
      'GVTWJUbg27XLsFEMctFUL45Z3beIyDWfKuhTe3Sp_w0',
      'MyMFWWJkSuOoi2MehJ1TDC2kSLk_Twwl57WdPe5ceGg',
      'zbfExgTitr6LZ9Cu8lv3P8hjDr56uYyEIVkYU1OdZ-0'
    ]
  }
]

const withheldIds = new Set(notices.flatMap(({ ids }) => ids))

/**
 * Whether a transaction id is covered by a takedown notice
 */
export function isWithheld(id: string): boolean {
  return withheldIds.has(id)
}

/**
 * Drop takedown-covered transactions from a set of GraphQL result edges
 */
export function filterWithheld<T extends { node: { id: string } }>(
  edges: T[]
): T[] {
  if (withheldIds.size === 0) {
    return edges
  }

  return edges.filter(({ node }) => !withheldIds.has(node.id))
}
