-- Every address recorded before this point was read from x-forwarded-for's
-- first entry, which is whatever the caller typed. None of them was verified
-- by anything. From now on a verified address is written bare and an
-- unverified one carries a leading "~", and the console prints the difference.
--
-- Left alone, the column would mean two different things depending on when the
-- row was written: an old row would show a bare address and read as evidence,
-- on the one page somebody opens when they think an account is compromised.
-- That is worse than either meaning on its own.
--
-- So the historic rows are marked for what they are. This is not rewriting the
-- audit trail — no address is changed, added or removed. It is recording a
-- fact about those addresses that the schema previously had no way to hold:
-- nobody checked them.
--
-- THE CUT-OFF IS THE POINT, and the first version of this file did not have
-- one. There is no migration runner in this repository and no table recording
-- what has been applied, so "run the migrations" — the documented way to
-- rebuild a database before restoring a backup, see src/lib/backup.ts — means
-- running this whole directory, every file, every time. A guard of
-- "ip NOT LIKE '~%'" stops double-prefixing but cannot tell a historic
-- unverified address from a verified one written yesterday, so a second run
-- would relabel genuinely verified addresses as unverified — irreversibly,
-- since afterwards nothing distinguishes them — and would clear any lockout
-- in flight, because the per-address count is keyed on the exact string.
--
-- Bounding it by time makes it one-shot for good. The timestamp is the moment
-- the change was deployed; nothing written after it was ever unverified by
-- default, so nothing after it is ever eligible.
UPDATE audit_log
   SET ip = '~' || ip
 WHERE ip IS NOT NULL AND ip NOT LIKE '~%'
   AND at < TIMESTAMPTZ '2026-09-17 03:20:00+00';

UPDATE sessions
   SET ip = '~' || ip
 WHERE ip IS NOT NULL AND ip NOT LIKE '~%'
   AND created_at < TIMESTAMPTZ '2026-09-17 03:20:00+00';

UPDATE login_attempts
   SET ip = '~' || ip
 WHERE ip IS NOT NULL AND ip NOT LIKE '~%'
   AND at < TIMESTAMPTZ '2026-09-17 03:20:00+00';
