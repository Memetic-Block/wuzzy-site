<template>
  <div class="w-full">
    <div v-if="image" class="mb-3 w-full">
      <img
        :src="image"
        :alt="title ?? undefined"
        class="max-w-full h-auto rounded"
      />
    </div>
    <div
      :data-active="playing"
      :class="[
        'border rounded-lg p-3 transition-colors',
        playing
          ? 'bg-foreground text-background border-foreground'
          : 'bg-card text-foreground border-border'
      ]"
    >
      <div class="flex items-center gap-3">
        <!-- Back 15s Button -->
        <button
          v-if="showSkip && !livestream"
          @click="goBack15"
          aria-label="go back 15 seconds"
          :class="[
            'flex-shrink-0 transition-colors',
            playing
              ? 'text-background hover:opacity-80'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <SkipBackIcon fill="currentColor" class="w-5 h-5" />
        </button>

        <!-- Play/Pause Button -->
        <button
          @click="togglePlay"
          :aria-label="playing ? 'pause' : 'play'"
          :class="[
            'flex-shrink-0 transition-colors',
            playing
              ? 'text-background hover:opacity-80'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <PlayIcon v-if="!playing" fill="currentColor" class="w-5 h-5" />
          <PauseIcon v-if="playing" fill="currentColor" class="w-5 h-5" />
        </button>

        <!-- Forward 15s Button -->
        <button
          v-if="showSkip && !livestream"
          @click="goAhead15"
          aria-label="go ahead 15 seconds"
          :class="[
            'flex-shrink-0 transition-colors',
            playing
              ? 'text-background hover:opacity-80'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <SkipForwardIcon fill="currentColor" class="w-5 h-5" />
        </button>

        <!-- Track Info Section -->
        <div class="flex-1 min-w-0 px-2">
          <div v-if="showTrack" class="text-sm font-semibold truncate">
            <a
              v-if="hasTitle && hasTitleLink"
              :href="titleLink ?? undefined"
              :class="[
                'hover:underline',
                playing ? 'text-background' : 'text-foreground'
              ]"
            >
              {{ title }}
            </a>
            <span
              v-else-if="hasTitle"
              :class="[playing ? 'text-background' : 'text-foreground']"
              >{{ title }}</span
            >
            <span
              :class="['text-muted-foreground', playing && 'opacity-70']"
              v-if="hasTitle && hasDetails"
            >
              -
            </span>
            <a
              v-if="hasDetails && hasDetailsLink"
              :href="detailsLink ?? undefined"
              :class="[
                'hover:underline ml-1',
                playing ? 'text-background opacity-70' : 'text-muted-foreground'
              ]"
            >
              {{ details }}
            </a>
            <span
              v-else-if="hasDetails"
              :class="[
                'ml-1',
                playing ? 'text-background opacity-70' : 'text-muted-foreground'
              ]"
            >
              {{ details }}
            </span>
          </div>

          <!-- Progress Bar (non-livestream) -->
          <template v-if="!livestream && showTrack">
            <div
              :class="[
                'relative h-1  rounded-full cursor-pointer my-1 group',
                playing ? 'bg-muted-foreground' : 'bg-muted'
              ]"
              @click.prevent="seek"
            >
              <div
                :style="{ width: percentBuffered + '%' }"
                :class="[
                  'absolute top-0 left-0 h-full rounded-full opacity-50',
                  playing ? 'bg-muted' : 'bg-muted-foreground'
                ]"
              />
              <div
                :style="{ width: percentComplete + '%' }"
                :class="[
                  'absolute top-0 left-0 h-full rounded-full',
                  playing ? 'bg-secondary' : 'bg-primary'
                ]"
              />
            </div>

            <!-- Time Display -->
            <div
              :class="[
                'flex justify-between text-xs ',
                playing ? 'text-secondary' : 'text-muted-foreground'
              ]"
            >
              <span>{{ convertTimeHHMMSS(currentSeconds) }}</span>
              <span>{{ convertTimeHHMMSS(durationSeconds) }}</span>
            </div>
          </template>
        </div>

        <!-- Volume Control -->
        <div
          class="hidden md:flex items-center gap-1 flex-shrink-0 mt-1"
          @mouseover.prevent="showVolume = true"
          @mouseleave.prevent="showVolume = false"
        >
          <transition name="slide-left">
            <input
              v-show="showVolume"
              id="playerVolume"
              v-model="volume"
              type="range"
              min="0"
              max="100"
              class="w-20"
            />
          </transition>
          <button
            tabindex="0"
            :class="[
              'text-muted-foreground transition-colors',
              playing ? 'hover:text-background' : 'hover:text-foreground'
            ]"
            :aria-label="muted ? 'unmute' : 'mute'"
            @click="mute"
            @keypress.space.enter="mute"
          >
            <VolumeIcon v-if="!muted" class="w-5 h-5" />
            <VolumeXIcon v-if="muted" class="w-5 h-5" />
          </button>
        </div>

        <!-- Download Button -->
        <button
          v-if="showDownload && !livestream"
          tabindex="0"
          aria-label="download"
          class="hidden md:flex text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          @click="download"
          @keypress.space.enter="download"
        >
          <DownloadIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Hidden Audio Element -->
      <audio
        ref="audioFile"
        :loop="innerLoop"
        :src="file ?? undefined"
        preload="auto"
        style="display: none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeXIcon,
  DownloadIcon
} from 'lucide-vue-next'

