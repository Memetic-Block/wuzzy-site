<template>
  <div class="w-full">
    <div v-if="image" class="mb-3 w-full">
      <img :src="image" :alt="title" class="max-w-full h-auto rounded" />
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
              :href="titleLink"
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
              :href="detailsLink"
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
        :src="file"
        preload="auto"
        style="display: none"
      />
    </div>
  </div>
</template>

<script>
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  Volume2Icon,
  VolumeXIcon,
  DownloadIcon
} from 'lucide-vue-next'

export default {
  name: 'VueSound',
  components: {
    PlayIcon,
    PauseIcon,
    SkipBackIcon,
    SkipForwardIcon,
    VolumeIcon,
    Volume2Icon,
    VolumeXIcon,
    DownloadIcon
  },
  props: {
    autoPlay: {
      type: Boolean,
      default: false
    },
    details: {
      type: String,
      default: null
    },
    detailsLink: {
      type: String,
      default: null
    },
    file: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    livestream: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    showDownload: {
      type: Boolean,
      default: false
    },
    showSkip: {
      type: Boolean,
      default: true
    },
    showTrack: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: null
    },
    titleLink: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      audio: undefined,
      currentSeconds: 0,
      durationSeconds: 0,
      buffered: 0,
      innerLoop: false,
      loaded: false,
      playing: false,
      previousVolume: 35,
      showVolume: false,
      volume: 100
    }
  },
  computed: {
    hasDetails() {
      return this.$props.details
    },
    hasDetailsLink() {
      return this.$props.detailsLink
    },
    hasTitle() {
      return this.$props.title
    },
    hasTitleLink() {
      return this.$props.titleLink
    },
    muted() {
      return this.volume / 100 === 0
    },
    percentBuffered() {
      return (this.buffered / this.durationSeconds) * 100
    },
    percentComplete() {
      return (this.currentSeconds / this.durationSeconds) * 100
    }
  },
  watch: {
    playing(value) {
      if (value) {
        return this.audio.play()
      }
      this.audio.pause()
    },
    volume() {
      this.audio.volume = this.volume / 100
    }
  },
  created() {
    this.innerLoop = this.loop
    // keyboard accessibility
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          this.togglePlay()
          break
        case 'Enter':
          this.togglePlay()
          break
        case 'ArrowUp':
          if (this.volume < 100) this.volume++
          break
        case 'ArrowDown':
          if (this.volume > 0) this.volume--
          break
        case 'ArrowLeft':
          this.goBack15()
          break
        case 'ArrowRight':
          this.goAhead15()
          break
      }
    })
  },
  mounted() {
    this.audio = this.$refs.audioFile
    this.audio.addEventListener('timeupdate', this.update)
    this.audio.addEventListener('loadeddata', this.load)
    this.audio.addEventListener('buffered', this.update)
    this.audio.addEventListener('pause', () => {
      this.playing = false
    })
    this.audio.addEventListener('play', () => {
      this.playing = true
      this.pauseOtherAudioPlayers()
    })
  },
  methods: {
    convertTimeHHMMSS(val) {
      const hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
      return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss
    },
    download() {
      this.stop()
      window.open(this.file, 'download')
    },
    goAhead15() {
      this.audio.currentTime = this.audio.currentTime + 15
    },
    goBack15() {
      this.audio.currentTime = this.audio.currentTime - 15
    },
    load() {
      if (this.audio.readyState >= 2) {
        this.loaded = true
        this.durationSeconds = parseInt(this.audio.duration)
        this.playing = this.autoPlay
        return this.playing
      }
      throw new Error('Failed to load sound file.')
    },
    mute() {
      if (this.muted) {
        this.volume = this.previousVolume
        return this.volume
      }
      this.previousVolume = this.volume
      this.volume = 0
    },
    seek(e) {
      if (!this.loaded) return
      const el = e.target.getBoundingClientRect()
      const seekPos = (e.clientX - el.left) / el.width
      this.audio.currentTime = this.audio.duration * seekPos
    },
    stop() {
      this.playing = false
      this.audio.currentTime = 0
    },
    togglePlay() {
      this.playing = !this.playing
    },
    update() {
      this.currentSeconds = this.audio.currentTime
      this.buffered = this.audio.buffered.end(0)
    },
    pauseOtherAudioPlayers() {
      // Find all audio elements and pause them except this one
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach((audio) => {
        if (audio !== this.audio) {
          audio.pause()
        }
      })
    }
  }
}
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
