# Run a private DACS deal

This optional **live testnet** exercise adds a private DACS-3 RFQ to the
[reviewer kit](REVIEWER_KIT.md). The buyer offers 9 DEM, counters 9.5 DEM
when the seller asks more, and waits for settlement. Negotiation messages
travel in the buyer/seller encrypted L2PS subnet. The agreement commitment
and payment are public, as are the listing and both identity vet records.
Offers and counters are absent from those public records; the payment amount
is visible on the native transfer. This is not a DACS-5 delivery exercise.

You need Docker, Bash, sha256sum and Node 18+ on the host, Internet access for
the supplied setup, and Pally's tester tarball **plus a SHA-256 obtained over
the trusted private channel**. The checksum establishes the supplied bytes;
setup also fetches/builds the upstream SDK branch and npm dependencies.
Use testnet only, a fresh dedicated wallet and nothing of real value. This
script generates that wallet; it never uses an existing wallet or home.
The live command requests faucet funds once and signs/broadcasts a deal.
Run it only when you intend those testnet effects. T42 itself was tested
offline and did not run another live deal or touch the faucet.

From the kit checkout, substitute the **complete** registration URL and
listing reference from Pally's private tester note:

```bash
REGISTER_URL='<HTTPS registration URL from the tester note>' \
LISTING_REF='<full dacs1:did%3Ademos%3Aagent%3A...:listing:v1 from the note>' \
DEMOS_RPC='https://demosnode.discus.sh/' TESTNET_ONLY=1 \
  bash scripts/private-rfq-container.sh /absolute/path/tester.tar.gz '<expected sha256>'
```

There are no registration/listing defaults. The seller DID is derived from
the listing reference. Pally/SuperColony operates the registration and L2PS
node; it is not reviewer-kit or PATH-OS infrastructure. His host chain is a
one-validator development chain; its finality relies on that operator. The
public testnet carries the anchors and payment. This wrapper admits only the
public testnet RPC used in the successful tester run.

The script checks the checksum before Docker/network work, copies the
tarball into a new mode-0700 `/tmp/private-rfq.*` directory and checks the copy
again. A throwaway `node:22` container runs as your host UID/GID and mounts
**only that directory**. Generated private files stay owned by you. No
ports, repository, home, Docker socket, existing state or host network are
mounted. The expected archive layout is `dacs-rfq/` with `setup.sh` and
`bin/{register,buyer,drive}.mts`, optionally `dacs-sdk/`. Unsafe paths and
archive links are refused. Do not supply a repacked tarball without obtaining
and checking its new trusted digest.

Inside the container it runs the bundle's setup, checks the installed SDK
version, and if it is not 4.0.18 installs
`@kynesyslabs/demosdk@4.0.18 tsx` **in one npm step**. That repairs the observed
bug where a later `npm install --no-save` pruned 4.0.18 back to 4.0.16. The
script verifies 4.0.18 afterward, generates the mnemonic directly into a new
0600 `state/wallets.env`, requests the public faucet once (with an attempt
marker written first), registers, starts the buyer with `TRANSPORT=l2ps`,
then runs the bundle's scripted driver at the observed 9/9.5/9.8 settings.

The printed private directory contains:

- `state/receipts.json`: the driver's `get_receipts` response and final phase.
- `state/procurement.json`: the viewer's `/demo/procurement/{jobId}` event stream.
- `public.json`: validated job ID, agreement hash, commitment address and
  commitment/payment transaction hashes. Only these fields are printed.
- Private setup, wallet, registration, buyer and driver logs, plus the
  dedicated wallet, credential and journals needed for local diagnosis.

The directory and files remain private after the container exits. Do not
share the whole directory, logs, mnemonic, bearer token, credential, keys or
private transcript. Inspect receipts/viewer data before deciding what to
share. The script does not submit an issue or report. Containers receive no
caller wallet/token environment variables. Raw container output never goes
to the terminal, even on failure.

If the run fails or times out, inspect private evidence locally. Do not
blindly rerun: a faucet request or payment may already have happened. Every
invocation creates a new wallet/directory; there is deliberately no automatic
resume, faucet retry or payment retry. Readiness/registration/driver waits
are bounded. A non-settled deal is failure, never reported as success.

Provenance: this recipe follows the 2026-10-09 successful tester run, job
`01M4G1KAQVAMQ3JH8TBA1Q0M2C`, commitment
`stor-b29327fbe60c27f3be265dece0861e132c069c56`, payment
`edd16dfba98d7666bb4742c5c354d8fb507ace9bab48b16c8c405356b4202ea1`.
That prior evidence supports the recipe; it does not prove a new execution
of this wrapper or current availability of the seller.

Offline checks (no Docker daemon, faucet, RPC or deal):

```bash
node --test test/private-rfq-container.test.mjs
```
