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
-- Idempotent, and it cannot double-prefix.
UPDATE audit_log      SET ip = '~' || ip WHERE ip IS NOT NULL AND ip NOT LIKE '~%';
UPDATE sessions       SET ip = '~' || ip WHERE ip IS NOT NULL AND ip NOT LIKE '~%';
UPDATE login_attempts SET ip = '~' || ip WHERE ip IS NOT NULL AND ip NOT LIKE '~%';
