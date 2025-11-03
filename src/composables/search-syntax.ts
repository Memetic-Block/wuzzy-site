import { ref, computed, type Ref } from 'vue'
import type { TransactionQueryOptions } from './gql'
import { useGraphQL } from './gql'

// Types for search chips
export interface SearchChip {
  id: string
  type: string
  label: string
  value: any
}

export interface TagChipValue {
  name?: string
  value?: string
  values?: string[]
  match?: 'EXACT' | 'WILDCARD' | 'FUZZY_AND' | 'FUZZY_OR'
}

export interface BlockChipValue {
  min?: number
  max?: number
}

// Composable for search syntax parsing and chip management
export function useSearchSyntax() {
  // Get GraphQL helpers
  const { createTagFilter, createRangeFilter } = useGraphQL()
  
  // Reactive state
  const searchChips = ref<SearchChip[]>([])
  const parsedOptions = ref<TransactionQueryOptions>({})
  
  // Computed
  const hasValidQuery = computed(() => {
    return searchChips.value.length > 0 || Object.keys(parsedOptions.value).length > 0
  })

  // Parse a full query string into parts, handling quotes properly
  function parseQueryString(queryString: string): string[] {
    const parts: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < queryString.length) {
      const char = queryString[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim())
          current = ''
        }
      } else {
        current += char
      }
      i++
    }
    
    if (current.trim()) {
      parts.push(current.trim())
    }
    
    // If no parts found, treat the entire input as a single search term
    if (parts.length === 0 && queryString.trim().includes(':')) {
      parts.push(queryString.trim())
    }
    
    return parts
  }

  // Parse a single query term into a chip
  function parseQueryTerm(term: string): SearchChip | null {
    const [key, ...valueParts] = term.split(':')
    const value = valueParts.join(':').replace(/^"|"$/g, '') // Remove surrounding quotes only
    
    if (!key || !value) return null
    
    const chipId = `chip-${Date.now()}-${Math.random()}`
    
    switch (key.toLowerCase()) {
      case 'owner':
      case 'owners':
        return {
          id: chipId,
          type: 'owners',
          label: `Owner: ${value}`,
          value: [value.trim()]
        }
        
      case 'recipient':
      case 'recipients':
        return {
          id: chipId,
          type: 'recipients',
          label: `Recipient: ${value}`,
          value: [value.trim()]
        }
        
      case 'id':
      case 'ids':
        return {
          id: chipId,
          type: 'ids',
          label: `ID: ${value}`,
          value: [value.trim()]
        }
        
      case 'tag':
        return parseTagChip(chipId, value)
        
      case 'first':
      case 'limit':
        const firstValue = parseInt(value)
        if (!isNaN(firstValue) && firstValue > 0) {
          return {
            id: chipId,
            type: 'first',
            label: `Limit: ${Math.min(firstValue, 100)}`,
            value: Math.min(firstValue, 100)
          }
        }
        break
        
      case 'block':
      case 'height':
        return parseBlockChip(chipId, value)
        
      case 'bundled':
      case 'bundledin':
        return {
          id: chipId,
          type: 'bundledIn',
          label: `Bundled In: ${value}`,
          value: [value.trim()]
        }
        
      case 'sort':
        if (value.toLowerCase() === 'asc' || value.toLowerCase() === 'height_asc') {
          return {
            id: chipId,
            type: 'sort',
            label: 'Sort: Height ASC',
            value: 'HEIGHT_ASC'
          }
        } else if (value.toLowerCase() === 'desc' || value.toLowerCase() === 'height_desc') {
          return {
            id: chipId,
            type: 'sort',
            label: 'Sort: Height DESC',
            value: 'HEIGHT_DESC'
          }
        }
        break
    }
    
    return null
  }

  // Parse tag-specific syntax
  function parseTagChip(chipId: string, value: string): SearchChip | null {
    if (!value.includes('=')) return null
    
    const equalIndex = value.indexOf('=')
    const tagName = value.substring(0, equalIndex).trim()
    let tagValue = value.substring(equalIndex + 1).trim()
    let match: 'EXACT' | 'WILDCARD' | 'FUZZY_OR' = 'EXACT'
    
    // Detect match type
    if (tagValue.includes('*')) {
      match = 'WILDCARD'
    } else if (tagValue.startsWith('"') && tagValue.endsWith('"')) {
      match = 'EXACT'
      tagValue = tagValue.slice(1, -1) // Remove quotes
    } else if (tagValue.includes(',')) {
      match = 'FUZZY_OR'
    }
    
    const matchSuffix = match !== 'EXACT' ? ` (${match.toLowerCase().replace('_', ' ')})` : ''
    const displayName = tagName || '*'
    
    if (match === 'FUZZY_OR') {
      const values = tagValue.split(',').map(v => v.trim()).filter(v => v)
      return {
        id: chipId,
        type: 'tags',
        label: `${displayName}: ${values.join(', ')}${matchSuffix}`,
        value: { name: tagName || undefined, values, match } as TagChipValue
      }
    } else {
      return {
        id: chipId,
        type: 'tags',
        label: `${displayName}: ${tagValue}${matchSuffix}`,
        value: { name: tagName || undefined, value: tagValue, match } as TagChipValue
      }
    }
  }

  // Parse block-specific syntax
  function parseBlockChip(chipId: string, value: string): SearchChip | null {
    if (value.includes('-')) {
      const [min, max] = value.split('-').map(v => parseInt(v.trim()))
      if (!isNaN(min) || !isNaN(max)) {
        return {
          id: chipId,
          type: 'block',
          label: `Block: ${min || '*'}-${max || '*'}`,
          value: { min: isNaN(min) ? undefined : min, max: isNaN(max) ? undefined : max } as BlockChipValue
        }
      }
    } else {
      const blockHeight = parseInt(value)
      if (!isNaN(blockHeight)) {
        return {
          id: chipId,
          type: 'block',
          label: `Block: ${blockHeight}`,
          value: blockHeight
        }
      }
    }
    return null
  }

  // Parse multiple query terms into chips
  function parseQueryToChips(queryString: string): SearchChip[] {
    const parts = parseQueryString(queryString)
    const chips: SearchChip[] = []
    
    for (const part of parts) {
      const chip = parseQueryTerm(part)
      if (chip) {
        // Check if chip already exists (avoid duplicates)
        const exists = chips.some(existing =>
          existing.type === chip.type &&
          JSON.stringify(existing.value) === JSON.stringify(chip.value)
        )
        
        if (!exists) {
          chips.push(chip)
        }
      }
    }
    
    return chips
  }

  // Convert chips back to TransactionQueryOptions
  function buildOptionsFromChips(chips: SearchChip[]): TransactionQueryOptions {
    const options: TransactionQueryOptions = {
      sort: 'HEIGHT_DESC' // Default sort
    }
    
    const tagGroupsByName: { [name: string]: SearchChip[] } = {}
    
    // First pass: handle non-tag chips and group tag chips by name
    for (const chip of chips) {
      switch (chip.type) {
        case 'owners':
          options.owners = Array.isArray(chip.value) ? chip.value : [chip.value]
          break
        case 'recipients':
          options.recipients = Array.isArray(chip.value) ? chip.value : [chip.value]
          break
        case 'ids':
          options.ids = Array.isArray(chip.value) ? chip.value : [chip.value]
          break
        case 'bundledIn':
          options.bundledIn = Array.isArray(chip.value) ? chip.value : [chip.value]
          break
        case 'first':
          options.first = chip.value
          break
        case 'after':
          options.after = chip.value
          break
        case 'block':
          if (typeof chip.value === 'object' && (chip.value.min !== undefined || chip.value.max !== undefined)) {
            options.block = createRangeFilter(chip.value.min, chip.value.max)
          } else if (typeof chip.value === 'number') {
            options.block = createRangeFilter(chip.value)
          }
          break
        case 'tags':
          const tagName = chip.value?.name || ''
          if (!tagGroupsByName[tagName]) {
            tagGroupsByName[tagName] = []
          }
          tagGroupsByName[tagName].push(chip)
          break
        case 'sort':
          options.sort = chip.value
          break
      }
    }
    
    // Second pass: process tag groups to handle FUZZY_AND logic
    const tagFilters: any[] = []
    
    for (const [tagName, groupChips] of Object.entries(tagGroupsByName)) {
      if (groupChips.length === 1) {
        // Single chip - use its original match type
        const chip = groupChips[0]
        const chipValue = chip.value as TagChipValue
        
        if (chipValue.match === 'WILDCARD') {
          tagFilters.push({
            name: tagName || undefined,
            values: [chipValue.value || ''],
            match: 'WILDCARD'
          })
        } else if (chipValue.match === 'FUZZY_OR') {
          tagFilters.push({
            name: tagName || undefined,
            values: chipValue.values || [chipValue.value || ''],
            match: 'FUZZY_OR'
          })
        } else {
          // Default exact match
          if (tagName) {
            tagFilters.push(createTagFilter(tagName, [chipValue.value || '']))
          } else {
            // Value-only search
            tagFilters.push({ values: [chipValue.value || ''] })
          }
        }
      } else {
        // Multiple chips with same tag name - automatically becomes FUZZY_AND
        const values = groupChips
          .map(chip => {
            const chipValue = chip.value as TagChipValue
            return chipValue.values || [chipValue.value || '']
          })
          .flat()
          .filter(Boolean)
        
        tagFilters.push({
          name: tagName || undefined,
          values,
          match: 'FUZZY_AND'
        })
        
        // Update chip visual indicators to show they're part of FUZZY_AND
        groupChips.forEach(chip => {
          const chipValue = chip.value as TagChipValue
          chipValue.match = 'FUZZY_AND'
          if (!chip.label.includes('(fuzzy and)')) {
            chip.label = chip.label.replace(/ \(.*\)$/, '') + ' (fuzzy and)'
          }
        })
      }
    }
    
    if (tagFilters.length > 0) {
      options.tags = tagFilters
    }
    
    return options
  }

  // Reconstruct query string from chips for URL updating
  function reconstructQueryFromChips(chips: SearchChip[]): string {
    const queryParts: string[] = []
    
    chips.forEach(chip => {
      switch (chip.type) {
        case 'owners':
          if (Array.isArray(chip.value) && chip.value.length === 1) {
            queryParts.push(`owner:${chip.value[0]}`)
          } else if (Array.isArray(chip.value)) {
            queryParts.push(`owners:${chip.value.join(',')}`)
          }
          break
        case 'recipients':
          if (Array.isArray(chip.value) && chip.value.length === 1) {
            queryParts.push(`recipient:${chip.value[0]}`)
          } else if (Array.isArray(chip.value)) {
            queryParts.push(`recipients:${chip.value.join(',')}`)
          }
          break
        case 'ids':
          if (Array.isArray(chip.value) && chip.value.length === 1) {
            queryParts.push(`id:${chip.value[0]}`)
          } else if (Array.isArray(chip.value)) {
            queryParts.push(`ids:${chip.value.join(',')}`)
          }
          break
        case 'tags':
          const tagValue = chip.value as TagChipValue
          if (tagValue.name && tagValue.value) {
            queryParts.push(`tag:${tagValue.name}=${tagValue.value}`)
          } else if (tagValue.name && tagValue.values) {
            queryParts.push(`tag:${tagValue.name}=${tagValue.values.join(',')}`)
          } else if (tagValue.value) {
            queryParts.push(`tag:=${tagValue.value}`)
          }
          break
        case 'first':
          queryParts.push(`first:${chip.value}`)
          break
        case 'block':
          if (typeof chip.value === 'object' && (chip.value.min !== undefined || chip.value.max !== undefined)) {
            queryParts.push(`block:${chip.value.min || ''}-${chip.value.max || ''}`)
          } else {
            queryParts.push(`block:${chip.value}`)
          }
          break
        case 'bundledIn':
          if (Array.isArray(chip.value)) {
            queryParts.push(`bundled:${chip.value.join(',')}`)
          } else {
            queryParts.push(`bundled:${chip.value}`)
          }
          break
        case 'sort':
          queryParts.push(`sort:${chip.value}`)
          break
      }
    })
    
    return queryParts.join(' ')
  }

  // Add a new chip
  function addChip(chip: SearchChip) {
    // Check if chip already exists
    const exists = searchChips.value.some(existing =>
      existing.type === chip.type &&
      JSON.stringify(existing.value) === JSON.stringify(chip.value)
    )
    
    if (!exists) {
      searchChips.value.push(chip)
      updateParsedOptions()
    }
  }

  // Remove a chip by ID
  function removeChip(chipId: string) {
    searchChips.value = searchChips.value.filter(chip => chip.id !== chipId)
    updateParsedOptions()
  }

  // Clear all chips
  function clearAllChips() {
    searchChips.value = []
    parsedOptions.value = {}
  }

  // Update parsed options from current chips
  function updateParsedOptions() {
    parsedOptions.value = buildOptionsFromChips(searchChips.value)
  }

  // Set chips from a query string
  function setChipsFromQuery(queryString: string) {
    if (!queryString.trim()) {
      clearAllChips()
      return
    }
    
    const newChips = parseQueryToChips(queryString)
    searchChips.value = newChips
    updateParsedOptions()
  }

  // Add chips from a query string (append to existing)
  function addChipsFromQuery(queryString: string) {
    if (!queryString.trim()) return
    
    const newChips = parseQueryToChips(queryString)
    newChips.forEach(chip => addChip(chip))
  }

  return {
    // State
    searchChips: searchChips as Ref<SearchChip[]>,
    parsedOptions: parsedOptions as Ref<TransactionQueryOptions>,
    
    // Computed
    hasValidQuery,
    
    // Parsing functions
    parseQueryString,
    parseQueryTerm,
    parseQueryToChips,
    buildOptionsFromChips,
    reconstructQueryFromChips,
    
    // Chip management
    addChip,
    removeChip,
    clearAllChips,
    updateParsedOptions,
    setChipsFromQuery,
    addChipsFromQuery
  }
}
