import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const wrapper = resolve('scripts/private-rfq-container.sh');
const filter = resolve('scripts/private-rfq-runner.mjs');
const h = 'a'.repeat(64);
const refs = {jobId:'01M4G1KAQVAMQ3JH8TBA1Q0M2C', agreementHash:h,
  commitment:'stor-' + 'b'.repeat(40), commitmentTx:h, paymentTx:h};
const secret = 'SYNTHETIC_MNEMONIC_AND_BEARER_MUST_NOT_PRINT';
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'rfq-offline-'));
  t.after(() => rmSync(dir, {recursive:true, force:true}));
  const tar = join(dir, 'tester file.tar.gz');
  writeFileSync(tar, 'offline fixture, never executed');
  const hash = createHash('sha256').update(readFileSync(tar)).digest('hex');
  const env = {...process.env, REGISTER_URL:'https://tester.example/colony-rfq/v0/register',
    LISTING_REF:`dacs1:did%3Ademos%3Aagent%3A${h}:fixture:v1`,
    DEMOS_RPC:'https://demosnode.discus.sh/', TESTNET_ONLY:'1',
    BUYER_WALLET:secret, MCP_TOKEN:secret};
  return {dir,tar,hash,env};
}
function run(args, env) { return spawnSync('bash', [wrapper,...args], {env, encoding:'utf8'}); }
test('missing args, malformed inputs, and checksum mismatch refuse before Docker', t => {
  const {dir,tar,hash,env} = fixture(t);
  const marker = join(dir,'docker-called');
  writeFileSync(join(dir,'docker'), `#!/bin/sh\ntouch '${marker}'\nexit 99\n`, {mode:0o700});
  env.PATH = dir + ':' + env.PATH;
  for (const [args,overrides] of [
    [[],{}], [[tar,'bad'],{}], [[tar,'0'.repeat(64)],{}],
    [[tar,hash],{REGISTER_URL:''}], [[tar,hash],{LISTING_REF:''}],
    [[tar,hash],{DEMOS_RPC:'https://mainnet.example/'}],
    [[tar,hash],{TESTNET_ONLY:''}],
  ]) {
    const r = run(args,{...env,...overrides});
    assert.notEqual(r.status,0);
    assert.equal(r.stdout.includes(secret) || r.stderr.includes(secret),false);
  }
  assert.equal(readdirSync(dir).includes('docker-called'),false);
});
test('raw success and failure diagnostics stay private; only public refs print', t => {
  const {dir,tar,hash,env} = fixture(t);
  // Fake docker intercepts the command; no daemon or network call occurs.
  const docker = `#!/usr/bin/env node
const fs=require('node:fs');
const a=process.argv.slice(2);
if(a[0]==='rm')process.exit(0);
fs.writeFileSync(process.env.RFQ_TEST_ARGS,JSON.stringify(a));
const mount=a[a.indexOf('--mount')+1];
const work=mount.slice('type=bind,src='.length,-',dst=/work'.length);
console.log('${secret}');console.error('${secret}');
fs.writeFileSync(work+'/public.json',JSON.stringify(${JSON.stringify({...refs, privateKey:secret})}),{mode:0o600});
process.exit(process.env.RFQ_TEST_FAIL==='1'?1:0);
`;
  writeFileSync(join(dir,'docker'),docker,{mode:0o700});
  env.PATH=dir+':'+env.PATH;
  env.RFQ_TEST_ARGS=join(dir,'args.json');
  for (const failure of ['0','1']) {
    const r=run([tar,hash],{...env,RFQ_TEST_FAIL:failure});
    const work=/Private run directory: (\/tmp\/private-rfq\.[A-Za-z0-9]+)/.exec(r.stdout)?.[1];
    assert.ok(work);
    t.after(()=>rmSync(work,{recursive:true,force:true}));
    assert.equal(statSync(work).mode & 0o777,0o700);
    assert.equal(readFileSync(join(work,'container.log'),'utf8').includes(secret),true);
    assert.equal(r.stdout.includes(secret)||r.stderr.includes(secret),false);
    assert.equal(r.status,failure==='1'?1:0);
    if (failure==='0') assert.deepEqual(JSON.parse(r.stdout.slice(r.stdout.indexOf('{'))),refs);
    const args=JSON.parse(readFileSync(env.RFQ_TEST_ARGS,'utf8'));
    assert.equal(args.filter(x=>x==='--mount').length,1);
    assert.equal(args.some(x=>x.includes(secret)),false);
    assert.equal(args.includes('node:22'),true);
    assert.equal(args[args.indexOf('--user')+1],`${process.getuid()}:${process.getgid()}`);
    assert.equal(args.includes('--init'),true);
    assert.equal(args.includes('--network')||args.includes('-p')||args.includes('-v'),false);
  }
});
test('public filter refuses malformed references without printing raw data', t => {
  const {dir} = fixture(t);
  const path=join(dir,'public.json');
  for (const data of [{...refs,jobId:secret},{...refs,paymentTx:secret},null]) {
    writeFileSync(path,JSON.stringify(data));
    const r=spawnSync('node',[filter,'public',path],{encoding:'utf8'});
    assert.notEqual(r.status,0);
    assert.equal(r.stdout,'');
    assert.equal(r.stderr.includes(secret),false);
  }
});
