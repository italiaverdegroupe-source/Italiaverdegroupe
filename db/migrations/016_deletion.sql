-- Deleting things, which this console could not do at all.
--
-- Content could be deleted — a FAQ, an article, a testimonial. Nothing else
-- could: not a lead that was obviously spam, not a quotation raised against
-- the wrong customer, not the test data somebody enters while learning the
-- system. The only way to remove any of it was a SQL client, which means in
-- practice it stayed there for ever.
--
-- WHY A COLUMN AND NOT `DELETE FROM`. Two reasons, and the second is the one
-- that matters.
--
--   A delete is the only action in this console with no undo. Everything else
--   is a status change, a new version, or a row in a log. Somebody clearing
--   last month's cancelled orders and catching a live one has, with a hard
--   delete, destroyed an order, its items, its deliveries and its invoices in
--   one click, with nothing to restore from but last night's backup.
--
--   And the audit log points AT these rows. "Who changed this price" has to
--   stay answerable, and it cannot be answered about a row that no longer
--   exists. A soft delete keeps the record and hides it; the audit trail
--   still resolves.
--
-- A PERMANENT delete exists as well, because "hidden for ever" is not the same
-- as gone and there are rows — test data before a handover, a duplicate
-- customer — that genuinely should not survive. It is owner-only, it is
-- refused while any LIVE record still points at the row (which forces the
-- right order rather than leaving orphans behind), and it is audited before
-- it happens rather than after, because afterwards there is nothing to name.
--
-- WHAT IS DELIBERATELY NOT HERE. audit_log, login_attempts, sessions,
-- alert_runs and backup_runs get no delete of any kind. They are the record OF
-- what was done, and a system where somebody can erase the evidence of their
-- own actions has no audit trail — it has a suggestion.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'leads', 'quotes', 'orders', 'invoices', 'payments', 'deliveries',
    'shipments', 'purchase_orders', 'stock_items', 'customers', 'suppliers'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at timestamptz', t);
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_by bigint '
      'REFERENCES users(id) ON DELETE SET NULL', t);
    -- Every list reads "the ones that are not deleted", so that is the index.
    -- Partial, because the deleted rows are the rare case and indexing them
    -- with the rest would pay for them on every ordinary query.
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I (deleted_at) WHERE deleted_at IS NULL',
      t || '_live_idx', t);
  END LOOP;
END $$;

-- A deletion is an event, like any other change, and belongs in the log that
-- already answers "who did this". No new table: audit_log takes it.
COMMENT ON COLUMN leads.deleted_at IS
  'Soft delete. NULL means live. See src/lib/deletion.ts for what may be removed and what blocks it.';
