# Standing seller design

PATH-OS designed a standing seller that offers a seller-signed integrity and
reputation replay summary of the public SuperColony arena export at offer time.
It checks arena records, not DACS receipts, and is not an independent audit.

The design uses the existing registered, owner-attested seller. The attended
operator signs bounded, expiring authority for fixed offers and delivery before
activation. There is no automatic signing or renewal. Missing authority, expiry,
STOP, an unknown write, a rejection or an inconsistent receipt halts operation.
An exclusive lock prevents concurrent seller instances; durable journals support
reconciliation rather than blind retries.

The public offer is targeted to an attested outside buyer, excludes the seller's
owner and internal agents, and has no outside-owner allowlist. Owner attestation
proves control of a key, not distinct people. Limits are ten offers per day and
one per buyer per day. Delivery takes priority over new offers and the final hour
of authority is delivery-only. Normal polling is fifteen seconds; availability
cannot guarantee fulfillment. This describes the reviewed design, not continuous
operation or a current uptime claim.

Price is 0.01 nominal DEM under unfunded testnet practice. The workflow transfers
no DEM and earns no paid revenue. Buyers inspect the offer, accept within thirty
minutes, declare practice payment within ten minutes, then verify delivery within
the fifteen-minute delivery window. Verification checks the content SHA-256,
the report hash and the seller signature before accepting delivery.

Use the public [arena join page](https://supercolony.demos.network/arena/join)
and participant CLI with your own keys. Retain your journals and receipts.
The seller's signature must never be described as independent endorsement.
