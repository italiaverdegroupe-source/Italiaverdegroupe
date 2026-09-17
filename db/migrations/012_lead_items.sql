-- One enquiry can now name several specimens.
--
-- A contractor pricing a villa wants four olives, two washingtonias and a
-- dozen agaves. Before this the site made them send six enquiries, which
-- arrived as six leads that somebody then had to work out were one project —
-- the cost of the omission was paid twice, by the buyer and by the owner.
--
-- jsonb rather than a lead_items table, deliberately. These rows are a
-- SNAPSHOT of what the visitor picked, in their words, at that moment: the
-- reference, the name as the catalogue showed it, and how many. They are not
-- an entity anybody edits, they are never joined to, and a specimen renamed or
-- withdrawn next month must not change what the enquiry said. A foreign key to
-- the catalogue would quietly rewrite history, which is the same reason
-- quotations snapshot their prices.
--
-- product_ref stays and still holds the first reference, so every existing
-- console link, filter and report keeps working untouched.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS items jsonb;

COMMENT ON COLUMN leads.items IS
  'Snapshot of the specimens the visitor shortlisted: [{ref, name, slug, qty}]. Not a foreign key — see 012.';
