<template>
  <div class="about-page">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header Section -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold mb-4">About Wuzzy Search</h1>
        <p class="text-xl leading-relaxed">
          A decentralized search engine built on AO and Arweave
        </p>
      </div>

      <!-- Introduction -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold mb-6">
          Revolutionary Decentralized Search
        </h2>
        <p class="text-lgleading-relaxed mb-4">
          Wuzzy Search represents a groundbreaking approach to web indexing and
          search, built on the AO (Actor Oriented) protocol and the Arweave
          ecosystem. Unlike traditional search engines that rely on centralized
          infrastructure, Wuzzy implements a fully decentralized architecture
          where autonomous agents crawl, index, and serve search results in a
          distributed manner.
        </p>
        <p class="text-lg leading-relaxed">
          This creates a censorship-resistant, globally accessible search
          platform that operates without centralized control points while
          ensuring that indexed content remains permanently accessible on the
          permaweb.
        </p>
      </section>

      <!-- Architecture -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          System Architecture
        </h2>

        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <div class="bg-green-50 dark:bg-secondary/30 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-foreground mb-3">
              🏠 Wuzzy Nest
            </h3>
            <p class="mb-3">
              The central search index that acts as the repository for all
              crawled content.
            </p>
            <ul
              class="text-sm text-gray-700 dark:text-secondary-foreground/70 space-y-1"
            >
              <li>Document database management</li>
              <li>Advanced search algorithms</li>
              <li>Access control mechanisms</li>
              <li>RESTful query interface</li>
            </ul>
          </div>

          <div class="bg-orange-50 dark:bg-secondary/30 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-foreground mb-3">
              🕷️ Wuzzy Crawler
            </h3>
            <p class="mb-3">
              Autonomous processes that fetch, parse, and process web content.
            </p>
            <ul
              class="text-sm text-gray-700 dark:text-secondary-foreground/70 space-y-1"
            >
              <li>Independent operation</li>
              <li>Domain-specific specialization</li>
              <li>Intelligent link discovery</li>
              <li>Content processing pipeline</li>
            </ul>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-secondary/30 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-foreground mb-3">
            Hub-and-Spoke Model
          </h3>
          <p class="text-gray-700 dark:text-secondary-foreground/70 mb-3">
            The system employs a distributed architecture where:
          </p>
          <ul class="text-gray-700 dark:text-secondary-foreground/70 space-y-2">
            <li>
              <strong>Nest</strong> serves as the central hub for document
              storage and search operations
            </li>
            <li>
              <strong>Multiple Crawlers</strong> act as distributed spokes, each
              handling specific domains
            </li>
            <li>
              <strong>Horizontal scaling</strong> by adding more Crawlers or
              specialized Nests
            </li>
            <li>
              <strong>Independent operation</strong> with each component as its
              own AO process
            </li>
          </ul>
        </div>
      </section>

      <!-- Search Algorithms -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          Advanced Search Algorithms
        </h2>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Simple Search
            </h3>
            <p class="text-secondary-foreground/80 mb-3">
              Fast, straightforward text matching optimized for real-time
              interfaces.
            </p>
            <ul
              class="text-sm text-gray-700 dark:text-secondary-foreground/70 space-y-1"
            >
              <li>Case-insensitive pattern matching</li>
              <li>Term frequency ranking</li>
              <li>Context highlighting</li>
              <li>Optimized for speed</li>
            </ul>
          </div>

          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold text-foreground mb-3">
              BM25 Algorithm
            </h3>
            <p class="text-secondary-foreground/80 mb-3">
              Sophisticated relevance ranking based on term frequency and
              document length.
            </p>
            <ul
              class="text-sm text-gray-700 dark:text-secondary-foreground/70 space-y-1"
            >
              <li>Inverse Document Frequency (IDF)</li>
              <li>Document length normalization</li>
              <li>Configurable parameters</li>
              <li>Industry-standard relevance</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Protocol Support -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          Comprehensive Protocol Support
        </h2>

        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-foreground mb-3">
              Traditional Web
            </h3>
            <ul
              class="text-gray-700 dark:text-secondary-foreground/70 space-y-2"
            >
              <li><strong>HTTP/HTTPS:</strong> Standard web crawling</li>
              <li>
                <strong>HTML Processing:</strong> Full parsing with metadata
                extraction
              </li>
              <li>
                <strong>Content Types:</strong> HTML, plain text, with
                extensible support
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-foreground mb-3">
              Permaweb Integration
            </h3>
            <ul
              class="text-gray-700 dark:text-secondary-foreground/70 space-y-2"
            >
              <li><strong>ARNS:</strong> Decentralized domain resolution</li>
              <li><strong>Direct Arweave:</strong> Transaction ID access</li>
              <li>
                <strong>Permanent Storage:</strong> All content archived forever
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          Key Features
        </h2>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center p-6">
            <div class="text-3xl mb-3">🔒</div>
            <h3 class="text-lg font-semibold mb-2">Censorship Resistant</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              No central control points or single points of failure
            </p>
          </div>

          <div class="text-center p-6">
            <div class="text-3xl mb-3">♾️</div>
            <h3 class="text-lg font-semibold mb-2">Permanent Archive</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              Content stored permanently on Arweave blockchain
            </p>
          </div>

          <div class="text-center p-6">
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="text-lg font-semibold mb-2">Autonomous Operation</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              Self-managing crawlers and search processes
            </p>
          </div>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center p-6">
            <div class="text-3xl mb-3">🔄</div>
            <h3 class="text-lg font-semibold mb-2">Horizontally Scalable</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              Add more crawlers and nests as needed
            </p>
          </div>

          <div class="text-center p-6">
            <div class="text-3xl mb-3">🛡️</div>
            <h3 class="text-lg font-semibold mb-2">Role-Based Security</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              Comprehensive access control and permissions
            </p>
          </div>

          <div class="text-center p-6">
            <div class="text-3xl mb-3">🌐</div>
            <h3 class="text-lg font-semibold mb-2">Multi-Protocol</h3>
            <p class="text-sm text-gray-600 dark:text-secondary-foreground/50">
              Supports traditional web and permaweb protocols
            </p>
          </div>
        </div>
      </section>

      <!-- Future Vision -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          Future Vision
        </h2>
        <div class="bg-purple-50 dark:bg-secondary/30 rounded-lg p-6">
          <p
            class="text-lg text-gray-700 dark:text-secondary-foreground/70 leading-relaxed mb-4"
          >
            Wuzzy Search establishes new patterns for building resilient,
            scalable infrastructure on blockchain-based platforms. As the
            permaweb ecosystem continues to evolve, Wuzzy provides essential
            infrastructure for content discovery and access.
          </p>
          <div class="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 class="font-semibold text-foreground mb-2">
                Planned Enhancements
              </h4>
              <ul
                class="text-sm text-gray-600 dark:text-secondary-foreground/50 space-y-1"
              >
                <li>Multi-media content support</li>
                <li>AI-powered content classification</li>
                <li>Semantic search capabilities</li>
                <li>Auto-scaling mechanisms</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-2">Impact</h4>
              <ul
                class="text-sm text-gray-600 dark:text-secondary-foreground/50 space-y-1"
              >
                <li>Foundational component for decentralized web</li>
                <li>Alternative to traditional search architectures</li>
                <li>Lasting digital archive of human knowledge</li>
                <li>Enables next-generation dApps</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Technical Details -->
      <section class="mb-12">
        <h2 class="text-3xl font-semibold text-foreground mb-6">
          Technical Implementation
        </h2>
        <div class="bg-gray-50 dark:bg-secondary/30 rounded-lg p-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-foreground mb-3">
                Built on AO Protocol
              </h4>
              <ul
                class="text-sm text-gray-600 dark:text-secondary-foreground/50 space-y-1"
              >
                <li>Message-based communication</li>
                <li>State persistence on Arweave</li>
                <li>Parallel execution capabilities</li>
                <li>Built-in security model</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-foreground mb-3">
                Performance Features
              </h4>
              <ul
                class="text-sm text-gray-600 dark:text-secondary-foreground/50 space-y-1"
              >
                <li>RESTful query interface</li>
                <li>Pagination support</li>
                <li>Memory-efficient storage</li>
                <li>Configurable algorithms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  /* background-color: #fafafa; */
}

.container {
  line-height: 1.6;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
}

h1,
h2,
h3,
h4 {
  color: var(--foreground);
}

p {
  color: var(--secondary-foreground);
  opacity: 0.8;
}

/* .bg-blue-50 {
  background-color: #eff6ff;
} */

/* .bg-green-50 {
  background-color: #f0fdf4;
} */

/* .bg-orange-50 {
  background-color: #fff7ed;
} */

/* .bg-purple-50 {
  background-color: #faf5ff;
} */
</style>
