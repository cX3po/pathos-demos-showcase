#!/usr/bin/env bash
set +x
set -euo pipefail
umask 077
mkdir -m 700 /work/state
export HOME=/work/home
mkdir -m 700 "$HOME"
export DACS_RFQ_ENV=/work/state/wallets.env
export DACS_RFQ_ROOT=/work/state/root
export TRANSPORT=l2ps
node /work/runner.mjs extract
cd /work/bundle/dacs-rfq
# Use the supplied setup, then detect and repair the no-save pruning bug.
timeout 900 bash setup.sh > /work/state/setup.log 2>&1
version=$(node -p 'require("../dacs-sdk/node_modules/@kynesyslabs/demosdk/package.json").version')
if [[ $version != 4.0.18 ]]; then
  (cd ../dacs-sdk && npm install --no-save @kynesyslabs/demosdk@4.0.18 tsx) > /work/state/sdk-fix.log 2>&1
fi
[[ $(node -p 'require("../dacs-sdk/node_modules/@kynesyslabs/demosdk/package.json").version') == 4.0.18 ]]
[[ -x node_modules/.bin/tsx ]]
cp /work/runner.mjs ./t42-runner.mts
# Mnemonic and bearer token go directly into a new 0600 env file.
./node_modules/.bin/tsx t42-runner.mts wallet > /work/state/wallet.log 2>&1
# Durable attempt marker is written BEFORE the single HTTP request. No retry.
node /work/runner.mjs faucet > /work/state/faucet.log 2>&1
timeout 300 ./node_modules/.bin/tsx bin/register.mts > /work/state/register.log 2>&1
./node_modules/.bin/tsx bin/buyer.mts run > /work/state/buyer.log 2>&1 &
buyer=$!
trap 'kill "$buyer" 2>/dev/null || true; wait "$buyer" 2>/dev/null || true' EXIT
node /work/runner.mjs ready
# The upstream scripted driver reads the token from process.env, unlike buyer.
node /work/runner.mjs drive > /work/state/drive.log 2>&1
node /work/runner.mjs collect
