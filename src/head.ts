export const metaTags = {
  title: 'Wuzzy Search',
  description:
    'Wuzzy Search is a decentralized search engine application built on the Arweave and AO',
  keywords: ['wuzzy', 'search', 'ao', 'permaweb', 'seo', 'discover']
}

declare const process: any

const baseMeta: any = [
  { charset: 'utf-8' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  },
  {
    name: 'description',
    content: metaTags.description
  }
]

export const headOptions = {
  titleTemplate: '%s | Wuzzy Search',
  title: metaTags.title,
  meta: baseMeta.concat([
    { property: 'og:site_name', content: 'Wuzzy Search' },
    { property: 'og:title', content: 'Wuzzy Search' },
    { property: 'og:type', content: 'website' },
    {
      property: 'og:image',
      content: 'https://stage.wuzzy.io/wuzzy-og.png'
    },

    //twitter
    { name: 'twitter:site', content: '@wuzzysearch' },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:image',
      content: 'https://stage.wuzzy.io/wuzzy-og.png'
    },
    { name: 'twitter:title', content: 'Wuzzy Search' },
    {
      name: 'twitter:description',
      content: 'A decentralized search engine built on AO and Arweave.'
    },

    {
      name: 'keywords',
      content: metaTags.keywords
    }
  ]),
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: 'https://stage.wuzzy.io/wuzzy-favicon.png'
    }
  ]
}
