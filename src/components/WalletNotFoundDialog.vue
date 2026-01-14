<template>
  <Dialog v-model:open="showDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle
          class="max-w-max self-center px-3 py-2 rounded-sm dark:bg-[#3B1219] dark:text-[#EC5D5E] bg-[#FEEBEC] text-[#CE2C31]"
          >Wallet Not Found</DialogTitle
        >
        <DialogDescription class="text-center">
          The Wander Wallet extension may either disabled or not installed.
          Please install or activate Wander Wallet to connect.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="justify-center sm:justify-center">
        <Button as-child>
          <a
            href="https://www.wander.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Wander Wallet
          </a>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useWallet } from '@/composables/wallet'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import Button from '@/components/ui/button/Button.vue'

const { showWalletNotFoundDialog } = useWallet()
const showDialog = showWalletNotFoundDialog
</script>
