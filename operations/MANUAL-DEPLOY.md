# Manual deployment

The `Deploy new version` step in both GitHub workflows is commented out. GitHub-hosted
runners have no route to Nomad or Vault on the `mb-hel` network, so CI now builds and
publishes the image only. Deploys are run by hand from a machine that can reach the
Nomad cluster.

## Prerequisites

- `nomad` CLI, with `NOMAD_ADDR` and `NOMAD_TOKEN` set for the `mb-hel` cluster
- The submitting token needs `submit-job` plus access to the `memeticblock-io-cloudflare-deployer`
  and `wuzzy-deployer` Vault policies the job declares. Nomad pulls those secrets itself,
  so you do not need Vault credentials locally.
- The image for the commit you are deploying must already exist in the registry:

      docker manifest inspect ghcr.io/memetic-block/wuzzy-site:<sha>

  CI only publishes on a successful run. A commit whose workflow failed has no image and
  cannot be deployed.

## Job variables

Both specs take their build metadata as HCL2 input variables, passed with `-var` at submit
time. Nothing is templated into the file, so the specs stay clean in git.

| Variable | Stage | Live |
| --- | --- | --- |
| `commit_sha` | required | required |
| `commit_timestamp` | required | required |
| `release_tag` | defaults to `stage` | required, version with no `v` prefix |

`commit_sha` does double duty: it sets `VITE_VERSION_SHA` and selects the container image
tag, so it has to match a tag that exists in ghcr.

Omitting a required variable fails at parse time with `Unset variable "<name>"` before
anything is submitted, so a half-configured deploy cannot reach the cluster.

## Deploying stage

    SHA=$(git rev-parse origin/master)
    TS=$(date -u -d "$(git show -s --format=%cI "$SHA")" +"%Y-%m-%dT%H:%M:%SZ")

    nomad job run \
      -var="commit_sha=${SHA}" \
      -var="commit_timestamp=${TS}" \
      operations/wuzzy-site-static-stage.hcl

Swap `run` for `plan` first if you want to see what changes before submitting.

## Deploying live

    TAG=v0.3.1
    SHA=$(git rev-parse "$TAG^{commit}")
    TS=$(date -u -d "$(git show -s --format=%cI "$SHA")" +"%Y-%m-%dT%H:%M:%SZ")

    nomad job run \
      -var="commit_sha=${SHA}" \
      -var="commit_timestamp=${TS}" \
      -var="release_tag=${TAG#v}" \
      operations/wuzzy-site-static-live.hcl

## Watching it

Both specs are `type = "batch"` with no restart or reschedule, so the job runs once and
either completes or fails.

    nomad job status wuzzy-site-static-stage
    nomad alloc logs -f <alloc-id>

The task runs `npm run build` then `npm run deploy:static`, which is `wrangler pages deploy`
against the `wuzzy-site-stage` or `wuzzy-site-live` project. Arweave deployment stays
disabled in the entrypoint. Expect the log to end with `Static site deployment complete`.

If you redeploy the same sha, Nomad may treat the submission as unchanged and not schedule
a new allocation. `nomad job stop -purge <job-name>` before re-running clears that.

## Verifying

Stage lands on https://stage.wuzzy.io, live on https://wuzzy.io. The footer link in
`App.vue` reads straight from the variables you passed, so it is the quickest confirmation
that the right build shipped:

- stage shows the short commit sha, linking to that commit on GitHub
- live shows `v<release_tag>`, linking to the matching GitHub release

If the footer shows a sha you did not deploy, the job pulled a stale image tag.
