job "wuzzy-site-static-stage" {
  datacenters = ["mb-hel"]
  type = "batch"

  constraint {
    attribute = "${meta.env}"
    value     = "edge-worker"
  }

  reschedule {
    attempts = 0
  }

  group "wuzzy-site-static-stage-group" {
    count = 1

    task "wuzzy-site-static-stage-task" {
      driver = "docker"

      config {
        image = "${CONTAINER_REGISTRY_ADDR}/memetic-block/wuzzy-site:${VITE_VERSION_SHA}"
        entrypoint = [ "/workdir/entrypoint.sh" ]
        mount {
          type = "bind"
          source = "local/entrypoint.sh"
          target = "/workdir/entrypoint.sh"
          readonly = true
        }
        volumes = [ "secrets/wallet.json:/usr/src/app/wallet.json" ]
      }

      env {
        PHASE="stage"
        PROJECT_NAME="wuzzy-site-stage"
        PRIVATE_KEY="/usr/src/app/wallet.json"
        ANT_PROCESS_ID="-Kkir7ML3cb2XCyeD8lUbl1g8tfivrB_0xkzPeChVjM"
        VITE_VERSION_SHA="[[ .commit_sha ]]"
        VITE_VERSION_TIMESTAMP="[[ .commit_timestamp ]]"
        VITE_RELEASE_TAG="[[ .release_tag ]]"
        VITE_REGISTRY_PROCESS_ID="PJVif9KTSNZ2pYrt18Wn976SJjCLuvs3dj7r5Oh2xXQ"
        VITE_PRIMARY_NEST_ID="1X_nt5ctoJTw6Dc3M6x34_lFTWGTl-jhW8MY7Vff4fA"
        VITE_HYPERBEAM_ENDPOINT="https://wuzzy-hyperbeam.hel.memeticblock.net"
        VITE_SEARCH_API_URL="https://wuzzy-search-api-stage.hel.memeticblock.net"
        VITE_GQL_ENDPOINT="https://arweave-search.goldsky.com"
        VITE_ANALYTICS_API_URL="https://analytics-goblin-stage.hel.memeticblock.net"
        VITE_SITE_HOSTNAME="https://stage.wuzzy.io"
        VITE_ALLOW_INDEXING="false"
      }

      template {
        data = <<-EOF
        {{- range service "container-registry" }}
        CONTAINER_REGISTRY_ADDR="{{ .Address }}:{{ .Port }}"
        {{- end }}
        EOF
        env = true
        destination = "local/env"
      }

      vault {
        policies = [
          "memeticblock-io-cloudflare-deployer",
          "wuzzy-deployer"
        ]
      }

      template {
        data = <<-EOF
        {{- with secret "kv/memeticblock/cloudflare-deployer" }}
        CLOUDFLARE_ACCOUNT_ID={{ .Data.data.CLOUDFLARE_ACCOUNT_ID }}
        CLOUDFLARE_API_TOKEN={{ .Data.data.CLOUDFLARE_API_TOKEN }}
        {{- end }}
        EOF
        destination = "secrets/cloudflare.env"
        env = true
      }

      template {
        data = <<-EOF
        {{- with secret `kv/wuzzy/deployer` }}
        {{- base64Decode .Data.data.WUZZY_DEPLOYER_KEY_BASE64 }}
        {{- end }}
        EOF
        destination = "secrets/wallet.json"
      }

      template {
        data = <<-EOF
        #!/bin/sh
        set -e

        echo "Generating static files"
        npm run build

        echo "Deploying static site to Cloudflare Pages"
        npm run deploy:static

        echo "Deploying static site to Arweave"
        npm run deploy:arweave

        echo "Static site deployment complete"
        EOF
        destination = "local/entrypoint.sh"
        perms = "0755"
      }

      restart {
        attempts = 0
        mode     = "fail"
      }

      resources {
        cpu    = 1024
        memory = 1024
      }
    }
  }
}
