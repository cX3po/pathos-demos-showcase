#!/usr/bin/env bash
# Run only when an operator deliberately authorizes a fresh testnet deal.
set +x
set -euo pipefail
umask 077
fail() { printf '%s\n' "$1" >&2; exit 1; }
if [[ ${1:-} == --help && $# == 1 ]]; then
  printf '%s\n' 'Usage: REGISTER_URL=... LISTING_REF=... DEMOS_RPC=https://demosnode.discus.sh/ TESTNET_ONLY=1 private-rfq-container.sh TARBALL SHA256' 'Creates a new private temp directory; requests the faucet once and spends testnet DEM.'
  exit 0
fi
[[ $# == 2 ]] || fail 'Expected tester tarball path and SHA-256; use --help.'
[[ -f $1 && ! -L $1 ]] || fail 'Tester tarball must be a regular file.'
[[ $2 =~ ^[a-fA-F0-9]{64}$ ]] || fail 'Expected a 64-hex SHA-256.'
[[ ${TESTNET_ONLY:-} == 1 ]] || fail 'Set TESTNET_ONLY=1 for this dedicated testnet run.'
[[ ${DEMOS_RPC:-} == https://demosnode.discus.sh/ ]] || fail 'DEMOS_RPC must be the public testnet RPC used by this tester bundle.'
[[ ${REGISTER_URL:-} =~ ^https://[a-zA-Z0-9.-]+(:[0-9]+)?/colony-rfq/v0/register$ ]] || fail 'REGISTER_URL must be the HTTPS registration URL from the tester note.'
[[ ${LISTING_REF:-} =~ ^dacs1:did%3Ademos%3Aagent%3A([a-f0-9]{64}):[a-zA-Z0-9_-]+:v[1-9][0-9]*$ ]] || fail 'LISTING_REF must be the full DACS-1 reference from the tester note.'
seller="did:demos:agent:${BASH_REMATCH[1]}"
command -v sha256sum >/dev/null || fail 'sha256sum required.'
actual=$(sha256sum -- "$1")
[[ ${actual%% *} == "${2,,}" ]] || fail 'SHA-256 mismatch; refused before Docker or network.'
command -v docker >/dev/null || fail 'Docker required.'
command -v node >/dev/null || fail 'Node 18+ required for the public-reference filter and offline checks.'
here=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# Force a local private directory outside any checkout; no caller-chosen mount.
work=$(mktemp -d /tmp/private-rfq.XXXXXXXX)
chmod 700 "$work"
cp -- "$1" "$work/tester.tar.gz"
cp -- "$here/private-rfq-runner.mjs" "$work/runner.mjs"
cp -- "$here/private-rfq-container-inner.sh" "$work/container.sh"
# Check the copied bytes too, closing source replacement during the copy.
actual=$(sha256sum -- "$work/tester.tar.gz")
[[ ${actual%% *} == "${2,,}" ]] || fail 'Copied tarball checksum mismatch; refused.'
printf 'Private run directory: %s\n' "$work"
name="private-rfq-${work##*.}"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
# No ports, host network, home, existing state, socket or repository mounts.
# Environment is an explicit allowlist; existing wallet and proxy envs do not enter.
if ! docker run --rm --init --name "$name" --user "$(id -u):$(id -g)" --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,src=$work,dst=/work" --workdir /work \
  --env "REGISTER_URL=$REGISTER_URL" --env "LISTING_REF=$LISTING_REF" \
  --env "SELLER_DID=$seller" --env "DEMOS_RPC=$DEMOS_RPC" \
  node:22 bash /work/container.sh >"$work/container.log" 2>&1; then
  fail 'Private RFQ failed; inspect private logs locally. Do not retry faucet/payment blindly.'
fi
# Never forward container stdout: it includes upstream diagnostics. Parse a whitelist.
if ! node "$here/private-rfq-runner.mjs" public "$work/public.json"; then
  fail 'Public references unavailable; inspect private evidence locally.'
fi
