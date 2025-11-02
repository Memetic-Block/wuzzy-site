<template>
  <div class="audio-search-page">
    <div class="page-header">
      <h1>Audio Search</h1>
      <p class="subtitle">
        Discover and browse audio content stored on Arweave. 
        Search by <code>owner</code>, <code>tags</code>, or other metadata to find music, podcasts, and audio files.
      </p>
    </div>

    <AudioSearch ref="audioSearchRef" />

    <div class="documentation-section">
      <details>
        <summary>Audio Search Guide</summary>
        
        <div class="docs-content">
          <div class="clickable-notice">
            <p>💡 <strong>Pro tip:</strong> All code examples below are clickable! Click any example to automatically fill the search bar and try it out.</p>
          </div>
          
          <h3>Common Audio Searches</h3>
          
          <div class="param-section">
            <h4>Search by Audio Type</h4>
            <p>Find audio files by their content type</p>
            <div class="examples">
              <code @click="setExampleQuery('tag:Content-Type=audio/mpeg first:20')" class="clickable-example">tag:Content-Type=audio/mpeg first:20</code>
              <code @click="setExampleQuery('tag:Content-Type=audio/wav first:15')" class="clickable-example">tag:Content-Type=audio/wav first:15</code>
              <code @click="setExampleQuery('tag:Content-Type=audio/ogg first:15')" class="clickable-example">tag:Content-Type=audio/ogg first:15</code>
              <code @click="setExampleQuery('tag:Content-Type=audio/flac first:10')" class="clickable-example">tag:Content-Type=audio/flac first:10</code>
            </div>
          </div>

          <div class="param-section">
            <h4>Search by Owner</h4>
            <p>Find audio files uploaded by specific wallet addresses</p>
            <div class="examples">
              <code @click="setExampleQuery('owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g tags:Content-Type=audio/mpeg first:15')" class="clickable-example">owner:wallet-address tags:Content-Type=audio/mpeg</code>
            </div>
          </div>

          <div class="param-section">
            <h4>Search by Application</h4>
            <p>Find audio from specific applications or platforms</p>
            <div class="examples">
              <code @click="setExampleQuery('tags:App-Name=ArDrive tags:Content-Type=audio/mpeg first:15')" class="clickable-example">tags:App-Name=ArDrive</code>
              <code @click="setExampleQuery('tags:Type=music tags:Genre=electronic first:20')" class="clickable-example">tags:Type=music tags:Genre=electronic</code>
              <code @click="setExampleQuery('tags:Protocol=AO tags:Content-Type=audio/wav first:10')" class="clickable-example">tags:Protocol=AO</code>
            </div>
          </div>

          <div class="param-section">
            <h4>Filter by Block Height</h4>
            <p>Find audio from specific time periods using block ranges</p>
            <div class="examples">
              <code @click="setExampleQuery('block:1300000-1400000 tags:Content-Type=audio/mpeg first:15')" class="clickable-example">block:1300000-1400000 tags:Content-Type=audio/mpeg</code>
            </div>
          </div>

          <h3>Advanced Audio Searches</h3>
          
          <div class="complex-examples">
            <div class="example-item">
              <h4>Music by Genre</h4>
              <code @click="setExampleQuery('tags:Type=music tags:Genre=jazz first:20')" class="clickable-example">tags:Type=music tags:Genre=jazz first:20</code>
            </div>
            
            <div class="example-item">
              <h4>Podcast Episodes</h4>
              <code @click="setExampleQuery('tags:Type=podcast tags:Content-Type=audio/mpeg first:24')" class="clickable-example">tags:Type=podcast tags:Content-Type=audio/mpeg first:24</code>
            </div>
            
            <div class="example-item">
              <h4>High Quality Audio</h4>
              <code @click="setExampleQuery('tags:Content-Type=audio/flac tags:Quality=lossless first:15')" class="clickable-example">tags:Content-Type=audio/flac tags:Quality=lossless first:15</code>
            </div>
          </div>

          <h3>Tips for Audio Search</h3>
          <ul class="tips-list">
            <li>Use <code>first:N</code> to control how many audio files to load (max 100)</li>
            <li>Combine multiple criteria: <code @click="setExampleQuery('owner:address tags:Content-Type=audio/mpeg first:20')" class="clickable-example">owner:address tags:Content-Type=audio/mpeg</code></li>
            <li>Audio files are displayed with playback controls and waveform visualization</li>
            <li>Click on any audio item to start playback</li>
            <li>Audio supports MP3, WAV, OGG, FLAC, and other web-compatible formats</li>
            <li>Failed audio loads are automatically hidden</li>
            <li>Use "Load More" to browse additional results</li>
            <li>Look for metadata tags like Artist, Album, Title, Genre for music content</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AudioSearch from '../components/AudioSearchSimple.vue'

const audioSearchRef = ref<InstanceType<typeof AudioSearch>>()

// Function to set example query
function setExampleQuery(query: string) {
  audioSearchRef.value?.setSearchQuery(query)
  // Scroll to search component
  document.querySelector('.audio-search')?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  })
}
</script>

<style scoped>
.audio-search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 0;
}

.subtitle code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}

.documentation-section {
  margin-top: 3rem;
}

.documentation-section details {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
}

.documentation-section summary {
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 0.25rem;
}

.documentation-section summary:hover {
  background: #f3f4f6;
}

.docs-content {
  margin-top: 1rem;
}

.clickable-notice {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.param-section {
  margin-bottom: 2rem;
}

.param-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.param-section p {
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.clickable-example {
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-block;
  width: fit-content;
}

.clickable-example:hover {
  background: #e5e7eb;
}

.complex-examples {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.example-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background: white;
}

.example-item h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.tips-list {
  padding-left: 1.5rem;
}

.tips-list li {
  margin-bottom: 0.5rem;
  color: #374151;
}

.tips-list code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.tips-list .clickable-example {
  cursor: pointer;
  transition: background-color 0.2s;
}

.tips-list .clickable-example:hover {
  background: #e5e7eb;
}
</style>