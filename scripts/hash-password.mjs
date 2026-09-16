// Prints a scrypt hash for a password, so an account can be created with
//   node scripts/hash-password.mjs 'the password'
// and the plaintext never has to travel anywhere near the database.
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(_scrypt);
const PARAMS = { N: 16384, r: 8, p: 1 };

const password = process.argv[2];
if (!password) { console.error('usage: node scripts/hash-password.mjs "<password>"'); process.exit(1); }

const salt = randomBytes(16);
const key = await scrypt(password.normalize('NFKC'), salt, 64, PARAMS);
console.log(`scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`);
