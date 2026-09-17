-- The login lockout now asks two questions instead of one: how many failures
-- from THIS address for this email, and how many from anywhere. The first is
-- what makes the lock proportionate — six wrong guesses should stop the person
-- guessing, not the owner sitting somewhere else — and it needs the pair to be
-- indexed, because it runs on every sign-in attempt including the legitimate
-- ones.
--
-- The existing (email, at DESC) index still serves the second question.
CREATE INDEX IF NOT EXISTS login_attempts_email_ip_idx
  ON login_attempts (email, ip, at DESC);