interface Props {
  autoPlay?: boolean
  details?: string | null
  detailsLink?: string | null
  file?: string | null
  image?: string | null
  livestream?: boolean
  loop?: boolean
  showDownload?: boolean
  showSkip?: boolean
  showTrack?: boolean
  title?: string | null
  titleLink?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false,
  details: null,
  detailsLink: null,
  file: null,
  image: null,
  livestream: false,
  loop: false,
  showDownload: false,
  showSkip: true,
  showTrack: true,
  title: null,
  titleLink: null
})

const audioFile = ref<HTMLAudioElement | null>(null)
const currentPlayPromise = ref<Promise<void> | undefined>(undefined)
const currentSeconds = ref(0)
const durationSeconds = ref(0)
const buffered = ref(0)
const innerLoop = ref(props.loop)
const loaded = ref(false)
const playing = ref(false)
const previousVolume = ref(35)
const showVolume = ref(false)
const volume = ref(100)

const hasDetails = computed(() => props.details)
const hasDetailsLink = computed(() => props.detailsLink)
const hasTitle = computed(() => props.title)
const hasTitleLink = computed(() => props.titleLink)
const muted = computed(() => volume.value / 100 === 0)
const percentBuffered = computed(
  () => (buffered.value / durationSeconds.value) * 100
)
const percentComplete = computed(
  () => (currentSeconds.value / durationSeconds.value) * 100
)

watch(playing, (value) => {
  if (value) {
    const promise = audioFile.value?.play()
    if (promise) {
      currentPlayPromise.value = promise
      promise.finally(() => {
        currentPlayPromise.value = undefined
      })
    }
  } else {
    if (currentPlayPromise.value) {
      currentPlayPromise.value.then(() => audioFile.value?.pause())
    } else {
      audioFile.value?.pause()
    }
  }
})

watch(volume, () => {
  if (audioFile.value) audioFile.value.volume = volume.value / 100
})

const convertTimeHHMMSS = (val: number): string => {
  const hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return hhmmss.startsWith('00:') ? hhmmss.slice(3) : hhmmss
}

const download = () => {
  stop()
  window.open(props.file ?? undefined, 'download')
}

const goAhead15 = () => {
  if (audioFile.value) audioFile.value.currentTime += 15
}

const goBack15 = () => {
  if (audioFile.value) audioFile.value.currentTime -= 15
}

const load = () => {
  if (!audioFile.value || audioFile.value.readyState < 2) {
    throw new Error('Failed to load sound file.')
  }
  loaded.value = true
  durationSeconds.value = Math.floor(audioFile.value.duration)
  playing.value = props.autoPlay
}

