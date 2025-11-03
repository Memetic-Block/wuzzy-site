<template>
  <div v-if="currentTrack" class="global-audio-player" :class="{ 'minimized': isMinimized }">
    <div class="player-content">
      <!-- Track Info Section -->
      <div class="track-info">
        <div class="track-artwork">
          <img 
            v-if="currentTrack.artwork"
            :src="currentTrack.artwork"
            :alt="`${currentTrack.title} artwork`"
            class="artwork-image"
            @error="handleArtworkError"
          />
          <div v-else class="default-artwork">
            🎵
          </div>
        </div>
        <div class="track-details">
          <h4 class="track-title">{{ currentTrack.title }}</h4>
          <p class="track-artist">{{ currentTrack.artist }}</p>
        </div>
      </div>

      <!-- Player Controls Section -->
      <div class="player-controls">
        <div class="control-buttons">
          <button 
            @click="previousTrack"
            class="control-btn"
            :disabled="!hasPreviousTrack"
            title="Previous track"
          >
            ⏮
          </button>
          
          <button 
            @click="togglePlayPause"
            class="play-pause-btn"
            :class="{ 'playing': isPlaying }"
            title="Play/Pause"
          >
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          
          <button 
            @click="nextTrack"
            class="control-btn"
            :disabled="!hasNextTrack"
            title="Next track"
          >
            ⏭
          </button>
        </div>

        <div class="progress-section">
          <span class="time-current">{{ formatTime(currentTime) }}</span>
          <div class="progress-container">
            <input
              type="range"
              :value="progressPercentage"
              @input="seek"
              @mousedown="startSeeking"
              @mouseup="stopSeeking"
              class="progress-slider"
              min="0"
              max="100"
            />
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
          </div>
          <span class="time-duration">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume and Actions Section -->
      <div class="player-actions">
        <div class="volume-control">
          <button @click="toggleMute" class="volume-btn" title="Mute/Unmute">
            {{ isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊' }}
          </button>
          <input
            type="range"
            :value="volume * 100"
            @input="setVolume"
            class="volume-slider"
            min="0"
            max="100"
          />
        </div>
        
        <div class="action-buttons">
          <button 
            @click="toggleShuffle"
            class="action-btn"
            :class="{ 'active': isShuffleOn }"
            title="Shuffle"
          >
            🔀
          </button>
          
          <button 
            @click="toggleRepeat"
            class="action-btn"
            :class="{ 'active': repeatMode !== 'none' }"
            title="Repeat"
          >
            {{ repeatMode === 'one' ? '🔂' : '🔁' }}
          </button>
          
          <button 
            @click="downloadTrack"
            class="action-btn"
            title="Download"
          >
            💾
          </button>
          
          <button 
            @click="toggleHistory"
            class="action-btn"
            :class="{ 'active': showHistory }"
            title="Play History"
          >
            📜
          </button>
          
          <button 
            @click="minimizePlayer"
            class="action-btn"
            title="Minimize"
          >
            {{ isMinimized ? '⬆' : '⬇' }}
          </button>
          
          <button 
            @click="closePlayer"
            class="action-btn close-btn"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Play History Dropdown -->
    <div v-if="showHistory" class="history-dropdown">
      <div class="history-header">
        <h4>Recently Played</h4>
        <button @click="clearHistory" class="clear-history-btn" title="Clear History">
          🗑️
        </button>
      </div>
      
      <div v-if="playHistory.length === 0" class="history-empty">
        <p>No tracks played yet</p>
      </div>
      
      <div v-else class="history-list">
        <div 
          v-for="(track, index) in playHistory" 
          :key="`${track.id}-${index}`"
          class="history-item"
          @click="playHistoryTrack(track)"
        >
          <div class="history-track-info">
            <div class="history-artwork">
              <img 
                v-if="track.artwork"
                :src="track.artwork"
                :alt="`${track.title} artwork`"
                class="history-artwork-image"
                @error="handleArtworkError"
              />
              <div v-else class="history-default-artwork">🎵</div>
            </div>
            
            <div class="history-details">
              <span class="history-title">{{ track.title }}</span>
              <span class="history-artist">{{ track.artist }}</span>
            </div>
          </div>
          
          <div class="history-actions">
            <button 
              @click.stop="playHistoryTrack(track)"
              class="history-play-btn"
              :class="{ 'playing': currentTrack?.id === track.id }"
              :title="currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'"
            >
              {{ currentTrack?.id === track.id && isPlaying ? '⏸' : '▶' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioElement"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @ended="handleTrackEnded"
      @error="handleAudioError"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      preload="metadata"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  artwork?: string
  url: string
  duration?: number
}

// Props
const props = defineProps<{
  playlist?: Track[]
}>()

// Emits
const emit = defineEmits<{
  trackChanged: [track: Track | null]
  playlistUpdated: [playlist: Track[]]
}>()

// Refs
const audioElement = ref<HTMLAudioElement>()
const currentTrack = ref<Track | null>(null)
const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const isMinimized = ref(false)
const isSeeking = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const previousVolume = ref(1)
const isShuffleOn = ref(false)
const repeatMode = ref<'none' | 'one' | 'all'>('none')
const playlist = ref<Track[]>(props.playlist || [])
const playHistory = ref<Track[]>([])
const maxHistorySize = 50 // Keep last 50 played tracks
const showHistory = ref(false)

// Computed
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const hasPreviousTrack = computed(() => {
  return playlist.value.length > 1 && currentTrackIndex.value > 0
})

const hasNextTrack = computed(() => {
  return playlist.value.length > 1 && currentTrackIndex.value < playlist.value.length - 1
})

// Watch for playlist changes
watch(() => props.playlist, (newPlaylist) => {
  if (newPlaylist) {
    playlist.value = [...newPlaylist]
  }
}, { deep: true })

// Methods
function playTrack(track: Track, trackList?: Track[]) {
  if (trackList) {
    playlist.value = [...trackList]
    currentTrackIndex.value = trackList.findIndex(t => t.id === track.id)
  } else if (!playlist.value.find(t => t.id === track.id)) {
    playlist.value.push(track)
    currentTrackIndex.value = playlist.value.length - 1
  } else {
    currentTrackIndex.value = playlist.value.findIndex(t => t.id === track.id)
  }

  currentTrack.value = track
  
  if (audioElement.value) {
    audioElement.value.src = track.url
    audioElement.value.load()
    audioElement.value.play()
  }
  
  // Add to play history
  addToHistory(track)
  
  emit('trackChanged', track)
}

function togglePlayPause() {
  if (!audioElement.value || !currentTrack.value) return
  
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

function previousTrack() {
  if (!hasPreviousTrack.value) return
  
  const prevIndex = currentTrackIndex.value - 1
  const prevTrack = playlist.value[prevIndex]
  
  if (prevTrack) {
    currentTrackIndex.value = prevIndex
    playTrack(prevTrack)
  }
}

function nextTrack() {
  if (isShuffleOn.value && playlist.value.length > 1) {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * playlist.value.length)
    } while (randomIndex === currentTrackIndex.value)
    
    currentTrackIndex.value = randomIndex
    playTrack(playlist.value[randomIndex])
  } else if (hasNextTrack.value) {
    const nextIndex = currentTrackIndex.value + 1
    const nextTrackItem = playlist.value[nextIndex]
    
    if (nextTrackItem) {
      currentTrackIndex.value = nextIndex
      playTrack(nextTrackItem)
    }
  } else if (repeatMode.value === 'all' && playlist.value.length > 0) {
    currentTrackIndex.value = 0
    playTrack(playlist.value[0])
  }
}

function seek(event: Event) {
  if (!audioElement.value || !duration.value) return
  
  const input = event.target as HTMLInputElement
  const seekTime = (parseFloat(input.value) / 100) * duration.value
  audioElement.value.currentTime = seekTime
}

function startSeeking() {
  isSeeking.value = true
}

function stopSeeking() {
  isSeeking.value = false
}

function setVolume(event: Event) {
  const input = event.target as HTMLInputElement
  const newVolume = parseFloat(input.value) / 100
  volume.value = newVolume
  
  if (audioElement.value) {
    audioElement.value.volume = newVolume
  }
  
  if (newVolume > 0 && isMuted.value) {
    isMuted.value = false
  }
}

function toggleMute() {
  if (isMuted.value) {
    volume.value = previousVolume.value
    isMuted.value = false
  } else {
    previousVolume.value = volume.value
    volume.value = 0
    isMuted.value = true
  }
  
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
}

function toggleShuffle() {
  isShuffleOn.value = !isShuffleOn.value
}

function toggleRepeat() {
  switch (repeatMode.value) {
    case 'none':
      repeatMode.value = 'all'
      break
    case 'all':
      repeatMode.value = 'one'
      break
    case 'one':
      repeatMode.value = 'none'
      break
  }
}

function minimizePlayer() {
  isMinimized.value = !isMinimized.value
}

function closePlayer() {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
  
  currentTrack.value = null
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  
  emit('trackChanged', null)
}

function downloadTrack() {
  if (!currentTrack.value) return
  
  const a = document.createElement('a')
  a.href = currentTrack.value.url
  a.download = `${currentTrack.value.artist} - ${currentTrack.value.title}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function toggleHistory() {
  showHistory.value = !showHistory.value
}

function addToHistory(track: Track) {
  // Remove the track if it's already in history to avoid duplicates
  const existingIndex = playHistory.value.findIndex(t => t.id === track.id)
  if (existingIndex !== -1) {
    playHistory.value.splice(existingIndex, 1)
  }
  
  // Add to the beginning of history
  playHistory.value.unshift(track)
  
  // Keep only the last maxHistorySize tracks
  if (playHistory.value.length > maxHistorySize) {
    playHistory.value = playHistory.value.slice(0, maxHistorySize)
  }
}

function clearHistory() {
  playHistory.value = []
}

function playHistoryTrack(track: Track) {
  // If it's the current track, toggle play/pause
  if (currentTrack.value?.id === track.id) {
    togglePlayPause()
    return
  }
  
  // Otherwise play the track
  playTrack(track)
}

// Event handlers
function handleLoadedMetadata() {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

function handleTimeUpdate() {
  if (!isSeeking.value && audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

function handleTrackEnded() {
  if (repeatMode.value === 'one') {
    if (audioElement.value) {
      audioElement.value.currentTime = 0
      audioElement.value.play()
    }
  } else {
    nextTrack()
  }
}

function handleAudioError() {
  console.error('Audio playback error')
  // Could show error message to user
}

function handleArtworkError() {
  // Fallback to default artwork
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  if (!currentTrack.value) return
  
  switch (event.code) {
    case 'Space':
      if (event.target === document.body) {
        event.preventDefault()
        togglePlayPause()
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        nextTrack()
      }
      break
    case 'ArrowLeft':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        previousTrack()
      }
      break
  }
}

// Expose methods for external use
defineExpose({
  playTrack,
  togglePlayPause,
  nextTrack,
  previousTrack,
  closePlayer,
  isPlaying: computed(() => isPlaying.value),
  currentTrack: computed(() => currentTrack.value)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.global-audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.global-audio-player.minimized {
  transform: translateY(calc(100% - 60px));
}

.player-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  color: white;
  max-width: 1400px;
  margin: 0 auto;
}

/* Track Info Section */
.track-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.track-artwork {
  width: 48px;
  height: 48px;
  border-radius: 0.375rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-artwork {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  opacity: 0.7;
}

.track-details {
  min-width: 0;
  flex: 1;
}

.track-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Player Controls Section */
.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.play-pause-btn {
  background: white;
  color: #1e3a8a;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 0.5rem;
}

.play-pause-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.play-pause-btn.playing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 500px;
}

.time-current,
.time-duration {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
  min-width: 35px;
  text-align: center;
}

.progress-container {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
}

.progress-slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: transparent;
  outline: none;
  cursor: pointer;
  z-index: 2;
  appearance: none;
  -webkit-appearance: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.1s ease;
}

/* Player Actions Section */
.player-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-btn {
  background: none;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.volume-btn:hover {
  opacity: 1;
}

.volume-slider {
  width: 80px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 1.5px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  background: none;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.action-btn.active {
  color: #fbbf24;
  opacity: 1;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .player-content {
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 0.75rem;
  }
  
  .volume-control {
    display: none;
  }
}

@media (max-width: 768px) {
  .player-content {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .track-info {
    justify-content: center;
  }
  
  .player-actions {
    justify-content: center;
  }
  
  .action-buttons {
    gap: 0.5rem;
  }
  
  .progress-section {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .control-btn,
  .play-pause-btn {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  
  .play-pause-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
}
</style>