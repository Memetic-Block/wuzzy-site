export interface WuzzyCrawlerInfo {
  owner: string
  nest_id: string
  gateway: string
  total_crawl_tasks: number
  crawl_queue_size: number
  crawled_urls_memory_size: number

  [key: `crawl_queue_item_${number}_domain`]: string
  [key: `crawl_queue_item_${number}_url`]: string

  [key: `crawl_task_${number}_url`]: string
  [key: `crawl_task_${number}_added_by`]: string
  [key: `crawl_task_${number}_domain`]: string
  [key: `crawl_task_${number}_submitted_url`]: string

  [key: `crawled_url_${number}`]: string
}
