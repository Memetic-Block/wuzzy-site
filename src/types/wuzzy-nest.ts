export interface WuzzyNestState {
  AverageDocumentTermLength: number
  Initialized: 'true' | 'false'
  TotalDocuments: number
  TotalTermCount: number
}

export interface WuzzyNestInfo {
  owner: string
  average_document_term_length: number
  total_content_length: number
  total_crawlers: number
  total_documents: number
  total_term_count: number

  [key: `crawler_${number}_creator`]: string
  [key: `crawler_${number}_id`]: string
  [key: `crawler_${number}_name`]: string
  [key: `crawler_${number}_owner`]: string

  [key: `document_${number}_id`]: string
  [key: `document_${number}_url`]: string
  [key: `document_${number}_title`]: string | undefined
  [key: `document_${number}_description`]: string | undefined
  [key: `document_${number}_content_length`]: number
  [key: `document_${number}_content_type`]: string
  [key: `document_${number}_term_count`]: number
  [key: `document_${number}_last_crawled_at`]: string
}

export interface WuzzyNestSearchResults {
  search_type: string
  total_hits: number
  has_more: 'true' | 'false'
  from: number
  page_size: number
  result_count: number

  [key: `${number}_docid`]: string
  [key: `${number}_title`]: string | undefined
  [key: `${number}_description`]: string | undefined
  [key: `${number}_content`]: string
  [key: `${number}_count`]: number
  [key: `${number}_score`]: number
}

export interface WuzzyNestSearchHit {
  id: string
  url: string
  title: string | undefined
  description: string | undefined
  content: string
  count: number
  score: number
}

export const MOCK_SEARCH_RESULTS = {
  "Hits": [
    {
      "count": 1.0000000000000,
      "doc": {
        "Content": "Wuzzy",
        "ContentType": "text/plain",
        "DocumentId": "https://wuzzy.io/doc1",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563460329585e+9,
        "Path": "/doc1",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 5.0000000000000,
        "URL": "https://wuzzy.io/doc1"
      },
      "score": 0.10419692325373
    },
    {
      "count": 1.0000000000000,
      "doc": {
        "Content": "Wuzzy S",
        "ContentType":
        "text/plain",
        "DocumentId": "https://wuzzy.io/doc2",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563463357475e+9,
        "Path": "/doc2",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 7.0000000000000,
        "URL": "https://wuzzy.io/doc2"
      },
      "score": 9.7592892906662e-2
    },
    {
      "count": 3.0000000000000,
      "doc": {
        "Content": "Wuzzy Wuzzy Wuzzy Search Search Search",
        "ContentType": "text/plain",
        "DocumentId": "https://wuzzy.io/doc6",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563463797543e+9,
        "Path": "/doc6",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 38.000000000000,
        "URL": "https://wuzzy.io/doc6"
      },
      "score": 9.2081001945156e-2
    },
    {
      "count": 2.0000000000000,
      "doc": {
        "Content": "Wuzzy Wuzzy Search Search",
        "ContentType": "text/plain",
        "DocumentId": "https://wuzzy.io/doc5",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563463722625e+9,
        "Path": "/doc5",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 25.000000000000,
        "URL": "https://wuzzy.io/doc5"
      },
      "score": 8.9988251900948e-2
    },
    {
      "count": 1.0000000000000,
      "doc": {
        "Content": "Wuzzy Search",
        "ContentType": "text/plain",
        "DocumentId": "https://wuzzy.io/doc4",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563463619018e+9,
        "Path": "/doc4",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 12.000000000000,
        "URL": "https://wuzzy.io/doc4"
      },
      "score": 8.4244320928547e-2
    },
    {
      "count": 1.0000000000000,
      "doc": {
        "Content": "Wuzzy AO Search",
        "ContentType": "text/plain",
        "DocumentId": "https://wuzzy.io/doc3",
        "Domain": "wuzzy.io",
        "LastCrawledAt": 1.7563463533543e+9,
        "Path": "/doc3",
        "Protocol": "https",
        "SubmittedBy": "uMTMAOXzllYqxa5veYJeVnQ44P5Mfhys3y0nea3oQ6Q",
        "TermCount": 15.000000000000,
        "URL": "https://wuzzy.io/doc3"
      },
      "score": 7.7855004453629e-2
    }
  ],
  "SearchType": "bm25",
  "TotalCount": 6.0000000000000
}
