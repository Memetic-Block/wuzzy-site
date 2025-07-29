job "wuzzy-site-nginx-stage" {
  datacenters = ["mb-hel"]
  type = "service"

  reschedule {
    attempts = 0
  }

  group "wuzzy-site-nginx-stage-group" {
    count = 1

    update {
      stagger      = "30s"
      max_parallel = 1
      canary       = 1
      auto_revert  = true
      auto_promote = true
    }

    network {
      mode = "bridge"
      port "http" {
        host_network = "wireguard"
      }
    }

    task "wuzzy-site-nginx-stage-task" {
      driver = "docker"

      config {
        image = "${CONTAINER_REGISTRY_ADDR}/memetic-block/wuzzy-site:${VERSION}"
        mount {
          type = "bind"
          source = "local/nginx.conf"
          target = "/etc/nginx/conf.d/default.conf"
          readonly = true
        }
      }
      
      env {
        PHASE="stage"
        VERSION="[[ .commit_sha ]]"
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
        server { 
          listen {{ env "NOMAD_PORT_http" }};
          server_name {{ env "NOMAD_IP_http" }};
          location / {
            root /usr/share/nginx/html;
            try_files $uri /index.html;
          }
        }
        EOF
        destination = "local/nginx.conf"
      }

      restart {
        attempts = 0
        mode     = "fail"
      }

      resources {
        cpu    = 4096
        memory = 4096
      }

      service {
        name = "wuzzy-site-nginx-stage"
        port = "http"

        check {
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "5s"
        }

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.wuzzy-site-nginx-stage.entrypoints=https",
          "traefik.http.routers.wuzzy-site-nginx-stage.tls=true",
          "traefik.http.routers.wuzzy-site-nginx-stage.tls.certresolver=memetic-block",
          "traefik.http.routers.wuzzy-site-nginx-stage.rule=Host(`wuzzy-stage.hel.memeticblock.net`)"
        ]
      }
    }
  }
}
