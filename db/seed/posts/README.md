# Journal articles

The article bodies as they were written, one file per language. The live copy
lives in the `posts` table and is edited from **Content → Journal** in the
console — these are the source, kept in the repository for the same reason the
migrations are: so an article can be restored, reviewed in a diff, and
translated side by side, rather than existing only in a database row.

Naming: `<slug>.<locale>.md`. The three files of one article share a slug,
which is what makes the language switcher land on the same piece rather than
on the journal index.

The front matter — title, excerpt, cover, SEO title and description — is not
in these files. It is per-language metadata that belongs with the row, and
duplicating it here would give it two homes and one of them would go stale.

Editing an article is done in the console. If a change here is meant to reach
the site, it has to be pasted in — nothing reads this directory at runtime,
deliberately: a seed that ran on boot would silently overwrite whatever the
company had since written.
