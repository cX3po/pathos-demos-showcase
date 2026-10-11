# PATH-OS on Demos and DACS

PATH-OS is Phil’s human and AI collaboration. Public upstream contributions are attributed
to Phil’s GitHub account [cX3po](https://github.com/cX3po). This showcase connects that
account’s public work with PATH-OS.

Contribution snapshot: 2026-10-09T14:39:20.085905+00:00

## Public upstream contributions

| Repository | GitHub contributor commits | Ledger commits (including PR branches) | Authored PRs | Merged authored PRs | Issues | Review events | Reviewed PRs |
|---|---:|---:|---:|---:|---:|---:|---:|
| [DACS-Agent-commerce/Community](https://github.com/DACS-Agent-commerce/Community) | 11 | 12 | 8 | 8 | 1 | 0 | 0 |
| [DACS-Agent-commerce/DACS-Standard](https://github.com/DACS-Agent-commerce/DACS-Standard) | 29 | 102 | 52 | 29 | 65 | 127 | 47 |
| [DACS-Agent-commerce/dacs-sdk](https://github.com/DACS-Agent-commerce/dacs-sdk) | 17 | 18 | 5 | 3 | 2 | 14 | 10 |
| [kynesyslabs/documentation-mintlify](https://github.com/kynesyslabs/documentation-mintlify) | 0 | 2 | 1 | 0 | 0 | 0 | 0 |
| [kynesyslabs/node](https://github.com/kynesyslabs/node) | 0 | 0 | 0 | 0 | 6 | 0 | 0 |
| [kynesyslabs/sdks](https://github.com/kynesyslabs/sdks) | 0 | 4 | 2 | 0 | 0 | 0 | 0 |
| [kynesyslabs/zk_ceremony](https://github.com/kynesyslabs/zk_ceremony) | 0 | 0 | 1 | 1 | 0 | 0 | 0 |

Public indexed author/review searches, default-branch commits and discovered PR branches; not deleted/private/unindexed activity. Review events differ from reviewed PR counts. Contributor counts are GitHub contributor endpoint totals, not ledger commit totals.

Counts above use only approved public ledger rows, except the separately labeled
GitHub contributor metric. Reviews count submitted review events, including repeated
rounds and dismissed events; reviewed PRs count distinct PRs. These are activity counts,
not a claim that every proposed change shipped. [CONTRIBUTIONS.md](CONTRIBUTIONS.md)
lists the public references and PR states. Work includes canonical serialization,
agreement admission and conformance fixes, SDK contributions, and upstream review.

## Arena practice and an external private RFQ

Pally (pallytin88) published the private RFQ package on 2026-10-09 at
[pallytin88/dacs-rfq](https://github.com/pallytin88/dacs-rfq).

The [public arena export](https://supercolony.demos.network/api/arena/export) records the completed PATH-OS seller deal at sequences 367–371.
Its nominal price is 0.01 DEM, with 0 DEM transferred under unfunded practice.
The buyer registration is “SuperColony DACS RFQ buyer,” owned by “SuperColony
(pallytin88).” Its attested owner key differs from the PATH-OS seller’s. The offer
title nevertheless says “Common ownership”; this discrepancy remains visible in
the source. Different owner keys prove neither different people nor independent
customers. This inventory inspected public records; it did not independently verify
their signatures. No revenue claim is made.

Phil’s operator record reports a settled external private-RFQ tester run; its [public payment transaction](https://explorer.demos.sh/transactions/edd16dfba98d7666bb4742c5c354d8fb507ace9bab48b16c8c405356b4202ea1) provides a public reference.
The run exposed an SDK setup bug: a later dependency install pruned the required
SDK version. The repair installs the required SDK and runner dependency together.
The [private RFQ guide](kit/docs/PRIVATE_RFQ.md) records the recipe and explains
that negotiation is private while payment and commitment are public. The payment
alone does not prove private negotiations, delivery or full protocol conformance.

A second operator-reported run on 2026-10-09, using the tester's fixed bundle with
that repair included, settled with no manual fixes; its [public payment transaction](https://explorer.demos.sh/transactions/25754ab8888a0e4b4be6fff5b1cb1f28fbe275ff4af5024be34689218128be56)
is the public reference. The same limits apply.

## After the 2026-10-09 snapshot

The contribution table and the snapshot time above are unchanged. The notes
below are 2026-10-10 records. They are not a new count of the table.

[pallytin88/dacs-rfq pull request 1](https://github.com/pallytin88/dacs-rfq/pull/1)
was open at `2f9de3240567431c9832f052edf109b517fed839`. A read of that pull
request's reviews on 2026-10-10 returned one review: cX3po marked that commit
`APPROVED` at 2026-10-10T22:23:24Z
([review 5481018024](https://github.com/pallytin88/dacs-rfq/pull/1#pullrequestreview-5481018024)).
The commit subject is `docs: drop the "L2PS transport pending" wording; test commands for a standalone checkout`,
with author date 2026-10-10T19:24:23Z. The compare against
`ddbb3ccba8e52075bc50f08fa48e46c10b7b4121` lists `README.md` and `package.json`
only
([compare](https://github.com/pallytin88/dacs-rfq/compare/ddbb3ccba8e52075bc50f08fa48e46c10b7b4121...2f9de3240567431c9832f052edf109b517fed839)).

A PATH-OS operator record dated 2026-10-10 reports one settled Base Sepolia
payment of 0.01 test USDC and delivery from the opt-in MCP tool
`demos_x402_showcase`. That record describes a local loopback MCP call, not a
public endpoint, and states that the source branch was not pushed. The public
transaction is
[0x21c10268b6e87de13f922b5c908c6c10c89d876aa06a42af3554f9eba01f4f1e](https://sepolia.basescan.org/tx/0x21c10268b6e87de13f922b5c908c6c10c89d876aa06a42af3554f9eba01f4f1e),
block 47945945, status success. That record states a USDC transfer of 0.01 at
log 246, immediately after an AuthorizationUsed log 245, and it states that
no complete anchored DACS commerce session is claimed.

A separate PATH-OS operator record dated 2026-10-10 reports one OpenClaw
signature on an unanchored listing, content hash
`e477a0cb173f99b85dab63829b69a647ed401a97658bd51e0382baebf3d4cf20`, price
0.01 USDC, and one seller-only legacy offer, job `01M4KWK773F80BXF96G2Z8XHVE`,
agreement hash `4f9e4ab744f0c680d51cf5b327f8fef11e4476a354eed3630db630af67e24e61`.
That record states that neither artifact has an on-chain transaction id, and
that no buyer payment, delivery, or settlement evidence was produced. It
records the listing verifier as indeterminate and the offer as seller-signed
only.

## OpenClaw paid sale — 2026-10-10

A PATH-OS operator record reports a test x402 payment and delivery through OpenClaw in a
sandboxed VM on **Base Sepolia testnet**. The public
[transaction](https://sepolia.basescan.org/tx/0x6922cc3e53d6c17864411e39e906c7c78e38f7af4166b6d42cf1270366492378)
succeeded in block **47952879**, transferring **10000 atomic units (0.01 test
USDC, 6 decimals)** on token contract
`0x036CbD53842c5426634e7929541eC2318f3dCF7e`, from `0x9348b5c00255cf9a9daffe300b48582cd6e274bb` to
`0x796faaff078c19c1aa92950ad80d1116cacabede`. The operator record reports
OpenClaw delivery and a separate verifier pass covering agreement signatures,
signed delivery evidence and payment binding. A replay using the retained
payment authorization returned the same delivery bytes with no second transfer. The public transaction proves the transfer;
delivery and replay are operator-recorded checks. The operator reports control
of both test wallets. This sale used a different job from the earlier listing
and offer above. The seller endpoint was loopback-only; no public seller endpoint
or complete anchored DACS commerce session is claimed.

### Two sales under one standing grant — 2026-10-10

The PATH-OS operator audit records two further OpenClaw sales under **one
human-signed, seven-day receive-only standing grant**, capped at **10 sales /
0.10 test USDC**, with no additional human signature between them. On Base
Sepolia testnet, each transaction transferred **10000 atomic units (0.01 test
USDC, 6 decimals)** from the same test buyer to the VM payee:

- [Sale 1](https://sepolia.basescan.org/tx/0x5c06ae14f06e147c469c79951e213c32cb1549bf2baab8ba73af75d978f6ee42), block **47954737**.
- [Sale 2](https://sepolia.basescan.org/tx/0x20e4e5cd34b988c993295b59164140c5ab936e5fb9fd8a76af3ae00e8555c588), block **47954770**.

The operator audit records two successful settlements, two retained deliveries,
and sealed quota reservations of **2 sales / 20000 atomic units (0.02 test
USDC)**. Public transactions evidence the transfers; grant, delivery and quota
checks are operator-recorded. Both wallets are ours, including the same buyer
wallet used in the earlier sale. The seller endpoint remains loopback-only;
no independent buyer, public seller endpoint or anchored DACS session is claimed.

## Shared branch attribution

The current public commit list for [SDK PR #332](https://github.com/DACS-Agent-commerce/dacs-sdk/pull/332) contains 5 commits, of which 0 are linked by GitHub to cX3po.
Its full branch ancestry contains 17 commits linked to cX3po; that includes inherited base work, not just this PR’s changes.
That branch snapshot cannot substantiate a larger historical authorship count.
Shared implementation credit requires the original commit evidence; this draft
does not attribute another author’s current commits to PATH-OS.

## Scoped kit and seller design

The [reviewer kit](kit/docs/REVIEWER_KIT.md) is a bounded testnet recipe.
MCP read checks require a separately supplied demos-mcp checkout; that server is
not included. The private RFQ wrapper and its offline tests are included.
Run offline checks from the kit directory with
`node --test test/private-rfq-container.test.mjs`.
Live RFQ execution requires a trusted tester bundle and deliberate testnet effects.
This showcase build performed no live deal, faucet request or payment.

The [standing seller design](seller/DESIGN.md) describes bounded authority,
unfunded practice, signed summaries, receipt checks and stop behavior.
It does not claim continuous operation or an independent audit.

Original showcase material is Apache-2.0. Copied/adapted kit files retain MIT
terms and attribution in [NOTICE](NOTICE).
