import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const state = '/work/state';
const save = (path, value) => writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', {mode: 0o600, flag: 'wx'});
const hex = /^[a-f0-9]{64}$/;
const job = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function get(url, options = {}) {
  const r = await fetch(url, {...options, signal: AbortSignal.timeout(15000)});
  if (!r.ok) throw new Error('HTTP request refused');
  return r.json();
}
function publicRefs(p) {
  if (!job.test(p.jobId) || !hex.test(p.agreementHash) || !hex.test(p.paymentTx) ||
      !hex.test(p.commitmentTx) || !/^stor-[a-f0-9]{40}$/.test(p.commitment)) throw new Error('Invalid references');
  // Build a new object. Additional upstream fields can never reach stdout.
  return {jobId:p.jobId, agreementHash:p.agreementHash, commitment:p.commitment,
    commitmentTx:p.commitmentTx, paymentTx:p.paymentTx};
}
async function run() {
  const mode = process.argv[2];
  if (mode === 'public') {
    console.log(JSON.stringify(publicRefs(JSON.parse(readFileSync(process.argv[3], 'utf8'))), null, 2));
  } else if (mode === 'extract') {
    // Validate every archive entry before extraction. Reject traversal, devices,
    // links and duplicate names; only the two expected source trees are admitted.
    const code = `import tarfile,pathlib,shutil
with tarfile.open('/work/tester.tar.gz','r:gz') as t:
 seen=set()
 for m in t.getmembers():
  p=pathlib.PurePosixPath(m.name)
  if p.is_absolute() or '..' in p.parts or not p.parts or p.parts[0] not in ('dacs-rfq','dacs-sdk') or not (m.isfile() or m.isdir()) or str(p) in seen: raise ValueError('unsafe archive')
  seen.add(str(p))
 for m in t.getmembers():
  dest=pathlib.Path('/work/bundle')/m.name
  if m.isdir(): dest.mkdir(parents=True,exist_ok=True,mode=0o700)
  else:
   dest.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
   with t.extractfile(m) as src, dest.open('xb') as out: shutil.copyfileobj(src,out)
   dest.chmod(0o700 if m.mode & 0o111 else 0o600)`;
    // node:22 includes Python for node-gyp; fail if safe extractor unavailable.
    const r = spawnSync('python3', ['-c', code], {stdio:'ignore'});
    if (r.status !== 0) throw new Error('Archive refused');
    for (const file of ['setup.sh','bin/register.mts','bin/buyer.mts','bin/drive.mts'])
      if (!existsSync('/work/bundle/dacs-rfq/' + file)) throw new Error('Bundle incomplete');
  } else if (mode === 'wallet') {
    const { Demos } = await import('@kynesyslabs/demosdk/websdk');
    const demos = new Demos();
    await demos.connect(process.env.DEMOS_RPC);
    const mnemonic = demos.newMnemonic(128);
    await demos.connectWallet(mnemonic);
    const address = demos.getAddress().replace(/^0x/i, '').toLowerCase();
    if (!hex.test(address)) throw new Error('Invalid wallet address');
    save(state + '/wallets.env', [
      `DEMOS_RPC=${process.env.DEMOS_RPC}`, `BUYER_WALLET="${mnemonic}"`,
      `BUYER_DID=did:demos:agent:${address}`, `SELLER_DID=${process.env.SELLER_DID}`,
      `DACS_RFQ_ROOT=${state}/root`, `MCP_TOKEN=${randomBytes(24).toString('hex')}`,
      'BUYER_CEILING_DEM=9.8',
    ].join('\n') + '\n');
    save(state + '/address.json', {address:'0x' + address});
  } else if (mode === 'faucet') {
    const {address} = JSON.parse(readFileSync(state + '/address.json', 'utf8'));
    if (!/^0x[a-f0-9]{64}$/.test(address)) throw new Error('Invalid address');
    save(state + '/faucet-attempted', 'one request; never automatically retry\n');
    save(state + '/faucet.json', await get('https://faucetbackend.demos.network/api/request', {
      method:'POST', redirect:'error', headers:{'content-type':'application/json'}, body:JSON.stringify({address}),
    }));
  } else if (mode === 'ready') {
    for (let i = 0; i < 90; i++) {
      try { await get('http://127.0.0.1:47120/demo/procurement/options'); return; }
      catch { await pause(2000); }
    }
    throw new Error('Buyer readiness timeout');
  } else if (mode === 'drive') {
    const env = readFileSync(state + '/wallets.env', 'utf8');
    const token = /^MCP_TOKEN=([a-f0-9]{48})$/m.exec(env)?.[1];
    if (!token) throw new Error('Token missing');
    const out = spawnSync('./node_modules/.bin/tsx', ['bin/drive.mts'], {
      env:{...process.env, MCP_TOKEN:token, MCP_ENDPOINT:'http://127.0.0.1:47110/mcp',
        OPEN_OFFER_DEM:'9', COUNTER_DEM:'9.5', ACCEPT_UP_TO_DEM:'9.8'},
      encoding:'utf8', timeout:480000, maxBuffer:8*1024*1024,
    });
    save(state + '/drive.stderr', out.stderr ?? '');
    save(state + '/receipts.json', out.stdout ?? '');
    if (out.status !== 0) throw new Error('Driver failed; do not repeat payment');
  } else if (mode === 'collect') {
    const r = JSON.parse(readFileSync(state + '/receipts.json', 'utf8'));
    if (!job.test(r.jobId)) throw new Error('Invalid job');
    const viewer = await get('http://127.0.0.1:47120/demo/procurement/' + r.jobId);
    save(state + '/procurement.json', viewer);
    if (r.finalPhase !== 'settled' || r.receipts?.settlement?.status !== 'settled' || viewer.status !== 'complete')
      throw new Error('Deal not settled');
    save('/work/public.json', publicRefs({jobId:r.jobId, agreementHash:r.receipts.agreementHash,
      commitment:r.receipts.commitment?.nativeAddress,
      commitmentTx:r.receipts.commitment?.anchorTxRef?.writeTxHash,
      paymentTx:r.receipts.settlement.txHash}));
  } else throw new Error('Unknown mode');
}
run().catch(() => { console.error('Private RFQ step failed; inspect private files locally.'); process.exitCode = 1; });
