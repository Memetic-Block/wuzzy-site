export interface WuzzyNestRegistryInfo {
  total_nests: number
  [key: `nest_${number}_id`]: string
  [key: `nest_${number}_owner`]: string
}
