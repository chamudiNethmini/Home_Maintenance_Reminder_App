import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { Timestamp } from 'firebase/firestore';

const require = createRequire(import.meta.url), src = fileURLToPath(new URL('../src/', import.meta.url));
function load(file, overrides = {}, cache = new Map()) {
  const full = path.resolve(src, file);
  if (cache.has(full)) return cache.get(full).exports;
  const module = { exports: {} }; cache.set(full, module);
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = id => {
    if (id in overrides) return overrides[id];
    if (id.startsWith('.')) return load(path.resolve(path.dirname(full), id + (path.extname(id) ? '' : '.ts')), overrides, cache);
    return require(id);
  };
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports);
  return module.exports;
}
const workflow = load('utils/providerWorkflow.ts');
const mapping = load('utils/providerFirestoreMapping.ts');
function fakeFirestore() {
  const records = new Map(), operations = []; let nextId = 0, failWrite = false;
  const snapshot = ref => ({ id: ref.path.split('/').at(-1), metadata: { fromCache: false }, exists: () => records.has(ref.path), data: () => records.get(ref.path) });
  const write = (type, ref, data) => {
    if (failWrite) throw Object.assign(new Error('Missing permissions'), { code: 'permission-denied' });
    operations.push({ type, path: ref.path, data });
    if (type === 'delete') records.delete(ref.path);
    else if (type === 'update') { if (!records.has(ref.path)) throw new Error('not-found'); records.set(ref.path, { ...records.get(ref.path), ...data }); }
    else records.set(ref.path, data);
  };
  const sdk = {
    Timestamp,
    collection: (_db, name) => ({ path: name }),
    doc: (...args) => args.length === 1 ? { path: args[0].path + '/generated-' + ++nextId } : { path: args.slice(1).join('/') },
    where: (field, operator, value) => ({ kind: 'where', field, operator, value }),
    orderBy: (field, direction) => ({ kind: 'order', field, direction }),
    query: (reference, ...constraints) => ({ ...reference, constraints }),
    getDoc: async ref => snapshot(ref),
    getDocs: async reference => {
      let entries = [...records.entries()].filter(([key]) => key.startsWith(reference.path + '/') && key.split('/').length === reference.path.split('/').length + 1);
      for (const constraint of reference.constraints || []) {
        if (constraint.kind === 'where') entries = entries.filter(([, value]) => constraint.operator === 'in' ? constraint.value.includes(value[constraint.field]) : value[constraint.field] === constraint.value);
      }
      return { metadata: { fromCache: false }, docs: entries.map(([key]) => snapshot({ path: key })) };
    },
    serverTimestamp: () => ({ serverTimestamp: true }),
    addDoc: async (ref, data) => { const created = { path: ref.path + '/created-' + ++nextId }; write('set', created, data); return { id: created.path.split('/').at(-1) }; },
    updateDoc: async (ref, data) => write('update', ref, data),
    deleteDoc: async ref => write('delete', ref),
    writeBatch: () => { const writes = []; return { update: (ref, data) => writes.push(['update', ref, data]), commit: async () => { if (failWrite) throw Object.assign(new Error('Missing permissions'), { code: 'permission-denied' }); writes.forEach(args => write(...args)); } }; },
    runTransaction: async (_db, action) => {
      const writes = [];
      await action({ get: async ref => snapshot(ref), update: (ref, data) => writes.push(['update', ref, data]), set: (ref, data) => writes.push(['set', ref, data]), delete: ref => writes.push(['delete', ref]) });
      if (failWrite) throw Object.assign(new Error('Missing permissions'), { code: 'permission-denied' });
      writes.forEach(args => write(...args));
    },
  };
  const overrides = { 'firebase/firestore': sdk, '../config/firebase': { db: { app: { options: { projectId: 'test-project' } } } } };
  const cache = new Map();
  return { records, operations, service: file => load('services/' + file + '.ts', overrides, cache), dev: () => load('dev/providerFirestoreTools.ts', overrides, cache), setFailWrite: value => { failWrite = value; } };
}
function fixture(fake) {
  const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  fake.records.set('warrantyRequests/r1', { customerId: 'c1', applianceId: 'a1', warrantyId: 'w1', providerId: null, status: 'pending', notes: '', customerName: 'Test Customer', customerPhone: '123', customerEmail: 'test@example.com', createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  fake.records.set('appliances/a1', { customerId: 'c1', name: 'Fridge', brand: 'Test', model: 'T1', serialNumber: 'S1', purchaseDate: day(-20) });
  fake.records.set('warranties/w1', { applianceId: 'a1', purchaseDate: day(-20), expiryDate: day(100), status: 'active', modelCovered: true });
  for (const [id, type] of [['d1', 'warranty_card'], ['d2', 'purchase_receipt']]) fake.records.set('warrantyDocuments/' + id, { warrantyRequestId: 'r1', type, fileName: id + '.pdf', fileUrl: 'https://example.com/' + id + '.pdf', verificationStatus: 'verified' });
}

test('status labels map to required lowercase Firestore values and reject unknown states', () => {
  assert.deepEqual(workflow.statuses.map(workflow.toFirestoreStatus), ['pending', 'approved', 'rejected', 'more_information_required']);
  assert.equal(workflow.requestStatus('more_information_required'), 'More Information Required');
  assert.equal(workflow.requestStatus('Approved'), 'Approved');
  assert.throws(() => workflow.requestStatus('unknown'), /Unsupported/);
});
test('Timestamp and legacy dates normalize; absent dates and model coverage remain unknown', () => {
  assert.equal(mapping.dateValue(Timestamp.fromDate(new Date('2026-09-30T01:00:00Z'))), '2026-09-30T01:00:00.000Z');
  assert.equal(mapping.dateValue(null), '');
  assert.equal(mapping.dateValue('not-a-date'), '');
  assert.equal(mapping.parseWarranty('w', { purchaseDate: Timestamp.fromDate(new Date('2026-01-01')) }).modelCovered, null);
  assert.equal(workflow.validDate('2026-02-30'), false);
});
test('read all requests has no 100-record cap and preserves missing timestamps', async () => {
  const fake = fakeFirestore();
  for (let i = 0; i < 105; i++) fake.records.set('warrantyRequests/r' + i, { status: 'pending', customerName: 'Name ' + i });
  const items = await fake.service('warrantyRequestService').getWarrantyRequests();
  assert.equal(items.length, 105);
});
test('read details joins the selected IDs and uses request contact fields', async () => {
  const fake = fakeFirestore(); fixture(fake);
  const item = await fake.service('warrantyRequestService').getWarrantyCaseById('r1');
  assert.equal(item.customer.name, 'Test Customer'); assert.equal(item.appliance.id, 'a1'); assert.equal(item.documents.length, 2);
  assert.equal(workflow.eligibility(item).every(check => check.checked), true);
  fake.records.get('appliances/a1').customerId = 'another-customer';
  await assert.rejects(() => fake.service('warrantyRequestService').getWarrantyCaseById('r1'), /do not match/);
});
test('status update atomically writes canonical status, notes, timestamp and notification', async () => {
  const fake = fakeFirestore(); fixture(fake);
  await fake.service('warrantyRequestService').updateWarrantyRequestStatus('r1', 'Approved', ' Verified ');
  assert.equal(fake.records.get('warrantyRequests/r1').status, 'approved');
  assert.equal(fake.records.get('warrantyRequests/r1').notes, 'Verified');
  assert.deepEqual(fake.records.get('warrantyRequests/r1').updatedAt, { serverTimestamp: true });
  assert.equal([...fake.records.keys()].filter(key => key.startsWith('providerNotifications/')).length, 1);
  const before = fake.operations.length;
  await fake.service('warrantyRequestService').updateWarrantyRequestStatus('r1', 'Approved', 'Verified');
  assert.equal(fake.operations.length, before);
});
test('unverified documents block approval without writes', async () => {
  const fake = fakeFirestore(); fixture(fake); fake.records.get('warrantyDocuments/d1').verificationStatus = 'pending';
  await assert.rejects(() => fake.service('warrantyRequestService').updateWarrantyRequestStatus('r1', 'Approved', ''), /Approval requires/);
  assert.equal(fake.operations.length, 0);
});
test('permission failure rejects mutation and leaves notification/request unchanged', async () => {
  const fake = fakeFirestore(); fixture(fake); fake.setFailWrite(true);
  await assert.rejects(() => fake.service('warrantyRequestService').updateWarrantyRequestStatus('r1', 'Rejected', 'Reason'), /Access denied/);
  assert.equal(fake.records.get('warrantyRequests/r1').status, 'pending'); assert.equal(fake.operations.length, 0);
});
test('detail save updates contact and related data without replacing concurrent status', async () => {
  const fake = fakeFirestore(); fixture(fake);
  const service = fake.service('warrantyRequestService'), item = await service.getWarrantyCaseById('r1');
  fake.records.get('warrantyRequests/r1').status = 'rejected'; item.customer.phone = '456'; item.appliance.model = 'T2';
  await service.saveWarrantyCaseDetails(item);
  assert.equal(fake.records.get('warrantyRequests/r1').status, 'rejected');
  assert.equal(fake.records.get('warrantyRequests/r1').customerPhone, '456');
  assert.equal(fake.records.get('appliances/a1').model, 'T2');
});
test('document review and notification read states use persistent writes', async () => {
  const fake = fakeFirestore(); fixture(fake);
  await fake.service('warrantyDocumentService').updateDocumentVerificationStatus('d1', 'Rejected');
  assert.equal(fake.records.get('warrantyDocuments/d1').verificationStatus, 'rejected');
  fake.records.set('providerNotifications/n1', { providerId: 'p1', isRead: false });
  fake.records.set('providerNotifications/n2', { providerId: 'p2', isRead: false });
  const service = fake.service('providerNotificationService');
  await service.markAllNotificationsAsRead('p1');
  assert.equal(fake.records.get('providerNotifications/n1').isRead, true); assert.equal(fake.records.get('providerNotifications/n2').isRead, false);
});
test('create and delete target only the intended request', async () => {
  const fake = fakeFirestore(); fixture(fake); const service = fake.service('warrantyRequestService');
  const id = await service.createWarrantyRequest({ customerId: 'c1', applianceId: 'a1', warrantyId: 'w1', status: 'Pending', notes: '', providerId: null, customerName: 'Test', customerPhone: '1', customerEmail: 'test@example.com', applianceName: 'Fridge' });
  assert.equal(fake.records.get('warrantyRequests/' + id).status, 'pending');
  await service.deleteWarrantyRequest(id);
  assert.equal(fake.records.has('warrantyRequests/' + id), false);
  assert.equal(fake.records.has('appliances/a1'), true);
});

test('development helper never seeds on import and rejects production calls', async () => {
  const fake = fakeFirestore(); globalThis.__DEV__ = false;
  try {
    const tools = fake.dev(); assert.equal(fake.operations.length, 0);
    await assert.rejects(() => tools.seedProviderTestData({ projectId: 'test-project', confirm: 'CREATE DEVELOPMENT TEST DATA' }), /disabled in production/);
    assert.equal(fake.operations.length, 0);
  } finally { delete globalThis.__DEV__; }
});
test('explicit development seeding is non-overwriting and cleanup requires its marker', async () => {
  const fake = fakeFirestore(); globalThis.__DEV__ = true;
  try {
    const tools = fake.dev();
    await assert.rejects(() => tools.seedProviderTestData({ projectId: 'wrong-project', confirm: 'CREATE DEVELOPMENT TEST DATA' }), /project ID/);
    const result = await tools.seedProviderTestData({ projectId: 'test-project', confirm: 'CREATE DEVELOPMENT TEST DATA' });
    assert.equal(result.requestIds.length, 3); assert.equal(fake.records.size, 17);
    await assert.rejects(() => tools.seedProviderTestData({ projectId: 'test-project', confirm: 'CREATE DEVELOPMENT TEST DATA' }), /already exist/);
    fake.records.get('appliances/fixmate-dev-appliance-1').developmentSeed = 'someone-else';
    await assert.rejects(() => tools.deleteProviderTestData({ projectId: 'test-project', confirm: 'DELETE DEVELOPMENT TEST DATA' }), /Refusing to delete/);
    assert.equal(fake.records.size, 17);
  } finally { delete globalThis.__DEV__; }
});
