job "wuzzy-site-static-stage" {
  datacenters = ["mb-hel"]
  type = "batch"

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
        mount {
          type = "bind"
          source = "secrets/rclone.conf"
          target = "/root/.config/rclone/rclone.conf"
          readonly = true
        }
      }
      
      env {
        PHASE="stage"
        VITE_VERSION_SHA="[[ .commit_sha ]]"
        VITE_VERSION_TIMESTAMP="[[ .commit_timestamp ]]"
        VITE_REGISTRY_PROCESS_ID="PJVif9KTSNZ2pYrt18Wn976SJjCLuvs3dj7r5Oh2xXQ"
        VITE_PRIMARY_NEST_ID="1X_nt5ctoJTw6Dc3M6x34_lFTWGTl-jhW8MY7Vff4fA"
        VITE_HYPERBEAM_ENDPOINT="https://wuzzy-hyperbeam.hel.memeticblock.net"
        VITE_SEARCH_API_URL="https://wuzzy-search-api-stage.hel.memeticblock.net"
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

      template {
        data = <<-EOF
        {{- with secret "kv/memeticblock/cloudflare-deployer" }}[r2]
        type = s3
        provider = Cloudflare
        region = auto
        endpoint = {{ .Data.data.ENDPOINT }}
        access_key_id = {{ .Data.data.ACCESS_KEY_ID }}
        secret_access_key = {{ .Data.data.SECRET_ACCESS_KEY }}
        {{- end }}
        EOF
        destination = "secrets/rclone.conf"
      }

      template {
        data = <<-EOF
        #!/bin/sh

        echo "Generating static files"
        npm run build

        echo "Syncing static files to cloudflare r2: wuzzy-site-stage"
        rclone sync .output/public r2:wuzzy-site-stage/

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