const mute = () => {
  if (muted.value) {
    volume.value = previousVolume.value
  } else {
    previousVolume.value = volume.value
    volume.value = 0
  }
}

const seek = (e: MouseEvent) => {
  if (!loaded.value || !audioFile.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const pos = (e.clientX - rect.left) / rect.width
  audioFile.value.currentTime = audioFile.value.duration * pos
}

const stop = () => {
  playing.value = false
  if (audioFile.value) audioFile.value.currentTime = 0
}

const togglePlay = () => {
  playing.value = !playing.value
}

const update = () => {
  if (audioFile.value) {
    currentSeconds.value = audioFile.value.currentTime
    buffered.value = audioFile.value.buffered.length
      ? audioFile.value.buffered.end(0)
      : 0
  }
}

const pauseOtherAudioPlayers = () => {
  document.querySelectorAll('audio').forEach((el: HTMLAudioElement) => {
    if (el !== audioFile.value) el.pause()
  })
}

onMounted(() => {
  if (audioFile.value) {
    audioFile.value.addEventListener('timeupdate', update)
    audioFile.value.addEventListener('loadeddata', load)
    audioFile.value.addEventListener('progress', update)
    audioFile.value.addEventListener('pause', () => (playing.value = false))
    audioFile.value.addEventListener('play', () => {
      playing.value = true
      pauseOtherAudioPlayers()
    })
  }

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.target !== document.body) return
    switch (e.code) {
      case 'Space':
      case 'Enter':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowUp':
        if (volume.value < 100) volume.value++
        break
      case 'ArrowDown':
        if (volume.value > 0) volume.value--
        break
      case 'ArrowLeft':
        goBack15()
        break
      case 'ArrowRight':
        goAhead15()
        break
    }
  })

  innerLoop.value = props.loop
})
</script>

<style scoped>
/* Volume range slider styling */
input[type='range'] {
  -webkit-appearance: none;
  background: transparent;
  background-color: var(--muted-foreground);
  width: 100%;
  margin-right: 0.25rem;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
}

input[type='range']:focus {
  outline: none;
}

input[type='range']::-ms-track {
  width: 100%;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

/* input range thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background: var(--color-foreground);
  cursor: pointer;
  margin-top: -6px;
}

[data-active='true'] input[type='range']::-webkit-slider-thumb {
  background: var(--color-background);
}

input[type='range']::-moz-range-thumb {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background: var(--color-foreground);
  cursor: pointer;
}

[data-active='true'] input[type='range']::-moz-range-thumb {
  background: var(--color-background);
}

input[type='range']::-ms-thumb {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background: var(--color-foreground);
  cursor: pointer;
}

[data-active='true'] input[type='range']::-ms-thumb {
  background: var(--color-background);
}

/* input range track */
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 3px;
  cursor: pointer;
  background: var(--color-muted-foreground);
}

input[type='range']:focus::-webkit-slider-runnable-track {
  background: var(--color-muted-foreground);
}

input[type='range']::-moz-range-track {
  width: 100%;
  height: 3px;
  cursor: pointer;
  background: var(--color-muted-foreground);
}

input[type='range']::-ms-track {
  width: 100%;
  height: 3px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}

input[type='range']::-ms-fill-lower {
  background: var(--color-background);
}

input[type='range']:focus::-ms-fill-lower {
  background: var(--color-background);
}

[data-active='true'] input[type='range']::-ms-fill-lower {
  background: var(--color-secondary);
}

[data-active='true'] input[type='range']:focus::-ms-fill-lower {
  background: var(--color-secondary);
}

input[type='range']::-ms-fill-upper {
  background: var(--color-muted-foreground);
}

input[type='range']:focus::-ms-fill-upper {
  background: var(--color-muted-foreground);
}

[data-active='true'] input[type='range']::-ms-fill-upper {
  background: var(--color-muted-foreground);
}

[data-active='true'] input[type='range']:focus::-ms-fill-upper {
  background: var(--color-muted-foreground);
}

/* Slide transition animations */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.slide-left-enter-to,
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
