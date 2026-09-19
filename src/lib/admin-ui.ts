import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

/**
 * The console, in the language of the person using it.
 *
 * THE KEY IS THE ENGLISH. Everywhere else in this codebase a translated string
 * has an invented key — 'nav.catalog' — because those are forty strings on a
 * public page and a name makes them findable. The console has four hundred and
 * fifty, spread over twenty screens, and inventing a name for each would mean
 * four hundred and fifty decisions that add nothing: every one of them would be
 * a slightly worse name than the sentence it stands for, and a reader of
 * admin/orders/page.tsx would have to look each one up to know what the screen
 * says.
 *
 * So `t('Mark as delivered')` reads as itself, the English IS the fallback, and
 * `AdminKey` is still a union of the real strings — a typo in a call site is a
 * type error, exactly as it is in ui.ts. What is lost is the compile-time
 * guarantee that every key is translated, because a Record over 450 keys would
 * have to be written three times before anything compiled at all. That is
 * covered by a test instead, which reports coverage per language rather than
 * refusing to build.
 */

/**
 * Every string the console shows, as it reads in English.
 *
 * Grouped by where it appears so the file can be worked through a screen at a
 * time rather than alphabetically.
 */
export const ADMIN_EN = [
  "% of value",
  "% of volume",
  "(cannot sell from here)",
  "/journal/",
  "1–30 days",
  "31–60 days",
  "61–90 days",
  "A line needs a description.",
  "A long phrase you can remember beats a short puzzle you cannot. There are no rules here about symbols or capitals — they push people towards predictable passwords without making them harder to guess.",
  "A path must start with a slash.",
  "A question needs both a question and an answer.",
  "A quotation needs a customer.",
  "A testimonial cannot be published without the date the client agreed to be quoted. Publishing praise nobody consented to is a legal and reputational risk, and an anonymous testimonial reads as an invented one. Record the real conversation.",
  "A testimonial needs the words and the person who said them.",
  "A tree grows. Each row is an observation on a date, not a fixed attribute.",
  "Accepted",
  "Accepted AED",
  "Accepting reserves every specimen and lot on the quotation, in one transaction. If a tree has gone since, the whole acceptance is refused.",
  "Access notes",
  "Acclimatising",
  "Accounts",
  "Accounts are never deleted, because the audit log points at them — “who changed this price” has to stay answerable. Switch one off instead, which ends its sessions immediately.",
  "Actions",
  "Active",
  "Active rules",
  "Activity",
  "Add",
  "Add a cost",
  "Add a line",
  "Add a note",
  "Add an account",
  "Add cost",
  "Add line",
  "Add lines first.",
  "Address",
  "Address — leave empty and it is made from the title",
  "Advance",
  "Advance %",
  "Ageing",
  "Alerts",
  "All",
  "All specimens →",
  "Allocated AED",
  "Also WhatsApp",
  "Also email",
  "Amount",
  "Amount (AED)",
  "Amount (AED) *",
  "Amount must be a number.",
  "An article needs a title and a body.",
  "Another article already uses the address /journal/{slug}. Change the title or the address.",
  "Answer",
  "Anything addressed outside the console.",
  "Apply to all",
  "Arrived",
  "Asking",
  "Asking price",
  "Asking price (AED)",
  "Author",
  "BL number",
  "Back to live",
  "Back up now",
  "Backups",
  "Balance due",
  "Basis",
  "Billed to",
  "Body",
  "Bucket",
  "By emirate",
  "By enquiry",
  "Can sign in",
  "Cancel",
  "Cancel it instead",
  "Carrier",
  "Cash in stock AED",
  "Cash tied up in stock",
  "Catalogue",
  "Catalogue name",
  "Catalogue reference",
  "Catalogue reference (for product lines)",
  "Catalogue reference *",
  "Change password",
  "Change your password",
  "Changed",
  "Channel",
  "Close",
  "Close the menu",
  "Closed",
  "Code",
  "Commercial",
  "Company",
  "Company details",
  "Complete",
  "Compliance",
  "Confirm a delivery",
  "Confirmed",
  "Consent given on",
  "Consignments from Italy, their compliance paperwork, and what each one actually costs once it lands.",
  "Console",
  "Contact",
  "Contact channels",
  "Container",
  "Container no.",
  "Content",
  "Contractors here pay late, so what is owed and how late it is sits on the front page rather than in a spreadsheet.",
  "Conversion",
  "Convert an accepted quotation",
  "Cover photograph",
  "Create account",
  "Create an empty database.",
  "Create order",
  "Create quotation",
  "Create shipment",
  "Created",
  "Crown",
  "Crown width (m)",
  "Currency",
  "Current password",
  "Customer",
  "Customer LPO number",
  "Customer name",
  "Date",
  "Days held",
  "Days over",
  "Dead / written off",
  "Dealt with",
  "Dealt-with alerts are kept, not deleted. “Was anyone warned before that container sat at the port for a week” has to stay answerable.",
  "Default",
  "Delete",
  "Delete for good",
  "Delete {code}? It will be hidden from the lists, and you can put it back.",
  "Permanently remove {code} from the database? This cannot be undone by anybody, including you.",
  "Deleted",
  "Deleted {when} by {who}",
  "Deliver to",
  "Delivered",
  "Delivered by value",
  "Delivered to",
  "Deliveries",
  "Delivery",
  "Delivery terms",
  "Description",
  "Description — aim for 140–160 characters",
  "Destination port",
  "Device",
  "Disc.",
  "Discount",
  "Discount %",
  "Document type",
  "Download the archive from the bucket and load it with the",
  "Draft",
  "Driver",
  "Due",
  "Each cost is spread by its own basis — freight by volume, duty by value, handling per piece. Spreading freight by value would load it onto the expensive tree instead of the bulky one and invert the margins.",
  "Each rule is a row, so the numbers are yours to change: warn five days before an invoice falls due instead of three, or drop the low stock floor to two. What stays in code is the query behind each kind — a new kind of warning genuinely is development, and a screen pretending otherwise would be misleading.",
  "Edit",
  "Either give a lead reference and the details are carried across, or fill them in.",
  "Email",
  "Emirate",
  "English",
  "Enquiries, last 30 days",
  "Enquiry",
  "Enter an amount.",
  "Enter an email address to send the test to.",
  "Enter the TRN before switching VAT on — VAT cannot be charged without a registration number.",
  "Equipment",
  "Every document on this checklist is in and verified.",
  "Every lead sits at one stage. The percentage is how many of the previous stage reached this one.",
  "Everyone",
  "Expires",
  "FX at purchase",
  "FX rate to AED",
  "FX to AED",
  "Failed attempts on your email, whoever made them. Six failures within fifteen minutes lock the address they came from. Thirty across different addresses lock the email — but never an address you have signed in from before, so somebody else guessing can no longer shut you out of your own console. When this rule counted your email alone, six wrong guesses from anywhere did exactly that.",
  "Filter",
  "Finance",
  "First",
  "From",
  "From lead reference",
  "Fulfilment is tracked per line. An order for 200 trees arriving in three containers is normal, and the status follows the quantities rather than being set by hand.",
  "Girth",
  "Goods (AED)",
  "Goods AED",
  "Grade",
  "Gross profit",
  "Health",
  "Height",
  "Height (m)",
  "Hiab 8t, crane, low-loader",
  "Hide deleted",
  "History",
  "How consent was given",
  "How they found us",
  "How to restore one",
  "INV-000001",
  "Import costs",
  "Import permit",
  "In lots",
  "Inbox",
  "Including dealt with",
  "Incoterm",
  "Individually tracked",
  "Individually tracked specimens",
  "Info",
  "Inventory",
  "Inventory, quotations, shipments and the money behind them.",
  "Invoice",
  "Invoice code *",
  "Invoices",
  "Issued",
  "Issued quotations are never edited — repricing creates a new version and supersedes the old one, so what was actually quoted stays answerable.",
  "It cannot be switched off or demoted while it is the only one — that would leave nobody able to administer the system, and nobody inside the company could undo it. Make a second owner first if you want that freedom.",
  "Items",
  "Journal",
  "Keep this page out of search results",
  "Kind",
  "Kinds available",
  "Landed",
  "Landed cost",
  "Landed cost of everything not yet sold — incoming, acclimatising, available and reserved. This is working capital sitting in a nursery, not profit.",
  "Landed cost per line",
  "Landed total",
  "Landed unit",
  "Language",
  "Last 7 days",
  "Last check",
  "Last good backup",
  "Latest",
  "Latest enquiries",
  "Lead → sale",
  "Leads",
  "Leads by enquiry type",
  "Leads by source",
  "Line total",
  "Lines",
  "Live on the site",
  "Live quotations",
  "Living stock: dimensions are indicative and vary between individual specimens. Final size, form and availability are confirmed on despatch. This quotation is valid for {days} days from issue.",
  "Location",
  "Lost",
  "Lot units",
  "Lots",
  "Margin",
  "Margin (internal)",
  "Mark delivered",
  "Measured",
  "Measurements",
  "Menu",
  "Message",
  "Method",
  "Money",
  "Movement history",
  "Name",
  "Net",
  "New password again",
  "New password — at least 10 characters",
  "New quotation",
  "New shipment",
  "Next follow-up",
  "No articles yet.",
  "No backup has run yet.",
  "No backup storage is configured, so nothing is being backed up. The service needs BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, BACKUP_SECRET_ACCESS_KEY and BACKUP_ENDPOINT.",
  "No document checklist on this shipment yet.",
  "No document named.",
  "No invoice {code}.",
  "No invoices raised.",
  "No landed cost on these lines, so the margin shown is not real. Cost the shipment first.",
  "No lines on this shipment yet.",
  "No lines yet.",
  "No order {code}.",
  "No orders yet.",
  "No quotations yet.",
  "No rule has an address on it",
  "No rule has an address on it.",
  "No rules yet. Press",
  "No rules yet. Press “Run checks now” to install the defaults.",
  "No shipments recorded yet.",
  "No specimens match.",
  "No such record",
  "None",
  "None recorded.",
  "Not applicable — exclusive of VAT where applicable",
  "Not sellable because:",
  "Not set",
  "Not stated",
  "Not verified. This request did not come through Cloudflare, so the address is only what the caller claimed.",
  "Note",
  "Notes",
  "Nothing here yet",
  "Nothing is being sent",
  "Nothing is being sent, because no mail provider is configured.",
  "Nothing logged yet.",
  "Nothing matches.",
  "Nothing outstanding.",
  "Nothing overridden yet — the defaults are in use.",
  "Nothing queued. No rule has an email address or WhatsApp number on it.",
  "Nothing recorded.",
  "Nothing scheduled.",
  "Nothing would be emailed even with a mail provider configured. An alert with no recipient is raised in the console and goes no further.",
  "Nothing yet.",
  "ORD-000001",
  "One query per question a manager actually asks. Figures come from the snapshots stored on each document — the price quoted, the landed cost at the time — so last quarter still reads as last quarter.",
  "One tree, one row. Quantity is always one — that is the point of tracking it individually.",
  "Only the owner can change alert rules.",
  "Only the owner can change rules.",
  "Only the owner can change settings.",
  "Only the owner can permanently remove a record.",
  "Only the owner can send a test.",
  "Only this role sees it",
  "Open",
  "Open leads",
  "Open the menu",
  "Open them →",
  "Operations",
  "Order",
  "Order code *",
  "Order total",
  "Ordered",
  "Orders",
  "Origin port",
  "Outbound",
  "Outgoing",
  "Outstanding",
  "Over 90 days",
  "Overdue",
  "Overview",
  "Owner",
  "Paid",
  "Password",
  "Password again",
  "Password — at least 10 characters",
  "Payment terms",
  "Payment terms (days)",
  "Payments received",
  "Permanently removing a record cannot be undone by anybody, including you.",
  "Permit",
  "Phone",
  "Pick a catalogue reference.",
  "Pieces",
  "Pipeline",
  "Pipeline AED",
  "Point",
  "Pot",
  "Pot (litres)",
  "Prices are exclusive of VAT where applicable.",
  "Prices, discounts and the landed-cost snapshot are copied exactly as quoted — nothing is re-entered and nothing is re-derived.",
  "Print / save as PDF",
  "Profit",
  "Proforma invoice",
  "Project",
  "Proof note",
  "Publish date",
  "Published",
  "Published questions appear on the homepage and are published as structured data, so they can answer the question inside a search result rather than only on the page.",
  "Purchase cost",
  "Put a quantity against at least one line.",
  "Put a quantity against the lines going on this run. Trees need the right gear and site access, so both are recorded before it is booked.",
  "QT-000001",
  "Qty",
  "Quantity",
  "Question",
  "Questions",
  "Queued",
  "Quotation",
  "Quotation code *",
  "Quotations",
  "Quotations and invoices state “exclusive of VAT where applicable” and charge nothing. When the TRN arrives, enter it and switch VAT on — documents already issued keep the position they were issued with, which is the point.",
  "Quoted",
  "Quoted to",
  "Raise",
  "Raise an invoice",
  "Raised",
  "Reason",
  "Received",
  "Received by",
  "Received by *",
  "Received on",
  "Recent failures",
  "Recent sign-in attempts",
  "Recently changed",
  "Record",
  "Record a measurement",
  "Record a payment",
  "Record a specimen",
  "Record specimen",
  "Record the date this client agreed to be quoted before publishing. A testimonial without consent cannot go on the site.",
  "Record who received it — that is the proof of delivery.",
  "Reference",
  "Registered address",
  "Remove",
  "Reopen",
  "Repeated failed attempts temporarily lock the account.",
  "Reports",
  "Requeue the last 7 days of blocked",
  "Required by",
  "Required on site by",
  "Reserved",
  "Restore",
  "Result",
  "Retention",
  "Retention %",
  "Revenue",
  "Revise — create v",
  "Role",
  "Rows",
  "Rows in it",
  "Rules",
  "Run",
  "Run checks now",
  "Sales",
  "Save",
  "Save change",
  "Save copy",
  "Save settings",
  "Saved",
  "Saving publishes straight to the live site. Clearing a box restores the text the site ships with rather than leaving it empty. A page already being viewed may need one refresh to show the change — pages are cached and rebuilt behind the first request after a save.",
  "Schedule",
  "Schedule a delivery",
  "Scheduled",
  "Search",
  "Search description — optional",
  "Search engine",
  "Search name, company, email, reference",
  "Search title — optional",
  "Select…",
  "Sellable",
  "Sellable from",
  "Sellable now",
  "Send a test to…",
  "Send every alert to…",
  "Send what is waiting",
  "Set SMTP_URL (a mailbox on the company domain) or RESEND_API_KEY, plus MAIL_FROM, and these rows go out on the next tick. They wait with the reason attached rather than being dropped, and rather than this system claiming to have sent an email it never could.",
  "Set a new password for this account",
  "Set password",
  "Setting",
  "Setting a password here signs that account out of every device, on purpose: this is the path used when a password may be known to somebody else, and a cookie that kept working for another fortnight would make the reset decorative.",
  "Settings",
  "Severity",
  "Sharing image — a catalogue reference",
  "Shipment",
  "Shipments",
  "Show deleted",
  "Sign in",
  "Sign out",
  "Sign out everywhere",
  "Sign out everywhere else",
  "Signed in",
  "Signed in as",
  "Site address",
  "Site contact",
  "Site copy",
  "Size",
  "Social",
  "Sold",
  "Source",
  "Specimen",
  "Specimen code (for specimen lines)",
  "Specimens",
  "Specimens are tracked one by one; lots are tracked by quantity. Sellable excludes anything still acclimatising, in poor health, or sitting somewhere it cannot be sold from.",
  "Specimens tracked",
  "Spread by",
  "Start a new one instead",
  "Start the standard checklist",
  "Started",
  "State",
  "Status",
  "Stock",
  "Stock that is not moving",
  "Stored as",
  "Stored size",
  "Subject",
  "Subtotal",
  "Summary — shown in the list and to search engines",
  "Supplier",
  "System",
  "TOTAL",
  "TRN",
  "Tables",
  "Tax invoice",
  "Test",
  "Testimonials",
  "That code does not match anything in the system. It may have been cancelled, renumbered, or mistyped.",
  "That is not an email address.",
  "That record does not exist, or is already deleted.",
  "That specimen does not exist.",
  "The backup holds data only, not schema, so there is one source of truth for the shape of the database and it is the migrations.",
  "The current password is asked for even though you are already signed in: an unattended screen is the ordinary case, and this is the one action that can lock you out of your own system. Changing it signs out every other device signed in as you, and leaves this one alone.",
  "The database lives on Neon&rsquo;s free plan, which keeps six hours of point-in-time history and will not schedule its own snapshots. Six hours is not a backup policy — it is the window in which somebody has to notice. This takes a full copy every night, stores it off Neon, reads it back to check it arrived intact, and keeps a month of them.",
  "The number cannot be negative.",
  "The number is a count of days, hours or units — it has to be whole.",
  "The part of the system that speaks first. Everything else waits to be asked — an invoice falls overdue in silence, a permit lapses while a container is at sea. These are the conditions worth being interrupted for.",
  "The words on the public site, and what a search engine is told about each page. Everything here has a compiled default — clear a box and the original text comes back, so nothing typed here can leave a page blank.",
  "There is one active owner.",
  "These are the values the website and every document read at runtime. Changing them here takes effect immediately — no deploy, no developer.",
  "These override what each page already generates. Leave a box empty and the built-in title or description is used — which for the 68 catalogue pages is already written from the specimen itself, so emptying a box is safe and blanking one is not possible.",
  "This is hidden, not gone. Restore it, or remove it from the database for good.",
  "This is what the audit log records beside everything you change.",
  "This moves the stock, adds to the delivered quantities and re-derives the order status. Delivering more than remains is refused outright.",
  "This version has been issued, so its lines are locked. Use",
  "This version has been issued, so its lines are locked. Use “Revise” to create v{next} — the customer is holding this document.",
  "This version has been issued. Create a new version to change it.",
  "Title",
  "Title — aim for 50–60 characters",
  "To",
  "Topic",
  "Total",
  "Total (AED)",
  "Total landed",
  "Total leads",
  "Totals",
  "Trade licence",
  "Trading — Operations",
  "Trunk girth (cm)",
  "Try the list it should be in:",
  "Type",
  "Undo",
  "Unit",
  "Unit (AED)",
  "Unit cost",
  "Unit price (AED)",
  "Units",
  "Unknown health.",
  "Unknown kind of record.",
  "Unknown language.",
  "Unknown severity.",
  "Unknown status.",
  "Update",
  "Update status",
  "Updated",
  "Urgent",
  "VAT",
  "VAT is off and no TRN is set, so invoices carry no VAT line and are marked not applicable for e-invoicing. UAE e-invoicing is Peppol PINT AE — structured XML through an accredited provider, not a PDF — and the identifiers it needs are already on each invoice, so switching it on is a mapping rather than a migration.",
  "VAT is off, so quotations carry no VAT line and state “exclusive of VAT where applicable”. Switch it on in settings once a TRN is issued.",
  "VAT is off.",
  "VG-XXXXXXX",
  "Valid until",
  "Value won",
  "Vehicle",
  "Verde Garden",
  "Version",
  "View the site →",
  "View this language →",
  "Viewer",
  "Viewers cannot add stock.",
  "Viewers cannot change alerts.",
  "Viewers cannot change leads.",
  "Viewers cannot change quotations.",
  "Viewers cannot change shipments.",
  "Viewers cannot change stock.",
  "Viewers cannot complete deliveries.",
  "Viewers cannot create orders.",
  "Viewers cannot create quotations.",
  "Viewers cannot create shipments.",
  "Viewers cannot delete anything.",
  "Viewers cannot edit content.",
  "Viewers cannot raise invoices.",
  "Viewers cannot record measurements.",
  "Viewers cannot record payments.",
  "Viewers cannot revise quotations.",
  "Viewers cannot schedule deliveries.",
  "Volume each (m³)",
  "Warning",
  "Weight each (kg)",
  "What",
  "What is on the way",
  "What the roles mean",
  "What they said",
  "What was said, what was agreed, what is next.",
  "WhatsApp",
  "When",
  "Where",
  "Where the money is",
  "Where they are",
  "Where you are signed in",
  "Which channel generates revenue",
  "Which trees make money",
  "Who",
  "Who buys, and who comes back",
  "Who can sign in, and what they may do. The roles have been in the database since the beginning and every page respects them — this is the screen that lets you use them without a developer.",
  "Who converts",
  "Why this cannot be removed yet",
  "Win rate — none decided yet",
  "Won",
  "Wording — leave empty for the built-in text.",
  "Work this lead",
  "You can see these, but only the owner can change them.",
  "You can see this, but only an owner can change it.",
  "You can see this, but you cannot change it.",
  "You have read-only access.",
  "Your account",
  "Your name",
  "Your reference",
  "Zero because no landed cost has been recorded against stock yet — cost a shipment and this fills in.",
  "advance — the agreed percentage up front",
  "at least 10 characters",
  "been sitting",
  "cannot sell from",
  "edited",
  "email of 12 March, site meeting…",
  "gate width, overhead cables, community timing rules",
  "h ago",
  "health is",
  "just now",
  "lead has",
  "leads have",
  "locked at purchase",
  "min ago",
  "moved",
  "name of whoever signed for it",
  "nobody",
  "not sellable",
  "olive-trees-gulf-summer",
  "product — from the catalogue",
  "proforma",
  "retention — released after the holding period",
  "sellable",
  "service — delivery, crane, planting",
  "specimen {code}",
  "specimen — one named tree",
  "status is",
  "still acclimatising until",
  "system",
  "tax invoice — the order",
  "translated",
  "uncontacted for more than 24 hours.",
  // The name of a kind of record, lower case, for use inside a sentence.
  "enquiry",
  "quotation",
  "order",
  "invoice",
  "payment",
  "delivery",
  "shipment",
  "specimen",
  "customer",
  "supplier",
  "shipment line",
  "shipment cost",
  "shipment document",
  "quotation line",
  "order line",
  "purchase order",
  "Still linked to this {parent}: {n} × {child}. Remove those first.",
  "That record no longer exists.",
  "Delete it first. Permanently removing a record that is still live is one click away from removing the wrong one.",
  "This invoice has payments against it. An invoice that has been paid is an accounting record the law requires to be kept — cancel it instead, which voids it without erasing it.",
  "A received payment is an accounting record. Reverse it with a credit rather than deleting the evidence that money arrived.",
  // The shipment document checklist: what a consignment of live plants
  // needs before it moves, and how far along each one is.
  "Import permit (MOCCAE)",
  "Phytosanitary certificate",
  "CITES certificate",
  "Commercial invoice",
  "Packing list",
  "Bill of lading / airway bill",
  "Certificate of origin",
  "Customs declaration",
  "Other",
  "Remove {doc}",
  "Required",
  "Requested",
  "Verified",
  "Not applicable",
  "Trade licence {n}",
  "TRN {n}",
  "WhatsApp {n}",
  "Import permit {n} expired on {date}. A consignment of live plants cannot clear on an expired permit — it will sit at the port accruing storage. Renew before arrival.",
  "{n} of {total} still outstanding",
  "{n} expired",
  "{n} expiring within 30 days",
  "A container does not clear on the strength of the ones that are done.",
  "Nothing needs attention. The checks ran {when} — if that says never, press “Run checks now”.",
  "never",
  "This run has been delivered: the stock has moved and the order counts it. Mark it failed or cancelled instead of erasing what happened.",
  "Something went wrong",
  "This screen could not finish loading. Nothing you were doing has been lost — the records are unchanged. Try again, and if it keeps happening send the reference below.",
  "Try again",
  "Put {code} back? It will appear in the lists again.",
  "Credit note",
  "Account name",
  "Bank",
  "Cancelled",
  "Payment",
  "Please quote {code} on the transfer.",
  "Bank: account name",
  "Bank: name and branch",
  "Bank: IBAN",
  "Bank: SWIFT / BIC",
  "Note printed under the bank details",
  "Legal name",
  "Brand name",
  "Tagline",
  "WhatsApp number (digits, with country code)",
  "WhatsApp, as displayed",
  "City / emirate",
  "Country",
  "Instagram link",
  "LinkedIn link",
  "Facebook link",
  "YouTube link",
  "TikTok link",
  "Trade licence number",
  "Founded (year, or yyyy-mm-dd)",
  "Founded in (city, country)",
  "Italian company behind this one, if any",
  "Its website",
  "Growing / trading in Italy since (year)",
  "TRN (tax registration number)",
  "Charge VAT",
  "VAT rate (0.05 = 5%)",
  "Quotation validity (days)",
  "Registered office",
  "Commerce",
  "New enquiry",
  "Enquiry still unanswered",
  "Follow-up due",
  "Quotation accepted",
  "Quotation about to expire",
  "Order confirmed",
  "Delivery coming up",
  "Shipment arriving",
  "Import permit expiring",
  "Invoice falling due",
  "Invoice overdue",
  "Payment received",
  "Stock running low",
  "Stock not moving",
  "Tree in poor health",
  "No recent backup",
  "Customer over credit limit",
  "The first hour decides the sale. An enquiry that waits until someone opens the list has usually already been answered by a competitor.",
  "Catches what the arrival alert missed — an enquiry nobody has touched after the given number of hours.",
  "A promised call that never happens costs the deal and the reputation. Fires for follow-ups due within the given number of days.",
  "Acceptance starts a clock: stock is reserved, the order has to be raised and the customer expects confirmation the same day.",
  "A quotation nearing its validity date is the cheapest sale left in the pipeline — one call, on a price already agreed.",
  "Confirmation is where fulfilment, invoicing and delivery planning all begin.",
  "A delivery needs a crane, a permit and a driver arranged the day before, not the morning of. Fires for deliveries scheduled within the given number of days.",
  "Live trees do not wait at a port. Clearance, transport and yard space have to be ready before the container lands, not after demurrage starts.",
  "A MOCCAE permit is valid six months. If it lapses while a container is at sea, the shipment cannot clear — and a container of live trees sitting at the port is the most expensive failure in this business.",
  "A reminder before the due date collects far more than a chase after it, and costs nothing in goodwill.",
  "Contractors here pay late as a matter of course. The alert re-raises as the debt crosses 30, 60 and 90 days, because each band is a different conversation.",
  "Cash landing is the only event that closes the loop, and the one the owner most wants to see.",
  "Replacement stock comes from Italy with a lead time measured in weeks, so the reorder decision has to be made while there is still something to sell.",
  "Living stock costs water, labour and space every month it waits, and a tree that has not sold in months is usually mispriced rather than unlucky.",
  "A stressed tree can be saved; a dead one is a written-off asset. This is the alert that pays for itself first.",
  "A backup system fails silently — nothing breaks when it stops, and the discovery happens on the one day it was needed. This is the alert that makes the silence audible.",
  "The limit exists to stop one contractor quietly becoming the whole receivables book. Crossing it should be a decision, not a discovery.",
  "Hours without contact",
  "Days ahead",
  "Days before expiry",
  "Days before ETA",
  "Days before due",
  "Days past due",
  "Units remaining or fewer",
  "Days in stock",
  "Hours since the last good backup",
  "on the event",
  "on a schedule",
  "{n} in total. A kind with no rule raises nothing — silence is a choice, not a fault.",
  "specimens",
  "emirates",
  "languages",
  "Italian roots for a greener tomorrow",
  "Mature specimens lifted in Italy, cleared, acclimatised and planted across the Emirates.",
  "Dubai",
  "Welcome back",
  "Welcome back, {name}",
  "Name greeted on the sign-in screen",
  "unverified",
  "version {n}",
  "why this changed",
  "{emirate}, United Arab Emirates",
  "{min}–{max} weeks from order confirmation to site.",
  "{n} of {total} rules send an email.",
  "· AED",
  "← All leads",
  "← Inventory",
  "← Orders",
  "← Quotations",
  "← Shipments",
  "− AED",
] as const;

export type AdminKey = (typeof ADMIN_EN)[number];

/**
 * Italian first, because the person who owns this company reads Italian and
 * runs the business from these screens every day. Trade vocabulary rather than
 * a dictionary rendering: a quotation is a preventivo, a consignment a partita,
 * stock is giacenza, landed cost is costo sdoganato.
 */
const it: Partial<Record<AdminKey, string>> = {
  "% of value":
    "% del valore",
  "% of volume":
    "% del volume",
  "(cannot sell from here)":
    "(non si può vendere da qui)",
  "/journal/":
    "/journal/",
  "1–30 days":
    "1–30 giorni",
  "31–60 days":
    "31–60 giorni",
  "61–90 days":
    "61–90 giorni",
  "A line needs a description.":
    "Una riga richiede una descrizione.",
  "A long phrase you can remember beats a short puzzle you cannot. There are no rules here about symbols or capitals — they push people towards predictable passwords without making them harder to guess.":
    "Una frase lunga che ricordate vale più di un rompicapo corto che dimenticate. Qui non ci sono regole su simboli o maiuscole: spingono verso password prevedibili senza renderle più difficili da indovinare.",
  "A path must start with a slash.":
    "Un percorso deve iniziare con una barra.",
  "A question needs both a question and an answer.":
    "Una FAQ richiede sia la domanda sia la risposta.",
  "A quotation needs a customer.":
    "Un preventivo richiede un cliente.",
  "A testimonial cannot be published without the date the client agreed to be quoted. Publishing praise nobody consented to is a legal and reputational risk, and an anonymous testimonial reads as an invented one. Record the real conversation.":
    "Una testimonianza non può essere pubblicata senza la data in cui il cliente ha acconsentito a essere citato. Pubblicare un elogio non autorizzato è un rischio legale e reputazionale, e una testimonianza anonima sembra inventata. Registrate la conversazione reale.",
  "A testimonial needs the words and the person who said them.":
    "Una testimonianza richiede le parole e chi le ha dette.",
  "A tree grows. Each row is an observation on a date, not a fixed attribute.":
    "Un albero cresce. Ogni riga è un'osservazione a una data, non un attributo fisso.",
  "Accepted":
    "Accettato",
  "Accepted AED":
    "Accettato AED",
  "Accepting reserves every specimen and lot on the quotation, in one transaction. If a tree has gone since, the whole acceptance is refused.":
    "L’accettazione riserva ogni esemplare e ogni lotto del preventivo, in un’unica transazione. Se nel frattempo un albero è stato venduto, l’intera accettazione viene rifiutata.",
  "Access notes":
    "Note di accesso",
  "Acclimatising":
    "In acclimatazione",
  "Accounts":
    "Utenti",
  "Accounts are never deleted, because the audit log points at them — “who changed this price” has to stay answerable. Switch one off instead, which ends its sessions immediately.":
    "Gli utenti non vengono mai eliminati, perché il registro di controllo li richiama: “chi ha modificato questo prezzo” deve restare una domanda con risposta. Disattivatelo invece, cosa che ne chiude subito le sessioni.",
  "Actions":
    "Azioni",
  "Active":
    "Attivo",
  "Active rules":
    "Regole attive",
  "Activity":
    "Attività",
  "Add":
    "Aggiungi",
  "Add a cost":
    "Aggiungi un costo",
  "Add a line":
    "Aggiungi una riga",
  "Add a note":
    "Aggiungi una nota",
  "Add an account":
    "Aggiungi un utente",
  "Add cost":
    "Aggiungi costo",
  "Add line":
    "Aggiungi riga",
  "Add lines first.":
    "Aggiungi prima le righe.",
  "Address":
    "Indirizzo",
  "Address — leave empty and it is made from the title":
    "Indirizzo — lascia vuoto e viene creato dal titolo",
  "Advance":
    "Acconto",
  "Advance %":
    "Acconto %",
  "Ageing":
    "Scaduto da",
  "Alerts":
    "Avvisi",
  "All":
    "Tutti",
  "All specimens →":
    "Tutti gli esemplari →",
  "Allocated AED":
    "Impegnato AED",
  "Also WhatsApp":
    "Anche WhatsApp",
  "Also email":
    "Anche e-mail",
  "Amount":
    "Importo",
  "Amount (AED)":
    "Importo (AED)",
  "Amount (AED) *":
    "Importo (AED) *",
  "Amount must be a number.":
    "L'importo deve essere un numero.",
  "An article needs a title and a body.":
    "Un articolo richiede un titolo e un testo.",
  "Another article already uses the address /journal/{slug}. Change the title or the address.":
    "Un altro articolo usa già l'indirizzo /journal/{slug}. Cambiate il titolo o l'indirizzo.",
  "Answer":
    "Risposta",
  "Anything addressed outside the console.":
    "Tutto ciò che è indirizzato fuori dalla console.",
  "Apply to all":
    "Applica a tutte",
  "Arrived":
    "Arrivata",
  "Asking":
    "Richiesto",
  "Asking price":
    "Prezzo richiesto",
  "Asking price (AED)":
    "Prezzo richiesto (AED)",
  "Author":
    "Autore",
  "BL number":
    "Numero di polizza",
  "Back to live":
    "Torna agli attivi",
  "Back up now":
    "Esegui il backup adesso",
  "Backups":
    "Backup",
  "Balance due":
    "Saldo dovuto",
  "Basis":
    "Base di riparto",
  "Billed to":
    "Fatturato a",
  "Body":
    "Testo",
  "Bucket":
    "Bucket",
  "By emirate":
    "Per emirato",
  "By enquiry":
    "Per tipo di richiesta",
  "Can sign in":
    "Può accedere",
  "Cancel":
    "Annulla",
  "Cancel it instead":
    "Annullala invece",
  "Carrier":
    "Vettore",
  "Cash in stock AED":
    "Capitale in giacenza AED",
  "Cash tied up in stock":
    "Capitale immobilizzato in giacenza",
  "Catalogue":
    "Catalogo",
  "Catalogue name":
    "Nome a catalogo",
  "Catalogue reference":
    "Riferimento a catalogo",
  "Catalogue reference (for product lines)":
    "Riferimento a catalogo (per righe prodotto)",
  "Catalogue reference *":
    "Riferimento a catalogo *",
  "Change password":
    "Cambia password",
  "Change your password":
    "Cambia la tua password",
  "Changed":
    "Modificato",
  "Channel":
    "Canale",
  "Close":
    "Chiudi",
  "Close the menu":
    "Chiudi il menu",
  "Closed":
    "Chiusi",
  "Code":
    "Codice",
  "Commercial":
    "Commerciale",
  "Company":
    "Azienda",
  "Company details":
    "Dati aziendali",
  "Complete":
    "Completata",
  "Compliance":
    "Conformità",
  "Confirm a delivery":
    "Conferma una consegna",
  "Confirmed":
    "Confermata",
  "Consent given on":
    "Consenso rilasciato il",
  "Consignments from Italy, their compliance paperwork, and what each one actually costs once it lands.":
    "Le partite dall’Italia, la documentazione di conformità e quanto ciascuna costa davvero una volta sdoganata.",
  "Console":
    "Console",
  "Contact":
    "Contatto",
  "Contact channels":
    "Canali di contatto",
  "Container":
    "Container",
  "Container no.":
    "N. container",
  "Content":
    "Contenuti",
  "Contractors here pay late, so what is owed and how late it is sits on the front page rather than in a spreadsheet.":
    "Qui le imprese pagano in ritardo, perciò quanto è dovuto e da quanto tempo sta in prima pagina e non in un foglio di calcolo.",
  "Conversion":
    "Conversione",
  "Convert an accepted quotation":
    "Converti un preventivo accettato",
  "Cover photograph":
    "Fotografia di copertina",
  "Create account":
    "Crea utente",
  "Create an empty database.":
    "Crea un database vuoto.",
  "Create order":
    "Crea ordine",
  "Create quotation":
    "Crea preventivo",
  "Create shipment":
    "Crea spedizione",
  "Created":
    "Creato",
  "Crown":
    "Chioma",
  "Crown width (m)":
    "Larghezza chioma (m)",
  "Currency":
    "Valuta",
  "Current password":
    "Password attuale",
  "Customer":
    "Cliente",
  "Customer LPO number":
    "Numero LPO cliente",
  "Customer name":
    "Nome cliente",
  "Date":
    "Data",
  "Days held":
    "Giorni in giacenza",
  "Days over":
    "Giorni di ritardo",
  "Dead / written off":
    "Morta / svalutata",
  "Dealt with":
    "Gestito",
  "Dealt-with alerts are kept, not deleted. “Was anyone warned before that container sat at the port for a week” has to stay answerable.":
    "Gli avvisi gestiti si conservano, non si eliminano. “Qualcuno era stato avvisato prima che quel container restasse in porto per una settimana” deve restare una domanda con risposta.",
  "Default":
    "Predefinito",
  "Delete":
    "Elimina",
  "Delete for good":
    "Elimina definitivamente",
  "Delete {code}? It will be hidden from the lists, and you can put it back.":
    "Eliminare {code}? Sarà nascosto dagli elenchi e potrai ripristinarlo.",
  "Permanently remove {code} from the database? This cannot be undone by anybody, including you.":
    "Rimuovere definitivamente {code} dal database? Nessuno potrà annullare questa operazione, tu compreso.",
  "Deleted":
    "Eliminati",
  "Deleted {when} by {who}":
    "Eliminato il {when} da {who}",
  "Deliver to":
    "Consegnare a",
  "Delivered":
    "Consegnato",
  "Delivered by value":
    "Consegnato a valore",
  "Delivered to":
    "Consegnato a",
  "Deliveries":
    "Consegne",
  "Delivery":
    "Consegna",
  "Delivery terms":
    "Termini di consegna",
  "Description":
    "Descrizione",
  "Description — aim for 140–160 characters":
    "Descrizione — punta a 140–160 caratteri",
  "Destination port":
    "Porto di destinazione",
  "Device":
    "Dispositivo",
  "Disc.":
    "Sc.",
  "Discount":
    "Sconto",
  "Discount %":
    "Sconto %",
  "Document type":
    "Tipo di documento",
  "Download the archive from the bucket and load it with the":
    "Scaricate l'archivio dal bucket e caricatelo con",
  "Draft":
    "Bozza",
  "Driver":
    "Autista",
  "Due":
    "Scadenza",
  "Each cost is spread by its own basis — freight by volume, duty by value, handling per piece. Spreading freight by value would load it onto the expensive tree instead of the bulky one and invert the margins.":
    "Ogni costo si ripartisce secondo la propria base: il nolo a volume, il dazio a valore, la movimentazione a pezzo. Ripartire il nolo a valore lo caricherebbe sull’albero costoso invece che su quello ingombrante, invertendo i margini.",
  "Each rule is a row, so the numbers are yours to change: warn five days before an invoice falls due instead of three, or drop the low stock floor to two. What stays in code is the query behind each kind — a new kind of warning genuinely is development, and a screen pretending otherwise would be misleading.":
    "Ogni regola è una riga, quindi i numeri sono vostri da cambiare: avvisare cinque giorni prima della scadenza di una fattura invece di tre, o abbassare a due la soglia di scorta minima. Resta nel codice la query dietro ciascun tipo — un nuovo tipo di avviso è davvero sviluppo, e una schermata che fingesse il contrario sarebbe fuorviante.",
  "Edit":
    "Modifica",
  "Either give a lead reference and the details are carried across, or fill them in.":
    "Indica un riferimento richiesta e i dati vengono riportati, oppure compilali.",
  "Email":
    "E-mail",
  "Emirate":
    "Emirato",
  "English":
    "Inglese",
  "Enquiries, last 30 days":
    "Richieste, ultimi 30 giorni",
  "Enquiry":
    "Richiesta",
  "Enter an amount.":
    "Inserite un importo.",
  "Enter an email address to send the test to.":
    "Inserite un indirizzo e-mail a cui inviare il test.",
  "Enter the TRN before switching VAT on — VAT cannot be charged without a registration number.":
    "Inserite il numero di registrazione fiscale prima di attivare l'IVA — l'IVA non può essere addebitata senza un numero di registrazione.",
  "Equipment":
    "Attrezzatura",
  "Every document on this checklist is in and verified.":
    "Tutti i documenti della lista sono presenti e verificati.",
  "Every lead sits at one stage. The percentage is how many of the previous stage reached this one.":
    "Ogni richiesta si trova in una sola fase. La percentuale indica quante della fase precedente sono arrivate a questa.",
  "Everyone":
    "Tutti",
  "Expires":
    "Scade",
  "FX at purchase":
    "Cambio all'acquisto",
  "FX rate to AED":
    "Cambio in AED",
  "FX to AED":
    "Cambio AED",
  "Failed attempts on your email, whoever made them. Six failures within fifteen minutes lock the address they came from. Thirty across different addresses lock the email — but never an address you have signed in from before, so somebody else guessing can no longer shut you out of your own console. When this rule counted your email alone, six wrong guesses from anywhere did exactly that.":
    "Tentativi falliti sulla vostra e-mail, da chiunque provengano. Sei fallimenti in quindici minuti bloccano l’indirizzo da cui arrivano. Trenta da indirizzi diversi bloccano l’e-mail — ma mai un indirizzo dal quale avete già effettuato l’accesso, così che chi tenta a caso non possa più chiudervi fuori dalla vostra console. Quando questa regola contava solo l’e-mail, sei tentativi sbagliati da qualsiasi luogo facevano esattamente questo.",
  "Filter":
    "Filtra",
  "Finance":
    "Amministrazione",
  "First":
    "Primo",
  "From":
    "Da",
  "From lead reference":
    "Da riferimento richiesta",
  "Fulfilment is tracked per line. An order for 200 trees arriving in three containers is normal, and the status follows the quantities rather than being set by hand.":
    "L’evasione è tracciata per riga. Un ordine di 200 alberi che arriva in tre container è normale, e lo stato segue le quantità invece di essere impostato a mano.",
  "Girth":
    "Circonferenza",
  "Goods (AED)":
    "Merce (AED)",
  "Goods AED":
    "Merce AED",
  "Grade":
    "Categoria",
  "Gross profit":
    "Utile lordo",
  "Health":
    "Stato fitosanitario",
  "Height":
    "Altezza",
  "Height (m)":
    "Altezza (m)",
  "Hiab 8t, crane, low-loader":
    "Gru Hiab 8t, autogru, carrellone",
  "Hide deleted":
    "Nascondi gli eliminati",
  "History":
    "Storico",
  "How consent was given":
    "Come è stato dato il consenso",
  "How they found us":
    "Come ci hanno trovato",
  "How to restore one":
    "Come ripristinarne uno",
  "INV-000001":
    "INV-000001",
  "Import costs":
    "Costi di importazione",
  "Import permit":
    "Permesso di importazione",
  "In lots":
    "A lotti",
  "Inbox":
    "In arrivo",
  "Including dealt with":
    "Inclusi quelli gestiti",
  "Incoterm":
    "Incoterm",
  "Individually tracked":
    "Tracciato singolarmente",
  "Individually tracked specimens":
    "Esemplari tracciati singolarmente",
  "Info":
    "Informazione",
  "Inventory":
    "Magazzino",
  "Inventory, quotations, shipments and the money behind them.":
    "Magazzino, preventivi, spedizioni e il denaro che ci sta dietro.",
  "Invoice":
    "Fattura",
  "Invoice code *":
    "Codice fattura *",
  "Invoices":
    "Fatture",
  "Issued":
    "Emessa",
  "Issued quotations are never edited — repricing creates a new version and supersedes the old one, so what was actually quoted stays answerable.":
    "I preventivi emessi non si modificano mai: una nuova quotazione crea una versione che sostituisce la precedente, così ciò che è stato realmente quotato resta verificabile.",
  "It cannot be switched off or demoted while it is the only one — that would leave nobody able to administer the system, and nobody inside the company could undo it. Make a second owner first if you want that freedom.":
    "Non può essere disattivato né declassato finché è l’unico: non resterebbe nessuno in grado di amministrare il sistema, e nessuno in azienda potrebbe rimediare. Create prima un secondo titolare, se volete quella libertà.",
  "Items":
    "Voci",
  "Journal":
    "Giornale",
  "Keep this page out of search results":
    "Escludi questa pagina dai risultati di ricerca",
  "Kind":
    "Tipo",
  "Kinds available":
    "Tipi disponibili",
  "Landed":
    "Sdoganato",
  "Landed cost":
    "Costo sdoganato",
  "Landed cost of everything not yet sold — incoming, acclimatising, available and reserved. This is working capital sitting in a nursery, not profit.":
    "Costo sdoganato di tutto ciò che non è ancora venduto: in arrivo, in acclimatazione, disponibile e riservato. È capitale circolante fermo in vivaio, non utile.",
  "Landed cost per line":
    "Costo sdoganato per riga",
  "Landed total":
    "Totale sdoganato",
  "Landed unit":
    "Unitario sdoganato",
  "Language":
    "Lingua",
  "Last 7 days":
    "Ultimi 7 giorni",
  "Last check":
    "Ultimo controllo",
  "Last good backup":
    "Ultimo backup valido",
  "Latest":
    "Più recenti",
  "Latest enquiries":
    "Ultime richieste",
  "Lead → sale":
    "Richiesta → vendita",
  "Leads":
    "Richieste",
  "Leads by enquiry type":
    "Contatti per tipo di richiesta",
  "Leads by source":
    "Contatti per origine",
  "Line total":
    "Totale riga",
  "Lines":
    "Righe",
  "Live on the site":
    "Pubblicato sul sito",
  "Live quotations":
    "Preventivi attivi",
  "Living stock: dimensions are indicative and vary between individual specimens. Final size, form and availability are confirmed on despatch. This quotation is valid for {days} days from issue.":
    "Materiale vivo: le dimensioni sono indicative e variano da un esemplare all'altro. Misura, forma e disponibilità definitive sono confermate alla spedizione. Questo preventivo è valido {days} giorni dall'emissione.",
  "Location":
    "Ubicazione",
  "Lost":
    "Persa",
  "Lot units":
    "Unità del lotto",
  "Lots":
    "Lotti",
  "Margin":
    "Margine",
  "Margin (internal)":
    "Margine (interno)",
  "Mark delivered":
    "Segna come consegnato",
  "Measured":
    "Misurato",
  "Measurements":
    "Misurazioni",
  "Menu":
    "Menu",
  "Message":
    "Messaggio",
  "Method":
    "Metodo",
  "Money":
    "Contabilità",
  "Movement history":
    "Storico dei movimenti",
  "Name":
    "Nome",
  "Net":
    "Netto",
  "New password again":
    "Ripeti la nuova password",
  "New password — at least 10 characters":
    "Nuova password — almeno 10 caratteri",
  "New quotation":
    "Nuovo preventivo",
  "New shipment":
    "Nuova spedizione",
  "Next follow-up":
    "Prossimo contatto",
  "No articles yet.":
    "Ancora nessun articolo.",
  "No backup has run yet.":
    "Nessun backup ancora eseguito.",
  "No backup storage is configured, so nothing is being backed up. The service needs BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, BACKUP_SECRET_ACCESS_KEY and BACKUP_ENDPOINT.":
    "Nessuno spazio di backup è configurato, quindi non viene salvato nulla. Il servizio richiede BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, BACKUP_SECRET_ACCESS_KEY e BACKUP_ENDPOINT.",
  "No document checklist on this shipment yet.":
    "Nessuna lista documenti su questa spedizione.",
  "No document named.":
    "Nessun documento indicato.",
  "No invoice {code}.":
    "Nessuna fattura {code}.",
  "No invoices raised.":
    "Nessuna fattura emessa.",
  "No landed cost on these lines, so the margin shown is not real. Cost the shipment first.":
    "Nessun costo sdoganato su queste righe, quindi il margine mostrato non è reale. Costificate prima la spedizione.",
  "No lines on this shipment yet.":
    "Nessuna riga su questa spedizione.",
  "No lines yet.":
    "Ancora nessuna riga.",
  "No order {code}.":
    "Nessun ordine {code}.",
  "No orders yet.":
    "Ancora nessun ordine.",
  "No quotations yet.":
    "Ancora nessun preventivo.",
  "No rule has an address on it":
    "Nessuna regola ha un indirizzo",
  "No rule has an address on it.":
    "Nessuna regola ha un indirizzo.",
  "No rules yet. Press":
    "Ancora nessuna regola. Premete",
  "No rules yet. Press “Run checks now” to install the defaults.":
    "Ancora nessuna regola. Premete «Esegui i controlli ora» per installare quelle predefinite.",
  "No shipments recorded yet.":
    "Nessuna spedizione registrata.",
  "No specimens match.":
    "Nessun esemplare corrisponde.",
  "No such record":
    "Nessun record di questo tipo",
  "None":
    "Nessuno",
  "None recorded.":
    "Nessuna registrata.",
  "Not applicable — exclusive of VAT where applicable":
    "Non applicabile — IVA esclusa ove applicabile",
  "Not sellable because:":
    "Non vendibile perché:",
  "Not set":
    "Non impostato",
  "Not stated":
    "Non indicato",
  "Not verified. This request did not come through Cloudflare, so the address is only what the caller claimed.":
    "Non verificato. Questa richiesta non è passata da Cloudflare, quindi l’indirizzo è solo quello dichiarato dal chiamante.",
  "Note":
    "Nota",
  "Notes":
    "Note",
  "Nothing here yet":
    "Ancora nulla qui",
  "Nothing is being sent":
    "Non viene inviato nulla",
  "Nothing is being sent, because no mail provider is configured.":
    "Non viene inviato nulla, perché non è configurato alcun provider di posta.",
  "Nothing logged yet.":
    "Ancora nulla registrato.",
  "Nothing matches.":
    "Nessun risultato.",
  "Nothing outstanding.":
    "Nulla in sospeso.",
  "Nothing overridden yet — the defaults are in use.":
    "Nessuna sostituzione — sono in uso i valori predefiniti.",
  "Nothing queued. No rule has an email address or WhatsApp number on it.":
    "Nulla in coda. Nessuna regola ha un’e-mail o un numero WhatsApp.",
  "Nothing recorded.":
    "Nulla registrato.",
  "Nothing scheduled.":
    "Nulla in programma.",
  "Nothing would be emailed even with a mail provider configured. An alert with no recipient is raised in the console and goes no further.":
    "Nulla verrebbe inviato per e-mail nemmeno con un provider di posta configurato. Un avviso senza destinatario compare in console e non va oltre.",
  "Nothing yet.":
    "Ancora nulla.",
  "ORD-000001":
    "ORD-000001",
  "One query per question a manager actually asks. Figures come from the snapshots stored on each document — the price quoted, the landed cost at the time — so last quarter still reads as last quarter.":
    "Una query per ogni domanda che un responsabile si pone davvero. I numeri vengono dalle istantanee salvate su ciascun documento — il prezzo quotato, il costo sdoganato di allora — così il trimestre scorso continua a leggersi come il trimestre scorso.",
  "One tree, one row. Quantity is always one — that is the point of tracking it individually.":
    "Un albero, una riga. La quantità è sempre uno: è proprio il senso di tracciarlo singolarmente.",
  "Only the owner can change alert rules.":
    "Solo il titolare può modificare le regole di avviso.",
  "Only the owner can change rules.":
    "Solo il titolare può modificare le regole.",
  "Only the owner can change settings.":
    "Solo il titolare può modificare le impostazioni.",
  "Only the owner can permanently remove a record.":
    "Solo il titolare può rimuovere definitivamente un record.",
  "Only the owner can send a test.":
    "Solo il titolare può inviare un test.",
  "Only this role sees it":
    "Lo vede solo questo ruolo",
  "Open":
    "Aperti",
  "Open leads":
    "Richieste aperte",
  "Open the menu":
    "Apri il menu",
  "Open them →":
    "Aprile →",
  "Operations":
    "Operativo",
  "Order":
    "Ordine",
  "Order code *":
    "Codice ordine *",
  "Order total":
    "Totale ordine",
  "Ordered":
    "Ordinato",
  "Orders":
    "Ordini",
  "Origin port":
    "Porto di partenza",
  "Outbound":
    "In uscita",
  "Outgoing":
    "In uscita",
  "Outstanding":
    "In sospeso",
  "Over 90 days":
    "Oltre 90 giorni",
  "Overdue":
    "Scaduto",
  "Overview":
    "Panoramica",
  "Owner":
    "Titolare",
  "Paid":
    "Pagato",
  "Password":
    "Password",
  "Password again":
    "Ripeti la password",
  "Password — at least 10 characters":
    "Password — almeno 10 caratteri",
  "Payment terms":
    "Termini di pagamento",
  "Payment terms (days)":
    "Termini di pagamento (giorni)",
  "Payments received":
    "Pagamenti ricevuti",
  "Permanently removing a record cannot be undone by anybody, including you.":
    "La rimozione definitiva di un record non può essere annullata da nessuno, nemmeno da voi.",
  "Permit":
    "Permesso",
  "Phone":
    "Telefono",
  "Pick a catalogue reference.":
    "Scegliete un riferimento di catalogo.",
  "Pieces":
    "Pezzi",
  "Pipeline":
    "Flusso commerciale",
  "Pipeline AED":
    "Pipeline AED",
  "Point":
    "Puntate",
  "Pot":
    "Vaso",
  "Pot (litres)":
    "Vaso (litri)",
  "Prices are exclusive of VAT where applicable.":
    "I prezzi sono al netto dell'IVA dove applicabile.",
  "Prices, discounts and the landed-cost snapshot are copied exactly as quoted — nothing is re-entered and nothing is re-derived.":
    "Prezzi, sconti e l’istantanea del costo sdoganato vengono copiati esattamente come quotati: nulla viene reinserito e nulla ricalcolato.",
  "Print / save as PDF":
    "Stampa / salva in PDF",
  "Profit":
    "Utile",
  "Proforma invoice":
    "Fattura proforma",
  "Project":
    "Progetto",
  "Proof note":
    "Nota di prova",
  "Publish date":
    "Data di pubblicazione",
  "Published":
    "Pubblicato",
  "Published questions appear on the homepage and are published as structured data, so they can answer the question inside a search result rather than only on the page.":
    "Le domande pubblicate compaiono in homepage e vengono esposte come dati strutturati, così possono rispondere già dentro un risultato di ricerca e non solo sulla pagina.",
  "Purchase cost":
    "Costo di acquisto",
  "Put a quantity against at least one line.":
    "Indicate una quantità su almeno una riga.",
  "Put a quantity against the lines going on this run. Trees need the right gear and site access, so both are recorded before it is booked.":
    "Indicate una quantità sulle righe che vanno in questo viaggio. Gli alberi richiedono i mezzi giusti e l’accesso al cantiere, perciò entrambi si registrano prima della prenotazione.",
  "QT-000001":
    "QT-000001",
  "Qty":
    "Qtà",
  "Quantity":
    "Quantità",
  "Question":
    "Domanda",
  "Questions":
    "Domande",
  "Queued":
    "In coda",
  "Quotation":
    "Preventivo",
  "Quotation code *":
    "Codice preventivo *",
  "Quotations":
    "Preventivi",
  "Quotations and invoices state “exclusive of VAT where applicable” and charge nothing. When the TRN arrives, enter it and switch VAT on — documents already issued keep the position they were issued with, which is the point.":
    "Preventivi e fatture riportano “IVA esclusa ove applicabile” e non addebitano nulla. Quando arriva la partita IVA, inseritela e attivate l’IVA: i documenti già emessi mantengono la posizione con cui sono stati emessi, ed è proprio questo il punto.",
  "Quoted":
    "Quotato",
  "Quoted to":
    "Intestato a",
  "Raise":
    "Emetti",
  "Raise an invoice":
    "Emetti una fattura",
  "Raised":
    "Segnalato",
  "Reason":
    "Motivo",
  "Received":
    "Ricevuta",
  "Received by":
    "Ricevuto da",
  "Received by *":
    "Ricevuto da *",
  "Received on":
    "Ricevuto il",
  "Recent failures":
    "Tentativi falliti recenti",
  "Recent sign-in attempts":
    "Accessi recenti",
  "Recently changed":
    "Modificati di recente",
  "Record":
    "Registra",
  "Record a measurement":
    "Registra una misurazione",
  "Record a payment":
    "Registra un pagamento",
  "Record a specimen":
    "Registra un esemplare",
  "Record specimen":
    "Registra esemplare",
  "Record the date this client agreed to be quoted before publishing. A testimonial without consent cannot go on the site.":
    "Registrate la data in cui questo cliente ha acconsentito a essere citato prima di pubblicare. Una testimonianza senza consenso non può andare sul sito.",
  "Record who received it — that is the proof of delivery.":
    "Registrate chi ha ricevuto — è quella la prova della consegna.",
  "Reference":
    "Riferimento",
  "Registered address":
    "Sede legale",
  "Remove":
    "Rimuovi",
  "Reopen":
    "Riapri",
  "Repeated failed attempts temporarily lock the account.":
    "Tentativi falliti ripetuti bloccano temporaneamente l’account.",
  "Reports":
    "Report",
  "Requeue the last 7 days of blocked":
    "Rimetti in coda gli ultimi 7 giorni bloccati",
  "Required by":
    "Richiesto entro",
  "Required on site by":
    "In cantiere entro",
  "Reserved":
    "Riservato",
  "Restore":
    "Ripristina",
  "Result":
    "Esito",
  "Retention":
    "Ritenuta",
  "Retention %":
    "Ritenuta %",
  "Revenue":
    "Ricavi",
  "Revise — create v":
    "Revisiona — crea v",
  "Role":
    "Ruolo",
  "Rows":
    "Righe",
  "Rows in it":
    "Righe contenute",
  "Rules":
    "Regole",
  "Run":
    "Esegui",
  "Run checks now":
    "Esegui i controlli adesso",
  "Sales":
    "Commerciale",
  "Save":
    "Salva",
  "Save change":
    "Salva la modifica",
  "Save copy":
    "Salva i testi",
  "Save settings":
    "Salva le impostazioni",
  "Saved":
    "Salvato",
  "Saving publishes straight to the live site. Clearing a box restores the text the site ships with rather than leaving it empty. A page already being viewed may need one refresh to show the change — pages are cached and rebuilt behind the first request after a save.":
    "Il salvataggio pubblica direttamente sul sito. Svuotare un campo ripristina il testo predefinito invece di lasciarlo vuoto. Una pagina già aperta può richiedere un aggiornamento per mostrare la modifica: le pagine sono in cache e vengono ricostruite dietro la prima richiesta dopo il salvataggio.",
  "Schedule":
    "Pianifica",
  "Schedule a delivery":
    "Pianifica una consegna",
  "Scheduled":
    "Pianificata",
  "Search":
    "Cerca",
  "Search description — optional":
    "Descrizione per la ricerca — facoltativa",
  "Search engine":
    "Motori di ricerca",
  "Search name, company, email, reference":
    "Cerca nome, azienda, e-mail, riferimento",
  "Search title — optional":
    "Titolo per la ricerca — facoltativo",
  "Select…":
    "Seleziona…",
  "Sellable":
    "Vendibile",
  "Sellable from":
    "Vendibile da",
  "Sellable now":
    "Vendibile ora",
  "Send a test to…":
    "Invia una prova a…",
  "Send every alert to…":
    "Invia ogni avviso a…",
  "Send what is waiting":
    "Invia quanto è in attesa",
  "Set SMTP_URL (a mailbox on the company domain) or RESEND_API_KEY, plus MAIL_FROM, and these rows go out on the next tick. They wait with the reason attached rather than being dropped, and rather than this system claiming to have sent an email it never could.":
    "Impostate SMTP_URL (una casella sul dominio aziendale) oppure RESEND_API_KEY, più MAIL_FROM, e queste righe partiranno al ciclo successivo. Restano in attesa con il motivo allegato anziché essere scartate, e anziché far dire a questo sistema di aver inviato un'e-mail che non avrebbe mai potuto inviare.",
  "Set a new password for this account":
    "Imposta una nuova password per questo utente",
  "Set password":
    "Imposta password",
  "Setting":
    "Impostazione",
  "Setting a password here signs that account out of every device, on purpose: this is the path used when a password may be known to somebody else, and a cookie that kept working for another fortnight would make the reset decorative.":
    "Impostare qui una password disconnette quell’utente da ogni dispositivo, e volutamente: è la via che si usa quando una password potrebbe essere nota ad altri, e un cookie che continuasse a funzionare per altre due settimane renderebbe il reset decorativo.",
  "Settings":
    "Impostazioni",
  "Severity":
    "Gravità",
  "Sharing image — a catalogue reference":
    "Immagine di condivisione — un riferimento a catalogo",
  "Shipment":
    "Spedizione",
  "Shipments":
    "Spedizioni",
  "Show deleted":
    "Mostra gli eliminati",
  "Sign in":
    "Accedi",
  "Sign out":
    "Esci",
  "Sign out everywhere":
    "Esci da tutti i dispositivi",
  "Sign out everywhere else":
    "Esci dagli altri dispositivi",
  "Signed in":
    "Accesso effettuato",
  "Signed in as":
    "Accesso come",
  "Site address":
    "Indirizzo del cantiere",
  "Site contact":
    "Referente in cantiere",
  "Site copy":
    "Testi del sito",
  "Size":
    "Dimensione",
  "Social":
    "Social",
  "Sold":
    "Venduto",
  "Source":
    "Provenienza",
  "Specimen":
    "Esemplare",
  "Specimen code (for specimen lines)":
    "Codice esemplare (per righe esemplare)",
  "Specimens":
    "Esemplari",
  "Specimens are tracked one by one; lots are tracked by quantity. Sellable excludes anything still acclimatising, in poor health, or sitting somewhere it cannot be sold from.":
    "Gli esemplari si tracciano uno per uno; i lotti a quantità. “Vendibile” esclude tutto ciò che è ancora in acclimatazione, in cattivo stato di salute, o si trova dove non può essere venduto.",
  "Specimens tracked":
    "Esemplari tracciati",
  "Spread by":
    "Ripartito per",
  "Start a new one instead":
    "Inizia invece da una nuova",
  "Start the standard checklist":
    "Avvia la lista standard",
  "Started":
    "Iniziato",
  "State":
    "Stato",
  "Status":
    "Stato",
  "Stock":
    "Giacenze",
  "Stock that is not moving":
    "Giacenza ferma",
  "Stored as":
    "Memorizzato come",
  "Stored size":
    "Dimensione salvata",
  "Subject":
    "Oggetto",
  "Subtotal":
    "Imponibile",
  "Summary — shown in the list and to search engines":
    "Sommario — mostrato in elenco e ai motori di ricerca",
  "Supplier":
    "Fornitore",
  "System":
    "Sistema",
  "TOTAL":
    "TOTALE",
  "TRN":
    "Partita IVA (TRN)",
  "Tables":
    "Tabelle",
  "Tax invoice":
    "Fattura fiscale",
  "Test":
    "Prova",
  "Testimonials":
    "Testimonianze",
  "That code does not match anything in the system. It may have been cancelled, renumbered, or mistyped.":
    "Questo codice non corrisponde a nulla nel sistema. Potrebbe essere stato annullato, rinumerato o digitato male.",
  "That is not an email address.":
    "Questo non è un indirizzo e-mail.",
  "That record does not exist, or is already deleted.":
    "Quel record non esiste, o è già stato eliminato.",
  "That specimen does not exist.":
    "Quell'esemplare non esiste.",
  "The backup holds data only, not schema, so there is one source of truth for the shape of the database and it is the migrations.":
    "Il backup contiene solo i dati, non lo schema: così esiste una sola fonte di verità sulla forma del database, e sono le migrazioni.",
  "The current password is asked for even though you are already signed in: an unattended screen is the ordinary case, and this is the one action that can lock you out of your own system. Changing it signs out every other device signed in as you, and leaves this one alone.":
    "La password attuale viene chiesta anche se avete già effettuato l’accesso: uno schermo lasciato incustodito è il caso ordinario, e questa è l’unica azione che può chiudervi fuori dal vostro sistema. Cambiandola si disconnette ogni altro dispositivo collegato come voi, lasciando attivo questo.",
  "The database lives on Neon&rsquo;s free plan, which keeps six hours of point-in-time history and will not schedule its own snapshots. Six hours is not a backup policy — it is the window in which somebody has to notice. This takes a full copy every night, stores it off Neon, reads it back to check it arrived intact, and keeps a month of them.":
    "Il database è sul piano gratuito di Neon, che conserva sei ore di storico point-in-time e non pianifica snapshot propri. Sei ore non sono una politica di backup: sono la finestra entro cui qualcuno deve accorgersene. Questo prende ogni notte una copia completa, la archivia fuori da Neon, la rilegge per verificare che sia arrivata integra, e ne conserva un mese.",
  "The number cannot be negative.":
    "Il numero non può essere negativo.",
  "The number is a count of days, hours or units — it has to be whole.":
    "Il numero conta giorni, ore o unità — deve essere intero.",
  "The part of the system that speaks first. Everything else waits to be asked — an invoice falls overdue in silence, a permit lapses while a container is at sea. These are the conditions worth being interrupted for.":
    "La parte del sistema che parla per prima. Tutto il resto aspetta di essere interrogato: una fattura scade in silenzio, un permesso decade mentre un container è in mare. Queste sono le condizioni per cui vale la pena essere interrotti.",
  "The words on the public site, and what a search engine is told about each page. Everything here has a compiled default — clear a box and the original text comes back, so nothing typed here can leave a page blank.":
    "Le parole del sito pubblico e ciò che viene detto ai motori di ricerca su ogni pagina. Tutto qui ha un valore predefinito nel codice: svuotate un campo e torna il testo originale, così nulla di digitato qui può lasciare una pagina vuota.",
  "There is one active owner.":
    "C’è un solo titolare attivo.",
  "These are the values the website and every document read at runtime. Changing them here takes effect immediately — no deploy, no developer.":
    "Sono i valori che il sito e ogni documento leggono in esecuzione. Modificarli qui ha effetto immediato: nessun rilascio, nessuno sviluppatore.",
  "These override what each page already generates. Leave a box empty and the built-in title or description is used — which for the 68 catalogue pages is already written from the specimen itself, so emptying a box is safe and blanking one is not possible.":
    "Questi sostituiscono quanto ogni pagina già genera. Lasciate un campo vuoto e viene usato il titolo o la descrizione predefiniti — che per le 68 pagine di catalogo sono già scritti a partire dall’esemplare stesso, perciò svuotare un campo è sicuro e azzerarlo non è possibile.",
  "This is hidden, not gone. Restore it, or remove it from the database for good.":
    "È nascosto, non eliminato. Ripristinatelo, oppure rimuovetelo definitivamente dal database.",
  "This is what the audit log records beside everything you change.":
    "È quanto il registro di controllo annota accanto a ogni tua modifica.",
  "This moves the stock, adds to the delivered quantities and re-derives the order status. Delivering more than remains is refused outright.":
    "Questo movimenta la giacenza, incrementa le quantità consegnate e ricalcola lo stato dell’ordine. Consegnare più di quanto resta viene rifiutato senza eccezioni.",
  "This version has been issued, so its lines are locked. Use":
    "Questa versione è stata emessa, quindi le sue righe sono bloccate. Usate",
  "This version has been issued, so its lines are locked. Use “Revise” to create v{next} — the customer is holding this document.":
    "Questa versione è stata emessa, quindi le sue righe sono bloccate. Usate «Revisiona» per creare la v{next} — il cliente ha in mano questo documento.",
  "This version has been issued. Create a new version to change it.":
    "Questa versione è stata emessa. Createne una nuova per modificarla.",
  "Title":
    "Titolo",
  "Title — aim for 50–60 characters":
    "Titolo — punta a 50–60 caratteri",
  "To":
    "A",
  "Topic":
    "Argomento",
  "Total":
    "Totale",
  "Total (AED)":
    "Totale (AED)",
  "Total landed":
    "Totale sdoganato",
  "Total leads":
    "Richieste totali",
  "Totals":
    "Totali",
  "Trade licence":
    "Licenza commerciale",
  "Trading — Operations":
    "Trading — Operativo",
  "Trunk girth (cm)":
    "Circonferenza tronco (cm)",
  "Try the list it should be in:":
    "Provate l'elenco in cui dovrebbe trovarsi:",
  "Type":
    "Tipo",
  "Undo":
    "Annulla",
  "Unit":
    "Unità",
  "Unit (AED)":
    "Unitario (AED)",
  "Unit cost":
    "Costo unitario",
  "Unit price (AED)":
    "Prezzo unitario (AED)",
  "Units":
    "Unità",
  "Unknown health.":
    "Stato di salute sconosciuto.",
  "Unknown kind of record.":
    "Tipo di record sconosciuto.",
  "Unknown language.":
    "Lingua sconosciuta.",
  "Unknown severity.":
    "Gravità sconosciuta.",
  "Unknown status.":
    "Stato sconosciuto.",
  "Update":
    "Aggiorna",
  "Update status":
    "Aggiorna stato",
  "Updated":
    "Aggiornato",
  "Urgent":
    "Urgente",
  "VAT":
    "IVA",
  "VAT is off and no TRN is set, so invoices carry no VAT line and are marked not applicable for e-invoicing. UAE e-invoicing is Peppol PINT AE — structured XML through an accredited provider, not a PDF — and the identifiers it needs are already on each invoice, so switching it on is a mapping rather than a migration.":
    "L’IVA è disattivata e non è impostata alcuna partita IVA, quindi le fatture non riportano riga IVA e sono marcate come non applicabili alla fatturazione elettronica. Negli Emirati la fatturazione elettronica è Peppol PINT AE — XML strutturato tramite un fornitore accreditato, non un PDF — e gli identificativi richiesti sono già su ogni fattura, perciò attivarla è una mappatura e non una migrazione.",
  "VAT is off, so quotations carry no VAT line and state “exclusive of VAT where applicable”. Switch it on in settings once a TRN is issued.":
    "L’IVA è disattivata, quindi i preventivi non riportano riga IVA e indicano “IVA esclusa ove applicabile”. Attivatela nelle impostazioni una volta ottenuta la partita IVA.",
  "VAT is off.":
    "IVA disattivata.",
  "VG-XXXXXXX":
    "VG-XXXXXXX",
  "Valid until":
    "Valido fino al",
  "Value won":
    "Valore acquisito",
  "Vehicle":
    "Veicolo",
  "Verde Garden":
    "Verde Garden",
  "Version":
    "Versione",
  "View the site →":
    "Vedi il sito →",
  "View this language →":
    "Vedi questa lingua →",
  "Viewer":
    "Sola lettura",
  "Viewers cannot add stock.":
    "I visualizzatori non possono aggiungere giacenze.",
  "Viewers cannot change alerts.":
    "I visualizzatori non possono modificare gli avvisi.",
  "Viewers cannot change leads.":
    "I visualizzatori non possono modificare i contatti.",
  "Viewers cannot change quotations.":
    "I visualizzatori non possono modificare i preventivi.",
  "Viewers cannot change shipments.":
    "I visualizzatori non possono modificare le spedizioni.",
  "Viewers cannot change stock.":
    "I visualizzatori non possono modificare le giacenze.",
  "Viewers cannot complete deliveries.":
    "I visualizzatori non possono completare le consegne.",
  "Viewers cannot create orders.":
    "I visualizzatori non possono creare ordini.",
  "Viewers cannot create quotations.":
    "I visualizzatori non possono creare preventivi.",
  "Viewers cannot create shipments.":
    "I visualizzatori non possono creare spedizioni.",
  "Viewers cannot delete anything.":
    "I visualizzatori non possono eliminare nulla.",
  "Viewers cannot edit content.":
    "I visualizzatori non possono modificare i contenuti.",
  "Viewers cannot raise invoices.":
    "I visualizzatori non possono emettere fatture.",
  "Viewers cannot record measurements.":
    "I visualizzatori non possono registrare misurazioni.",
  "Viewers cannot record payments.":
    "I visualizzatori non possono registrare pagamenti.",
  "Viewers cannot revise quotations.":
    "I visualizzatori non possono revisionare i preventivi.",
  "Viewers cannot schedule deliveries.":
    "I visualizzatori non possono programmare consegne.",
  "Volume each (m³)":
    "Volume cad. (m³)",
  "Warning":
    "Attenzione",
  "Weight each (kg)":
    "Peso cad. (kg)",
  "What":
    "Cosa",
  "What is on the way":
    "Cosa è in arrivo",
  "What the roles mean":
    "Cosa significano i ruoli",
  "What they said":
    "Cosa hanno detto",
  "What was said, what was agreed, what is next.":
    "Cosa è stato detto, cosa concordato, cosa viene dopo.",
  "WhatsApp":
    "WhatsApp",
  "When":
    "Quando",
  "Where":
    "Dove",
  "Where the money is":
    "Dov’è il denaro",
  "Where they are":
    "A che punto sono",
  "Where you are signed in":
    "Dove hai effettuato l’accesso",
  "Which channel generates revenue":
    "Quale canale genera ricavi",
  "Which trees make money":
    "Quali alberi rendono",
  "Who":
    "Chi",
  "Who buys, and who comes back":
    "Chi compra, e chi torna",
  "Who can sign in, and what they may do. The roles have been in the database since the beginning and every page respects them — this is the screen that lets you use them without a developer.":
    "Chi può accedere e cosa può fare. I ruoli sono nel database fin dall’inizio e ogni pagina li rispetta: questa è la schermata che vi permette di usarli senza uno sviluppatore.",
  "Who converts":
    "Chi converte",
  "Why this cannot be removed yet":
    "Perché non può ancora essere rimosso",
  "Win rate — none decided yet":
    "Tasso di conversione — nessuna ancora decisa",
  "Won":
    "Acquisita",
  "Wording — leave empty for the built-in text.":
    "Testo — lascia vuoto per quello predefinito.",
  "Work this lead":
    "Lavora questa richiesta",
  "You can see these, but only the owner can change them.":
    "Puoi consultarle, ma solo il titolare può modificarle.",
  "You can see this, but only an owner can change it.":
    "Puoi consultarlo, ma solo un titolare può modificarlo.",
  "You can see this, but you cannot change it.":
    "Puoi consultare questa sezione, ma non modificarla.",
  "You have read-only access.":
    "Hai accesso in sola lettura.",
  "Your account":
    "Il tuo account",
  "Your name":
    "Il tuo nome",
  "Your reference":
    "Vostro riferimento",
  "Zero because no landed cost has been recorded against stock yet — cost a shipment and this fills in.":
    "Zero perché non è ancora stato registrato alcun costo sdoganato sulla giacenza: costificate una spedizione e questo si popola.",
  "advance — the agreed percentage up front":
    "acconto — la percentuale concordata in anticipo",
  "at least 10 characters":
    "almeno 10 caratteri",
  "been sitting":
    "ferma",
  "cannot sell from":
    "non si può vendere da",
  "edited":
    "modificato",
  "email of 12 March, site meeting…":
    "e-mail del 12 marzo, sopralluogo…",
  "gate width, overhead cables, community timing rules":
    "larghezza del cancello, cavi aerei, orari del comprensorio",
  "h ago":
    "h fa",
  "health is":
    "lo stato di salute è",
  "just now":
    "adesso",
  "lead has":
    "richiesta è",
  "leads have":
    "richieste sono",
  "locked at purchase":
    "bloccato all’acquisto",
  "min ago":
    "min fa",
  "moved":
    "spostato",
  "name of whoever signed for it":
    "nome di chi ha firmato",
  "nobody":
    "nessuno",
  "not sellable":
    "non vendibile",
  "olive-trees-gulf-summer":
    "olive-trees-gulf-summer",
  "product — from the catalogue":
    "prodotto — dal catalogo",
  "proforma":
    "proforma",
  "retention — released after the holding period":
    "ritenuta — svincolata dopo il periodo di garanzia",
  "sellable":
    "vendibile",
  "service — delivery, crane, planting":
    "servizio — consegna, gru, messa a dimora",
  "specimen {code}":
    "esemplare {code}",
  "specimen — one named tree":
    "esemplare — un albero identificato",
  "status is":
    "lo stato è",
  "still acclimatising until":
    "ancora in acclimatazione fino al",
  "system":
    "sistema",
  "tax invoice — the order":
    "fattura — l'ordine",
  "translated":
    "tradotto",
  "uncontacted for more than 24 hours.":
    "senza contatto da più di 24 ore.",
  "enquiry":
    "richiesta",
  "quotation":
    "preventivo",
  "order":
    "ordine",
  "invoice":
    "fattura",
  "payment":
    "pagamento",
  "delivery":
    "consegna",
  "shipment":
    "spedizione",
  "specimen":
    "esemplare",
  "customer":
    "cliente",
  "supplier":
    "fornitore",
  "shipment line":
    "riga di spedizione",
  "shipment cost":
    "costo di spedizione",
  "shipment document":
    "documento di spedizione",
  "quotation line":
    "riga di preventivo",
  "order line":
    "riga d’ordine",
  "purchase order":
    "ordine di acquisto",
  "Still linked to this {parent}: {n} × {child}. Remove those first.":
    "Ancora collegati a questo {parent}: {n} × {child}. Elimina prima quelli.",
  "That record no longer exists.":
    "Questo record non esiste più.",
  "Delete it first. Permanently removing a record that is still live is one click away from removing the wrong one.":
    "Eliminalo prima. Rimuovere definitivamente un record ancora attivo è a un clic dal rimuovere quello sbagliato.",
  "This invoice has payments against it. An invoice that has been paid is an accounting record the law requires to be kept — cancel it instead, which voids it without erasing it.":
    "Questa fattura ha pagamenti registrati. Una fattura pagata è una scrittura contabile che la legge impone di conservare: annullala invece, così resta agli atti ma priva di effetto.",
  "A received payment is an accounting record. Reverse it with a credit rather than deleting the evidence that money arrived.":
    "Un pagamento ricevuto è una scrittura contabile. Stornalo con una nota di credito invece di cancellare la prova che il denaro è arrivato.",
  "Import permit (MOCCAE)":
    "Permesso di importazione (MOCCAE)",
  "Phytosanitary certificate":
    "Certificato fitosanitario",
  "CITES certificate":
    "Certificato CITES",
  "Commercial invoice":
    "Fattura commerciale",
  "Packing list":
    "Distinta di imballaggio",
  "Bill of lading / airway bill":
    "Polizza di carico / lettera di vettura aerea",
  "Certificate of origin":
    "Certificato di origine",
  "Customs declaration":
    "Dichiarazione doganale",
  "Other":
    "Altro",
  "Remove {doc}":
    "Rimuovi {doc}",
  "Required":
    "Necessario",
  "Requested":
    "Richiesto",
  "Verified":
    "Verificato",
  "Not applicable":
    "Non applicabile",
  "Trade licence {n}":
    "Licenza commerciale {n}",
  "TRN {n}":
    "Partita IVA (TRN) {n}",
  "WhatsApp {n}":
    "WhatsApp {n}",
  "Import permit {n} expired on {date}. A consignment of live plants cannot clear on an expired permit — it will sit at the port accruing storage. Renew before arrival.":
    "Il permesso di importazione {n} è scaduto il {date}. Una partita di piante vive non può essere sdoganata con un permesso scaduto: resterà in porto accumulando costi di sosta. Rinnovalo prima dell’arrivo.",
  "{n} of {total} still outstanding":
    "{n} su {total} ancora mancanti",
  "{n} expired":
    "{n} scaduti",
  "{n} expiring within 30 days":
    "{n} in scadenza entro 30 giorni",
  "A container does not clear on the strength of the ones that are done.":
    "Un container non viene sdoganato grazie a quelli già pronti.",
  "Nothing needs attention. The checks ran {when} — if that says never, press “Run checks now”.":
    "Nulla richiede attenzione. I controlli sono stati eseguiti {when}: se dice mai, premi “Esegui i controlli ora”.",
  "never":
    "mai",
  "This run has been delivered: the stock has moved and the order counts it. Mark it failed or cancelled instead of erasing what happened.":
    "Questa consegna è stata effettuata: la merce si è mossa e l’ordine la conteggia. Segnala come fallita o annullata invece di cancellare quanto è accaduto.",
  "Something went wrong":
    "Qualcosa è andato storto",
  "This screen could not finish loading. Nothing you were doing has been lost — the records are unchanged. Try again, and if it keeps happening send the reference below.":
    "Questa schermata non è riuscita a caricarsi. Nulla di quanto stavi facendo è andato perduto: i record sono invariati. Riprova e, se continua, comunica il riferimento qui sotto.",
  "Try again":
    "Riprova",
  "Put {code} back? It will appear in the lists again.":
    "Ripristinare {code}? Tornerà negli elenchi.",
  "Credit note":
    "Nota di credito",
  "Account name":
    "Intestatario del conto",
  "Bank":
    "Banca",
  "Cancelled":
    "Annullata",
  "Payment":
    "Pagamento",
  "Please quote {code} on the transfer.":
    "Indicare {code} nella causale del bonifico.",
  "Bank: account name":
    "Banca: intestatario del conto",
  "Bank: name and branch":
    "Banca: nome e filiale",
  "Bank: IBAN":
    "Banca: IBAN",
  "Bank: SWIFT / BIC":
    "Banca: SWIFT / BIC",
  "Note printed under the bank details":
    "Nota stampata sotto le coordinate bancarie",
  "Legal name":
    "Ragione sociale",
  "Brand name":
    "Nome commerciale",
  "Tagline":
    "Slogan",
  "WhatsApp number (digits, with country code)":
    "Numero WhatsApp (cifre, con prefisso internazionale)",
  "WhatsApp, as displayed":
    "WhatsApp, come mostrato",
  "City / emirate":
    "Città / emirato",
  "Country":
    "Paese",
  "Instagram link":
    "Link Instagram",
  "LinkedIn link":
    "Link LinkedIn",
  "Facebook link":
    "Link Facebook",
  "YouTube link":
    "Link YouTube",
  "TikTok link":
    "Link TikTok",
  "Trade licence number":
    "Numero di licenza commerciale",
  "Founded (year, or yyyy-mm-dd)":
    "Fondata (anno, oppure aaaa-mm-gg)",
  "Founded in (city, country)":
    "Fondata a (città, paese)",
  "Italian company behind this one, if any":
    "Società italiana alle spalle di questa, se esiste",
  "Its website":
    "Il suo sito web",
  "Growing / trading in Italy since (year)":
    "Coltiva / opera in Italia dal (anno)",
  "TRN (tax registration number)":
    "Partita IVA / TRN (numero di registrazione fiscale)",
  "Charge VAT":
    "Applica l’IVA",
  "VAT rate (0.05 = 5%)":
    "Aliquota IVA (0,05 = 5%)",
  "Quotation validity (days)":
    "Validità del preventivo (giorni)",
  "Registered office":
    "Sede legale",
  "Commerce":
    "Commercio",
  "New enquiry":
    "Nuova richiesta",
  "Enquiry still unanswered":
    "Richiesta ancora senza risposta",
  "Follow-up due":
    "Follow-up in scadenza",
  "Quotation accepted":
    "Preventivo accettato",
  "Quotation about to expire":
    "Preventivo in scadenza",
  "Order confirmed":
    "Ordine confermato",
  "Delivery coming up":
    "Consegna imminente",
  "Shipment arriving":
    "Spedizione in arrivo",
  "Import permit expiring":
    "Permesso di importazione in scadenza",
  "Invoice falling due":
    "Fattura in scadenza",
  "Invoice overdue":
    "Fattura scaduta",
  "Payment received":
    "Pagamento ricevuto",
  "Stock running low":
    "Scorte in esaurimento",
  "Stock not moving":
    "Scorte ferme",
  "Tree in poor health":
    "Albero in cattiva salute",
  "No recent backup":
    "Nessun backup recente",
  "Customer over credit limit":
    "Cliente oltre il limite di credito",
  "The first hour decides the sale. An enquiry that waits until someone opens the list has usually already been answered by a competitor.":
    "La prima ora decide la vendita. Una richiesta che aspetta finché qualcuno apre l’elenco ha di solito già ricevuto risposta da un concorrente.",
  "Catches what the arrival alert missed — an enquiry nobody has touched after the given number of hours.":
    "Intercetta ciò che l’avviso di arrivo ha mancato: una richiesta che nessuno ha toccato dopo il numero di ore indicato.",
  "A promised call that never happens costs the deal and the reputation. Fires for follow-ups due within the given number of days.":
    "Una telefonata promessa e mai fatta costa la trattativa e la reputazione. Scatta per i follow-up in scadenza entro il numero di giorni indicato.",
  "Acceptance starts a clock: stock is reserved, the order has to be raised and the customer expects confirmation the same day.":
    "L’accettazione fa partire un orologio: la merce viene riservata, l’ordine va emesso e il cliente si aspetta conferma lo stesso giorno.",
  "A quotation nearing its validity date is the cheapest sale left in the pipeline — one call, on a price already agreed.":
    "Un preventivo vicino alla scadenza è la vendita più economica rimasta in pipeline: una telefonata, su un prezzo già concordato.",
  "Confirmation is where fulfilment, invoicing and delivery planning all begin.":
    "Dalla conferma partono evasione, fatturazione e pianificazione della consegna.",
  "A delivery needs a crane, a permit and a driver arranged the day before, not the morning of. Fires for deliveries scheduled within the given number of days.":
    "Una consegna richiede gru, permesso e autista organizzati il giorno prima, non la mattina stessa. Scatta per le consegne previste entro il numero di giorni indicato.",
  "Live trees do not wait at a port. Clearance, transport and yard space have to be ready before the container lands, not after demurrage starts.":
    "Gli alberi vivi non aspettano in porto. Sdoganamento, trasporto e spazio in vivaio devono essere pronti prima che il container arrivi, non dopo l’inizio della controstallia.",
  "A MOCCAE permit is valid six months. If it lapses while a container is at sea, the shipment cannot clear — and a container of live trees sitting at the port is the most expensive failure in this business.":
    "Un permesso MOCCAE vale sei mesi. Se scade mentre un container è in mare, la spedizione non può essere sdoganata: e un container di alberi vivi fermo in porto è il guasto più costoso di questo mestiere.",
  "A reminder before the due date collects far more than a chase after it, and costs nothing in goodwill.":
    "Un promemoria prima della scadenza incassa molto più di un sollecito dopo, e non costa nulla in rapporti.",
  "Contractors here pay late as a matter of course. The alert re-raises as the debt crosses 30, 60 and 90 days, because each band is a different conversation.":
    "Qui gli appaltatori pagano tardi per abitudine. L’avviso si ripresenta quando il debito supera 30, 60 e 90 giorni, perché ogni fascia è una conversazione diversa.",
  "Cash landing is the only event that closes the loop, and the one the owner most wants to see.":
    "L’incasso è l’unico evento che chiude il cerchio, ed è quello che il titolare vuole vedere di più.",
  "Replacement stock comes from Italy with a lead time measured in weeks, so the reorder decision has to be made while there is still something to sell.":
    "Le scorte di rimpiazzo arrivano dall’Italia con tempi misurati in settimane, quindi il riordino va deciso finché c’è ancora qualcosa da vendere.",
  "Living stock costs water, labour and space every month it waits, and a tree that has not sold in months is usually mispriced rather than unlucky.":
    "Le piante vive costano acqua, manodopera e spazio ogni mese che aspettano, e un albero invenduto da mesi di solito ha il prezzo sbagliato, non la sfortuna.",
  "A stressed tree can be saved; a dead one is a written-off asset. This is the alert that pays for itself first.":
    "Un albero sofferente si può salvare; uno morto è un bene da svalutare. È l’avviso che si ripaga per primo.",
  "A backup system fails silently — nothing breaks when it stops, and the discovery happens on the one day it was needed. This is the alert that makes the silence audible.":
    "Un sistema di backup si guasta in silenzio: quando si ferma non si rompe nulla, e ce se ne accorge l’unico giorno in cui serviva. È l’avviso che rende udibile quel silenzio.",
  "The limit exists to stop one contractor quietly becoming the whole receivables book. Crossing it should be a decision, not a discovery.":
    "Il limite esiste perché un solo appaltatore non diventi in silenzio l’intero portafoglio crediti. Superarlo dev’essere una decisione, non una scoperta.",
  "Hours without contact":
    "Ore senza contatto",
  "Days ahead":
    "Giorni di anticipo",
  "Days before expiry":
    "Giorni prima della scadenza",
  "Days before ETA":
    "Giorni prima dell’ETA",
  "Days before due":
    "Giorni prima della scadenza di pagamento",
  "Days past due":
    "Giorni di ritardo",
  "Units remaining or fewer":
    "Unità rimaste o meno",
  "Days in stock":
    "Giorni in magazzino",
  "Hours since the last good backup":
    "Ore dall’ultimo backup riuscito",
  "on the event":
    "sull’evento",
  "on a schedule":
    "a intervalli",
  "{n} in total. A kind with no rule raises nothing — silence is a choice, not a fault.":
    "{n} in tutto. Un tipo senza regola non segnala nulla: il silenzio è una scelta, non un guasto.",
  "specimens":
    "esemplari",
  "emirates":
    "emirati",
  "languages":
    "lingue",
  "Italian roots for a greener tomorrow":
    "Radici italiane per un domani più verde",
  "Mature specimens lifted in Italy, cleared, acclimatised and planted across the Emirates.":
    "Esemplari maturi estratti in Italia, sdoganati, acclimatati e messi a dimora in tutti gli Emirati.",
  "Dubai":
    "Dubai",
  "Welcome back":
    "Bentornato",
  "Welcome back, {name}":
    "Bentornato, {name}",
  "Name greeted on the sign-in screen":
    "Nome salutato nella schermata di accesso",
  "unverified":
    "non verificato",
  "version {n}":
    "versione {n}",
  "why this changed":
    "perché è cambiato",
  "{emirate}, United Arab Emirates":
    "{emirate}, Emirati Arabi Uniti",
  "{min}–{max} weeks from order confirmation to site.":
    "{min}–{max} settimane dalla conferma dell'ordine alla consegna in cantiere.",
  "{n} of {total} rules send an email.":
    "{n} regole su {total} inviano un'e-mail.",
  "· AED":
    "· AED",
  "← All leads":
    "← Tutte le richieste",
  "← Inventory":
    "← Magazzino",
  "← Orders":
    "← Ordini",
  "← Quotations":
    "← Preventivi",
  "← Shipments":
    "← Spedizioni",
  "− AED":
    "− AED",
};

/** Arabic, for the staff in the Emirates who run the yard and the deliveries. */
const ar: Partial<Record<AdminKey, string>> = {
  "% of value":
    "% من القيمة",
  "% of volume":
    "% من الحجم",
  "(cannot sell from here)":
    "(لا يمكن البيع من هنا)",
  "/journal/":
    "/journal/",
  "1–30 days":
    "1–30 يومًا",
  "31–60 days":
    "31–60 يومًا",
  "61–90 days":
    "61–90 يومًا",
  "A line needs a description.":
    "كل بند يحتاج وصفًا.",
  "A long phrase you can remember beats a short puzzle you cannot. There are no rules here about symbols or capitals — they push people towards predictable passwords without making them harder to guess.":
    "عبارة طويلة تتذكّرها خير من لغز قصير تنساه. ولا توجد هنا قواعد عن الرموز أو الأحرف الكبيرة — فهي تدفع الناس إلى كلمات مرور متوقَّعة دون أن تجعل تخمينها أصعب.",
  "A path must start with a slash.":
    "يجب أن يبدأ المسار بشرطة مائلة.",
  "A question needs both a question and an answer.":
    "السؤال يحتاج نصّ السؤال والإجابة معًا.",
  "A quotation needs a customer.":
    "عرض السعر يحتاج عميلًا.",
  "A testimonial cannot be published without the date the client agreed to be quoted. Publishing praise nobody consented to is a legal and reputational risk, and an anonymous testimonial reads as an invented one. Record the real conversation.":
    "لا يمكن نشر شهادة عميل دون تاريخ موافقته على الاقتباس منه. ونشر ثناء لم يوافق عليه أحد مخاطرة قانونية وسمعية، والشهادة المجهولة تُقرأ كأنها مختلقة. سجّل المحادثة الحقيقية.",
  "A testimonial needs the words and the person who said them.":
    "الشهادة تحتاج نصّها ومن قالها.",
  "A tree grows. Each row is an observation on a date, not a fixed attribute.":
    "الشجرة تنمو. كل سطر هنا ملاحظة في تاريخ معيّن، لا صفة ثابتة.",
  "Accepted":
    "مقبول",
  "Accepted AED":
    "المقبول بالدرهم",
  "Accepting reserves every specimen and lot on the quotation, in one transaction. If a tree has gone since, the whole acceptance is refused.":
    "القبول يحجز كل صنف وكل دفعة في عرض السعر، في معاملة واحدة. وإن كانت شجرة قد بيعت في الأثناء، يُرفض القبول كاملًا.",
  "Access notes":
    "ملاحظات الوصول",
  "Acclimatising":
    "قيد التأقلم",
  "Accounts":
    "الحسابات",
  "Accounts are never deleted, because the audit log points at them — “who changed this price” has to stay answerable. Switch one off instead, which ends its sessions immediately.":
    "الحسابات لا تُحذف أبدًا، لأن سجل التدقيق يشير إليها — و«من غيّر هذا السعر» يجب أن يظل سؤالًا له جواب. أوقف الحساب بدلًا من ذلك، وهذا ينهي جلساته فورًا.",
  "Actions":
    "إجراءات",
  "Active":
    "مفعَّل",
  "Active rules":
    "القواعد المفعّلة",
  "Activity":
    "النشاط",
  "Add":
    "إضافة",
  "Add a cost":
    "أضف تكلفة",
  "Add a line":
    "أضف بندًا",
  "Add a note":
    "أضف ملاحظة",
  "Add an account":
    "أضف حسابًا",
  "Add cost":
    "أضف تكلفة",
  "Add line":
    "أضف بندًا",
  "Add lines first.":
    "أضف البنود أولًا.",
  "Address":
    "العنوان",
  "Address — leave empty and it is made from the title":
    "العنوان — اتركه فارغًا ويُشتق من العنوان",
  "Advance":
    "دفعة مقدّمة",
  "Advance %":
    "نسبة الدفعة المقدّمة %",
  "Ageing":
    "أعمار الديون",
  "Alerts":
    "التنبيهات",
  "All":
    "الكل",
  "All specimens →":
    "كل الأصناف →",
  "Allocated AED":
    "المخصَّص بالدرهم",
  "Also WhatsApp":
    "وأيضًا واتساب",
  "Also email":
    "وأيضًا بريد إلكتروني",
  "Amount":
    "المبلغ",
  "Amount (AED)":
    "المبلغ (درهم)",
  "Amount (AED) *":
    "المبلغ (درهم) *",
  "Amount must be a number.":
    "يجب أن يكون المبلغ رقمًا.",
  "An article needs a title and a body.":
    "المقال يحتاج عنوانًا ونصًّا.",
  "Another article already uses the address /journal/{slug}. Change the title or the address.":
    "يستخدم مقال آخر العنوان /journal/{slug} بالفعل. غيّر العنوان أو المسار.",
  "Answer":
    "الإجابة",
  "Anything addressed outside the console.":
    "كل ما يُوجَّه خارج لوحة التشغيل.",
  "Apply to all":
    "طبّق على الكل",
  "Arrived":
    "وصلت",
  "Asking":
    "السعر المطلوب",
  "Asking price":
    "السعر المطلوب",
  "Asking price (AED)":
    "السعر المطلوب (درهم)",
  "Author":
    "الكاتب",
  "BL number":
    "رقم بوليصة الشحن",
  "Back to live":
    "العودة إلى النشطة",
  "Back up now":
    "خذ نسخة احتياطية الآن",
  "Backups":
    "النسخ الاحتياطية",
  "Balance due":
    "الرصيد المستحق",
  "Basis":
    "أساس التوزيع",
  "Billed to":
    "الفاتورة باسم",
  "Body":
    "النص",
  "Bucket":
    "الحاوية",
  "By emirate":
    "حسب الإمارة",
  "By enquiry":
    "حسب نوع الاستفسار",
  "Can sign in":
    "يمكنه الدخول",
  "Cancel":
    "إلغاء",
  "Cancel it instead":
    "ألغِها بدلًا من ذلك",
  "Carrier":
    "الناقل",
  "Cash in stock AED":
    "رأس مال في المخزون بالدرهم",
  "Cash tied up in stock":
    "رأس مال محتجز في المخزون",
  "Catalogue":
    "الكتالوج",
  "Catalogue name":
    "الاسم في الكتالوج",
  "Catalogue reference":
    "المرجع في الكتالوج",
  "Catalogue reference (for product lines)":
    "المرجع في الكتالوج (لبنود المنتجات)",
  "Catalogue reference *":
    "المرجع في الكتالوج *",
  "Change password":
    "غيّر كلمة المرور",
  "Change your password":
    "غيّر كلمة مرورك",
  "Changed":
    "تغيّر",
  "Channel":
    "القناة",
  "Close":
    "إغلاق",
  "Close the menu":
    "أغلق القائمة",
  "Closed":
    "مغلقة",
  "Code":
    "الرمز",
  "Commercial":
    "تجاري",
  "Company":
    "الشركة",
  "Company details":
    "بيانات الشركة",
  "Complete":
    "مكتملة",
  "Compliance":
    "الامتثال",
  "Confirm a delivery":
    "أكّد تسليمًا",
  "Confirmed":
    "مؤكَّدة",
  "Consent given on":
    "تاريخ الموافقة",
  "Consignments from Italy, their compliance paperwork, and what each one actually costs once it lands.":
    "الشحنات القادمة من إيطاليا، ومستندات امتثالها، وما تكلّفه كل واحدة فعليًا بعد وصولها.",
  "Console":
    "لوحة التشغيل",
  "Contact":
    "جهة الاتصال",
  "Contact channels":
    "قنوات التواصل",
  "Container":
    "الحاوية",
  "Container no.":
    "رقم الحاوية",
  "Content":
    "المحتوى",
  "Contractors here pay late, so what is owed and how late it is sits on the front page rather than in a spreadsheet.":
    "المقاولون هنا يدفعون متأخرين، فما هو مستحق وكم تأخّر يوضع في الصفحة الأولى لا في جدول بيانات.",
  "Conversion":
    "التحويل",
  "Convert an accepted quotation":
    "حوّل عرض سعر مقبولًا",
  "Cover photograph":
    "صورة الغلاف",
  "Create account":
    "أنشئ حسابًا",
  "Create an empty database.":
    "أنشئ قاعدة بيانات فارغة.",
  "Create order":
    "أنشئ طلبًا",
  "Create quotation":
    "أنشئ عرض سعر",
  "Create shipment":
    "أنشئ شحنة",
  "Created":
    "أُنشئ",
  "Crown":
    "التاج",
  "Crown width (m)":
    "عرض التاج (م)",
  "Currency":
    "العملة",
  "Current password":
    "كلمة المرور الحالية",
  "Customer":
    "العميل",
  "Customer LPO number":
    "رقم أمر الشراء",
  "Customer name":
    "اسم العميل",
  "Date":
    "التاريخ",
  "Days held":
    "أيام في المخزون",
  "Days over":
    "أيام التأخير",
  "Dead / written off":
    "نافقة / مشطوبة",
  "Dealt with":
    "عولج",
  "Dealt-with alerts are kept, not deleted. “Was anyone warned before that container sat at the port for a week” has to stay answerable.":
    "التنبيهات المعالَجة تُحفظ ولا تُحذف. و«هل نُبِّه أحد قبل أن تبقى تلك الحاوية في الميناء أسبوعًا» يجب أن يظل سؤالًا له جواب.",
  "Default":
    "الافتراضي",
  "Delete":
    "حذف",
  "Delete for good":
    "حذف نهائي",
  "Delete {code}? It will be hidden from the lists, and you can put it back.":
    "هل تريد حذف {code}؟ سيُخفى من القوائم ويمكنك إرجاعه.",
  "Permanently remove {code} from the database? This cannot be undone by anybody, including you.":
    "هل تريد إزالة {code} نهائيًا من قاعدة البيانات؟ لا يمكن لأحد التراجع عن ذلك، بمن فيهم أنت.",
  "Deleted":
    "المحذوفة",
  "Deleted {when} by {who}":
    "حُذف في {when} بواسطة {who}",
  "Deliver to":
    "التسليم إلى",
  "Delivered":
    "تم التسليم",
  "Delivered by value":
    "المسلَّم بالقيمة",
  "Delivered to":
    "التسليم إلى",
  "Deliveries":
    "التسليمات",
  "Delivery":
    "التسليم",
  "Delivery terms":
    "شروط التسليم",
  "Description":
    "الوصف",
  "Description — aim for 140–160 characters":
    "الوصف — استهدف 140–160 حرفًا",
  "Destination port":
    "ميناء الوصول",
  "Device":
    "الجهاز",
  "Disc.":
    "خصم",
  "Discount":
    "الخصم",
  "Discount %":
    "نسبة الخصم %",
  "Document type":
    "نوع المستند",
  "Download the archive from the bucket and load it with the":
    "نزّل الأرشيف من المستودع وحمّله بأمر",
  "Draft":
    "مسودّة",
  "Driver":
    "السائق",
  "Due":
    "الاستحقاق",
  "Each cost is spread by its own basis — freight by volume, duty by value, handling per piece. Spreading freight by value would load it onto the expensive tree instead of the bulky one and invert the margins.":
    "كل تكلفة تُوزَّع وفق أساسها: الشحن بالحجم، والرسوم بالقيمة، والمناولة بالقطعة. وتوزيع الشحن بالقيمة يحمّله على الشجرة الغالية بدل الضخمة، فيقلب الهوامش رأسًا على عقب.",
  "Each rule is a row, so the numbers are yours to change: warn five days before an invoice falls due instead of three, or drop the low stock floor to two. What stays in code is the query behind each kind — a new kind of warning genuinely is development, and a screen pretending otherwise would be misleading.":
    "كل قاعدة صفّ، فالأرقام لك تغيّرها: نبّه قبل خمسة أيام من استحقاق الفاتورة بدل ثلاثة، أو اخفض حدّ المخزون المنخفض إلى اثنين. ويبقى في الكود الاستعلام وراء كل نوع — فنوع تنبيه جديد هو تطوير فعلًا، وشاشة تدّعي غير ذلك ستكون مضلِّلة.",
  "Edit":
    "تعديل",
  "Either give a lead reference and the details are carried across, or fill them in.":
    "إمّا أن تعطي مرجع استفسار فتُنقل البيانات تلقائيًا، أو تملأها بنفسك.",
  "Email":
    "البريد الإلكتروني",
  "Emirate":
    "الإمارة",
  "English":
    "الإنجليزية",
  "Enquiries, last 30 days":
    "الاستفسارات، آخر 30 يومًا",
  "Enquiry":
    "الاستفسار",
  "Enter an amount.":
    "أدخل مبلغًا.",
  "Enter an email address to send the test to.":
    "أدخل بريدًا إلكترونيًّا لإرسال الاختبار إليه.",
  "Enter the TRN before switching VAT on — VAT cannot be charged without a registration number.":
    "أدخل رقم التسجيل الضريبي قبل تفعيل ضريبة القيمة المضافة — فلا يجوز احتسابها دون رقم تسجيل.",
  "Equipment":
    "المعدّات",
  "Every document on this checklist is in and verified.":
    "كل مستند في هذه القائمة موجود ومُتحقَّق منه.",
  "Every lead sits at one stage. The percentage is how many of the previous stage reached this one.":
    "كل استفسار في مرحلة واحدة. والنسبة تُظهر كم وصل إلى هذه المرحلة من المرحلة التي قبلها.",
  "Everyone":
    "الجميع",
  "Expires":
    "تنتهي في",
  "FX at purchase":
    "سعر الصرف عند الشراء",
  "FX rate to AED":
    "سعر الصرف إلى الدرهم",
  "FX to AED":
    "الصرف للدرهم",
  "Failed attempts on your email, whoever made them. Six failures within fifteen minutes lock the address they came from. Thirty across different addresses lock the email — but never an address you have signed in from before, so somebody else guessing can no longer shut you out of your own console. When this rule counted your email alone, six wrong guesses from anywhere did exactly that.":
    "المحاولات الفاشلة على بريدك، أيًّا كان مَن قام بها. ستّ محاولات خلال خمس عشرة دقيقة تقفل العنوان الذي جاءت منه. وثلاثون من عناوين مختلفة تقفل البريد — لكن لا تُقفل أبدًا عنوانًا سبق أن دخلت منه، حتى لا يستطيع شخص يخمّن أن يغلق عليك لوحتك أنت. وحين كانت هذه القاعدة تعدّ بريدك وحده، كانت ستّ محاولات خاطئة من أي مكان تفعل ذلك تمامًا.",
  "Filter":
    "تصفية",
  "Finance":
    "المالية",
  "First":
    "الأول",
  "From":
    "من",
  "From lead reference":
    "من مرجع الاستفسار",
  "Fulfilment is tracked per line. An order for 200 trees arriving in three containers is normal, and the status follows the quantities rather than being set by hand.":
    "التنفيذ يُتابَع لكل بند. وطلب 200 شجرة يصل في ثلاث حاويات أمر طبيعي، والحالة تتبع الكميات بدل أن تُضبط يدويًا.",
  "Girth":
    "محيط الجذع",
  "Goods (AED)":
    "البضاعة (درهم)",
  "Goods AED":
    "البضاعة بالدرهم",
  "Grade":
    "الدرجة",
  "Gross profit":
    "الربح الإجمالي",
  "Health":
    "الحالة الصحية",
  "Height":
    "الارتفاع",
  "Height (m)":
    "الارتفاع (م)",
  "Hiab 8t, crane, low-loader":
    "رافعة هياب 8 طن، ونش، مقطورة منخفضة",
  "Hide deleted":
    "أخفِ المحذوفة",
  "History":
    "السجل",
  "How consent was given":
    "كيف أُعطيت الموافقة",
  "How they found us":
    "كيف وصلوا إلينا",
  "How to restore one":
    "كيف تستعيد نسخة",
  "INV-000001":
    "INV-000001",
  "Import costs":
    "تكاليف الاستيراد",
  "Import permit":
    "تصريح الاستيراد",
  "In lots":
    "ضمن دفعات",
  "Inbox":
    "الوارد",
  "Including dealt with":
    "بما فيها المعالَجة",
  "Incoterm":
    "شرط التسليم الدولي",
  "Individually tracked":
    "متتبَّع فرديًا",
  "Individually tracked specimens":
    "أصناف متتبَّعة فرديًا",
  "Info":
    "معلومة",
  "Inventory":
    "المخزون",
  "Inventory, quotations, shipments and the money behind them.":
    "المخزون وعروض الأسعار والشحنات والمال الذي وراءها.",
  "Invoice":
    "الفاتورة",
  "Invoice code *":
    "رمز الفاتورة *",
  "Invoices":
    "الفواتير",
  "Issued":
    "صدرت",
  "Issued quotations are never edited — repricing creates a new version and supersedes the old one, so what was actually quoted stays answerable.":
    "عروض الأسعار الصادرة لا تُعدَّل أبدًا — فإعادة التسعير تُنشئ نسخة جديدة تحلّ محل القديمة، ليبقى ما عُرض فعلًا قابلًا للمساءلة.",
  "It cannot be switched off or demoted while it is the only one — that would leave nobody able to administer the system, and nobody inside the company could undo it. Make a second owner first if you want that freedom.":
    "لا يمكن إيقافه ولا خفض دوره ما دام الوحيد — إذ لن يبقى أحد قادر على إدارة النظام، ولن يستطيع أحد داخل الشركة التراجع. أنشئ مالكًا ثانيًا أولًا إن أردت تلك الحرية.",
  "Items":
    "البنود",
  "Journal":
    "المدوّنة",
  "Keep this page out of search results":
    "استبعد هذه الصفحة من نتائج البحث",
  "Kind":
    "النوع",
  "Kinds available":
    "الأنواع المتاحة",
  "Landed":
    "التكلفة النهائية",
  "Landed cost":
    "التكلفة حتى الوصول",
  "Landed cost of everything not yet sold — incoming, acclimatising, available and reserved. This is working capital sitting in a nursery, not profit.":
    "التكلفة النهائية لكل ما لم يُبَع بعد — قادم، وقيد التأقلم، ومتاح، ومحجوز. هذا رأس مال عامل راكد في مشتل، لا ربح.",
  "Landed cost per line":
    "التكلفة النهائية لكل بند",
  "Landed total":
    "الإجمالي النهائي",
  "Landed unit":
    "تكلفة الوحدة النهائية",
  "Language":
    "اللغة",
  "Last 7 days":
    "آخر 7 أيام",
  "Last check":
    "آخر فحص",
  "Last good backup":
    "آخر نسخة سليمة",
  "Latest":
    "الأحدث",
  "Latest enquiries":
    "أحدث الاستفسارات",
  "Lead → sale":
    "من استفسار إلى بيع",
  "Leads":
    "الاستفسارات",
  "Leads by enquiry type":
    "الاستفسارات حسب النوع",
  "Leads by source":
    "الاستفسارات حسب المصدر",
  "Line total":
    "إجمالي البند",
  "Lines":
    "البنود",
  "Live on the site":
    "منشور على الموقع",
  "Live quotations":
    "عروض أسعار سارية",
  "Living stock: dimensions are indicative and vary between individual specimens. Final size, form and availability are confirmed on despatch. This quotation is valid for {days} days from issue.":
    "بضاعة حيّة: الأبعاد استرشادية وتختلف من شجرة إلى أخرى. ويُؤكَّد الحجم والشكل والتوفّر النهائي عند الشحن. وهذا العرض صالح {days} يومًا من تاريخ إصداره.",
  "Location":
    "الموقع",
  "Lost":
    "خسرناها",
  "Lot units":
    "وحدات الدفعة",
  "Lots":
    "الدفعات",
  "Margin":
    "الهامش",
  "Margin (internal)":
    "الهامش (داخلي)",
  "Mark delivered":
    "علّمها مسلَّمة",
  "Measured":
    "مقيس",
  "Measurements":
    "القياسات",
  "Menu":
    "القائمة",
  "Message":
    "الرسالة",
  "Method":
    "الطريقة",
  "Money":
    "المالية",
  "Movement history":
    "سجلّ الحركات",
  "Name":
    "الاسم",
  "Net":
    "الصافي",
  "New password again":
    "أعد كلمة المرور الجديدة",
  "New password — at least 10 characters":
    "كلمة مرور جديدة — 10 أحرف على الأقل",
  "New quotation":
    "عرض سعر جديد",
  "New shipment":
    "شحنة جديدة",
  "Next follow-up":
    "المتابعة القادمة",
  "No articles yet.":
    "لا مقالات بعد.",
  "No backup has run yet.":
    "لم تُنفَّذ أي نسخة احتياطية بعد.",
  "No backup storage is configured, so nothing is being backed up. The service needs BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, BACKUP_SECRET_ACCESS_KEY and BACKUP_ENDPOINT.":
    "لا توجد مساحة تخزين للنسخ الاحتياطي، فلا شيء يُنسخ. تحتاج الخدمة إلى BACKUP_BUCKET وBACKUP_ACCESS_KEY_ID وBACKUP_SECRET_ACCESS_KEY وBACKUP_ENDPOINT.",
  "No document checklist on this shipment yet.":
    "لا توجد قائمة مستندات لهذه الشحنة بعد.",
  "No document named.":
    "لم يُذكر أي مستند.",
  "No invoice {code}.":
    "لا توجد فاتورة {code}.",
  "No invoices raised.":
    "لم تُصدر فواتير.",
  "No landed cost on these lines, so the margin shown is not real. Cost the shipment first.":
    "لا توجد تكلفة نهائية على هذه البنود، فالهامش المعروض غير حقيقي. احسب تكلفة الشحنة أولًا.",
  "No lines on this shipment yet.":
    "لا بنود في هذه الشحنة بعد.",
  "No lines yet.":
    "لا بنود بعد.",
  "No order {code}.":
    "لا يوجد طلب {code}.",
  "No orders yet.":
    "لا طلبات بعد.",
  "No quotations yet.":
    "لا عروض أسعار بعد.",
  "No rule has an address on it":
    "لا توجد قاعدة عليها عنوان",
  "No rule has an address on it.":
    "لا توجد قاعدة عليها عنوان.",
  "No rules yet. Press":
    "لا قواعد بعد. اضغط",
  "No rules yet. Press “Run checks now” to install the defaults.":
    "لا قواعد بعد. اضغط «شغّل الفحوص الآن» لتثبيت القواعد الافتراضية.",
  "No shipments recorded yet.":
    "لم تُسجَّل شحنات بعد.",
  "No specimens match.":
    "لا أصناف مطابقة.",
  "No such record":
    "لا يوجد سجلّ بهذا الاسم",
  "None":
    "لا شيء",
  "None recorded.":
    "لا شيء مسجّل.",
  "Not applicable — exclusive of VAT where applicable":
    "غير منطبقة — غير شاملة الضريبة حيثما تنطبق",
  "Not sellable because:":
    "غير قابلة للبيع لأن:",
  "Not set":
    "غير محدَّد",
  "Not stated":
    "غير محدَّد",
  "Not verified. This request did not come through Cloudflare, so the address is only what the caller claimed.":
    "غير مُتحقَّق منه. لم يمرّ هذا الطلب عبر Cloudflare، فالعنوان هو ما ادّعاه المُرسِل فقط.",
  "Note":
    "ملاحظة",
  "Notes":
    "ملاحظات",
  "Nothing here yet":
    "لا يوجد شيء هنا بعد",
  "Nothing is being sent":
    "لا يُرسل أي شيء",
  "Nothing is being sent, because no mail provider is configured.":
    "لا يُرسل أي شيء، لأنه لم تتم تهيئة أي مزوّد بريد.",
  "Nothing logged yet.":
    "لم يُسجَّل شيء بعد.",
  "Nothing matches.":
    "لا نتائج مطابقة.",
  "Nothing outstanding.":
    "لا شيء مستحق.",
  "Nothing overridden yet — the defaults are in use.":
    "لا تجاوزات بعد — القيم الافتراضية مستخدمة.",
  "Nothing queued. No rule has an email address or WhatsApp number on it.":
    "لا شيء في الطابور. لا توجد قاعدة عليها بريد إلكتروني أو رقم واتساب.",
  "Nothing recorded.":
    "لا شيء مسجَّل.",
  "Nothing scheduled.":
    "لا شيء مجدول.",
  "Nothing would be emailed even with a mail provider configured. An alert with no recipient is raised in the console and goes no further.":
    "لن يُرسل أي بريد حتى مع تهيئة مزوّد بريد. فالتنبيه بلا مستلِم يظهر في اللوحة ولا يتجاوزها.",
  "Nothing yet.":
    "لا شيء بعد.",
  "ORD-000001":
    "ORD-000001",
  "One query per question a manager actually asks. Figures come from the snapshots stored on each document — the price quoted, the landed cost at the time — so last quarter still reads as last quarter.":
    "استعلام واحد لكل سؤال يطرحه المدير فعلًا. والأرقام تأتي من اللقطات المحفوظة على كل مستند — السعر المعروض، والتكلفة النهائية وقتها — فيظل الربع الماضي يُقرأ كما كان.",
  "One tree, one row. Quantity is always one — that is the point of tracking it individually.":
    "شجرة واحدة، صفّ واحد. والكمية دائمًا واحد — وهذا هو معنى تتبّعها فرديًا.",
  "Only the owner can change alert rules.":
    "لا يمكن تغيير قواعد التنبيه إلا للمالك.",
  "Only the owner can change rules.":
    "لا يمكن تغيير القواعد إلا للمالك.",
  "Only the owner can change settings.":
    "لا يمكن تغيير الإعدادات إلا للمالك.",
  "Only the owner can permanently remove a record.":
    "لا يمكن إلا للمالك أن يزيل سجلًّا نهائيًّا.",
  "Only the owner can send a test.":
    "لا يمكن إرسال اختبار إلا للمالك.",
  "Only this role sees it":
    "يراه هذا الدور فقط",
  "Open":
    "مفتوحة",
  "Open leads":
    "استفسارات مفتوحة",
  "Open the menu":
    "افتح القائمة",
  "Open them →":
    "افتحها →",
  "Operations":
    "التشغيل",
  "Order":
    "الطلب",
  "Order code *":
    "رمز الطلب *",
  "Order total":
    "إجمالي الطلب",
  "Ordered":
    "مطلوب",
  "Orders":
    "الطلبات",
  "Origin port":
    "ميناء الشحن",
  "Outbound":
    "الصادر",
  "Outgoing":
    "الصادر",
  "Outstanding":
    "مستحق",
  "Over 90 days":
    "أكثر من 90 يومًا",
  "Overdue":
    "متأخّر",
  "Overview":
    "نظرة عامة",
  "Owner":
    "المالك",
  "Paid":
    "مدفوع",
  "Password":
    "كلمة المرور",
  "Password again":
    "أعد كلمة المرور",
  "Password — at least 10 characters":
    "كلمة المرور — 10 أحرف على الأقل",
  "Payment terms":
    "شروط الدفع",
  "Payment terms (days)":
    "شروط الدفع (أيام)",
  "Payments received":
    "الدفعات المستلمة",
  "Permanently removing a record cannot be undone by anybody, including you.":
    "الإزالة النهائية لسجلّ لا يستطيع أحد التراجع عنها، ولا أنت.",
  "Permit":
    "التصريح",
  "Phone":
    "الهاتف",
  "Pick a catalogue reference.":
    "اختر رقمًا مرجعيًّا من الكتالوج.",
  "Pieces":
    "القطع",
  "Pipeline":
    "مسار البيع",
  "Pipeline AED":
    "خط البيع بالدرهم",
  "Point":
    "وجّه",
  "Pot":
    "الأصيص",
  "Pot (litres)":
    "الأصيص (لتر)",
  "Prices are exclusive of VAT where applicable.":
    "الأسعار لا تشمل ضريبة القيمة المضافة حيث تنطبق.",
  "Prices, discounts and the landed-cost snapshot are copied exactly as quoted — nothing is re-entered and nothing is re-derived.":
    "الأسعار والخصومات ولقطة التكلفة النهائية تُنسخ كما عُرضت تمامًا — لا شيء يُدخَل من جديد ولا شيء يُعاد اشتقاقه.",
  "Print / save as PDF":
    "اطبع / احفظ PDF",
  "Profit":
    "الربح",
  "Proforma invoice":
    "فاتورة مبدئية",
  "Project":
    "المشروع",
  "Proof note":
    "ملاحظة إثبات",
  "Publish date":
    "تاريخ النشر",
  "Published":
    "منشور",
  "Published questions appear on the homepage and are published as structured data, so they can answer the question inside a search result rather than only on the page.":
    "الأسئلة المنشورة تظهر في الصفحة الرئيسية وتُنشر كبيانات منظَّمة، فتجيب عن السؤال داخل نتيجة البحث نفسها لا على الصفحة وحدها.",
  "Purchase cost":
    "تكلفة الشراء",
  "Put a quantity against at least one line.":
    "ضع كمية أمام بند واحد على الأقل.",
  "Put a quantity against the lines going on this run. Trees need the right gear and site access, so both are recorded before it is booked.":
    "حدّد كمية أمام البنود الذاهبة في هذه الرحلة. الأشجار تحتاج المعدّات الصحيحة وإمكانية الوصول للموقع، فيُسجَّل الأمران قبل الحجز.",
  "QT-000001":
    "QT-000001",
  "Qty":
    "الكمية",
  "Quantity":
    "الكمية",
  "Question":
    "السؤال",
  "Questions":
    "الأسئلة",
  "Queued":
    "في الطابور",
  "Quotation":
    "عرض السعر",
  "Quotation code *":
    "رمز عرض السعر *",
  "Quotations":
    "عروض الأسعار",
  "Quotations and invoices state “exclusive of VAT where applicable” and charge nothing. When the TRN arrives, enter it and switch VAT on — documents already issued keep the position they were issued with, which is the point.":
    "عروض الأسعار والفواتير تنصّ على «غير شاملة الضريبة حيثما تنطبق» ولا تحتسب شيئًا. وحين يصل الرقم الضريبي، أدخِله وفعّل الضريبة — والمستندات الصادرة سابقًا تحتفظ بالوضع الذي صدرت به، وهذا هو المقصود.",
  "Quoted":
    "مُسعَّر",
  "Quoted to":
    "مقدَّم إلى",
  "Raise":
    "أصدر",
  "Raise an invoice":
    "أصدر فاتورة",
  "Raised":
    "أُثير",
  "Reason":
    "السبب",
  "Received":
    "وردت",
  "Received by":
    "استلمها",
  "Received by *":
    "استلمها *",
  "Received on":
    "تاريخ الاستلام",
  "Recent failures":
    "محاولات فاشلة حديثة",
  "Recent sign-in attempts":
    "محاولات الدخول الأخيرة",
  "Recently changed":
    "عُدّلت مؤخرًا",
  "Record":
    "سجّل",
  "Record a measurement":
    "سجّل قياسًا",
  "Record a payment":
    "سجّل دفعة",
  "Record a specimen":
    "سجّل صنفًا",
  "Record specimen":
    "سجّل صنفًا",
  "Record the date this client agreed to be quoted before publishing. A testimonial without consent cannot go on the site.":
    "سجّل تاريخ موافقة هذا العميل على الاقتباس قبل النشر. فالشهادة بلا موافقة لا يمكن أن تُنشر على الموقع.",
  "Record who received it — that is the proof of delivery.":
    "سجّل من استلمها — فذلك هو إثبات التسليم.",
  "Reference":
    "المرجع",
  "Registered address":
    "العنوان المسجّل",
  "Remove":
    "إزالة",
  "Reopen":
    "أعد الفتح",
  "Repeated failed attempts temporarily lock the account.":
    "تكرار المحاولات الفاشلة يقفل الحساب مؤقتًا.",
  "Reports":
    "التقارير",
  "Requeue the last 7 days of blocked":
    "أعد إلى الطابور محجوزات آخر 7 أيام",
  "Required by":
    "مطلوب بحلول",
  "Required on site by":
    "مطلوب في الموقع بحلول",
  "Reserved":
    "محجوز",
  "Restore":
    "استعادة",
  "Result":
    "النتيجة",
  "Retention":
    "المحتجز",
  "Retention %":
    "نسبة المحتجز %",
  "Revenue":
    "الإيرادات",
  "Revise — create v":
    "راجع — أنشئ نسخة",
  "Role":
    "الدور",
  "Rows":
    "الصفوف",
  "Rows in it":
    "عدد صفوفها",
  "Rules":
    "القواعد",
  "Run":
    "شغّل",
  "Run checks now":
    "شغّل الفحص الآن",
  "Sales":
    "المبيعات",
  "Save":
    "حفظ",
  "Save change":
    "احفظ التغيير",
  "Save copy":
    "حفظ النصوص",
  "Save settings":
    "احفظ الإعدادات",
  "Saved":
    "تم الحفظ",
  "Saving publishes straight to the live site. Clearing a box restores the text the site ships with rather than leaving it empty. A page already being viewed may need one refresh to show the change — pages are cached and rebuilt behind the first request after a save.":
    "الحفظ يَنشر مباشرةً على الموقع الحيّ. وإفراغ الحقل يعيد النص الذي يأتي مع الموقع بدل أن يتركه فارغًا. وقد تحتاج صفحة مفتوحة بالفعل إلى تحديث واحد لتُظهر التغيير — فالصفحات مخزَّنة مؤقتًا وتُعاد بناؤها خلف أول طلب بعد الحفظ.",
  "Schedule":
    "جدولة",
  "Schedule a delivery":
    "جدوِل تسليمًا",
  "Scheduled":
    "مجدولة",
  "Search":
    "بحث",
  "Search description — optional":
    "وصف البحث — اختياري",
  "Search engine":
    "محركات البحث",
  "Search name, company, email, reference":
    "ابحث بالاسم أو الشركة أو البريد أو المرجع",
  "Search title — optional":
    "عنوان البحث — اختياري",
  "Select…":
    "اختر…",
  "Sellable":
    "قابل للبيع",
  "Sellable from":
    "قابل للبيع من",
  "Sellable now":
    "قابل للبيع الآن",
  "Send a test to…":
    "أرسل اختبارًا إلى…",
  "Send every alert to…":
    "أرسل كل التنبيهات إلى…",
  "Send what is waiting":
    "أرسل ما هو منتظر",
  "Set SMTP_URL (a mailbox on the company domain) or RESEND_API_KEY, plus MAIL_FROM, and these rows go out on the next tick. They wait with the reason attached rather than being dropped, and rather than this system claiming to have sent an email it never could.":
    "اضبط SMTP_URL (صندوق بريد على نطاق الشركة) أو RESEND_API_KEY، إضافةً إلى MAIL_FROM، فتخرج هذه السطور في الدورة التالية. وهي تنتظر مع ذكر السبب بدل أن تُهمل، وبدل أن يدّعي هذا النظام أنه أرسل بريدًا لم يكن قادرًا على إرساله أصلًا.",
  "Set a new password for this account":
    "عيّن كلمة مرور جديدة لهذا الحساب",
  "Set password":
    "عيّن كلمة المرور",
  "Setting":
    "الإعداد",
  "Setting a password here signs that account out of every device, on purpose: this is the path used when a password may be known to somebody else, and a cookie that kept working for another fortnight would make the reset decorative.":
    "تعيين كلمة مرور هنا يُخرج ذلك الحساب من كل الأجهزة، وهذا مقصود: فهذا هو المسار المستخدَم حين يُحتمل أن شخصًا آخر يعرف كلمة المرور، وكوكي يظلّ يعمل أسبوعين آخرين يجعل إعادة التعيين شكلية.",
  "Settings":
    "الإعدادات",
  "Severity":
    "الأهمية",
  "Sharing image — a catalogue reference":
    "صورة المشاركة — مرجع من الكتالوج",
  "Shipment":
    "الشحنة",
  "Shipments":
    "الشحنات",
  "Show deleted":
    "أظهر المحذوفة",
  "Sign in":
    "تسجيل الدخول",
  "Sign out":
    "تسجيل الخروج",
  "Sign out everywhere":
    "سجّل الخروج من كل الأجهزة",
  "Sign out everywhere else":
    "سجّل الخروج من الأجهزة الأخرى",
  "Signed in":
    "تم الدخول",
  "Signed in as":
    "مسجَّل الدخول باسم",
  "Site address":
    "عنوان الموقع",
  "Site contact":
    "مسؤول الموقع",
  "Site copy":
    "نصوص الموقع",
  "Size":
    "المقاس",
  "Social":
    "التواصل الاجتماعي",
  "Sold":
    "مُباع",
  "Source":
    "المصدر",
  "Specimen":
    "الصنف",
  "Specimen code (for specimen lines)":
    "رمز الصنف (لبنود الأصناف)",
  "Specimens":
    "الأصناف",
  "Specimens are tracked one by one; lots are tracked by quantity. Sellable excludes anything still acclimatising, in poor health, or sitting somewhere it cannot be sold from.":
    "الأصناف تُتتبَّع واحدًا واحدًا؛ والدفعات تُتتبَّع بالكمية. و«قابل للبيع» يستثني كل ما هو قيد التأقلم أو ضعيف الحالة أو موجود في مكان لا يُباع منه.",
  "Specimens tracked":
    "أصناف متتبَّعة",
  "Spread by":
    "التوزيع حسب",
  "Start a new one instead":
    "ابدأ واحدة جديدة بدلًا من ذلك",
  "Start the standard checklist":
    "ابدأ القائمة القياسية",
  "Started":
    "بدأ",
  "State":
    "الحالة",
  "Status":
    "الحالة",
  "Stock":
    "المخزون",
  "Stock that is not moving":
    "مخزون راكد",
  "Stored as":
    "مخزَّن باسم",
  "Stored size":
    "الحجم المخزَّن",
  "Subject":
    "الموضوع",
  "Subtotal":
    "المجموع الفرعي",
  "Summary — shown in the list and to search engines":
    "الملخّص — يظهر في القائمة ولمحركات البحث",
  "Supplier":
    "المورّد",
  "System":
    "النظام",
  "TOTAL":
    "الإجمالي",
  "TRN":
    "الرقم الضريبي",
  "Tables":
    "الجداول",
  "Tax invoice":
    "فاتورة ضريبية",
  "Test":
    "اختبار",
  "Testimonials":
    "الشهادات",
  "That code does not match anything in the system. It may have been cancelled, renumbered, or mistyped.":
    "هذا الرمز لا يطابق أي شيء في النظام. وقد يكون أُلغي أو أُعيد ترقيمه أو كُتب خطأً.",
  "That is not an email address.":
    "هذا ليس بريدًا إلكترونيًّا.",
  "That record does not exist, or is already deleted.":
    "هذا السجلّ غير موجود، أو محذوف بالفعل.",
  "That specimen does not exist.":
    "تلك الشجرة غير موجودة.",
  "The backup holds data only, not schema, so there is one source of truth for the shape of the database and it is the migrations.":
    "النسخة الاحتياطية تحمل البيانات فقط لا البنية، فيبقى مصدر واحد للحقيقة في شكل قاعدة البيانات وهو ملفات الترحيل.",
  "The current password is asked for even though you are already signed in: an unattended screen is the ordinary case, and this is the one action that can lock you out of your own system. Changing it signs out every other device signed in as you, and leaves this one alone.":
    "تُطلب كلمة المرور الحالية رغم أنك داخل بالفعل: فالشاشة المتروكة دون رقابة هي الحالة المعتادة، وهذا هو الإجراء الوحيد الذي قد يقفل عليك نظامك أنت. وتغييرها يُخرج كل جهاز آخر داخل باسمك، ويُبقي هذا الجهاز كما هو.",
  "The database lives on Neon&rsquo;s free plan, which keeps six hours of point-in-time history and will not schedule its own snapshots. Six hours is not a backup policy — it is the window in which somebody has to notice. This takes a full copy every night, stores it off Neon, reads it back to check it arrived intact, and keeps a month of them.":
    "قاعدة البيانات على الخطة المجانية من Neon، التي تحتفظ بست ساعات من السجل الزمني ولا تجدول لقطات خاصة بها. وستّ ساعات ليست سياسة نسخ احتياطي — بل هي النافذة التي يجب أن ينتبه أحدهم خلالها. هذا يأخذ نسخة كاملة كل ليلة، ويخزّنها خارج Neon، ويقرأها مرة أخرى للتأكد من وصولها سليمة، ويحتفظ بشهر منها.",
  "The number cannot be negative.":
    "لا يمكن أن يكون الرقم سالبًا.",
  "The number is a count of days, hours or units — it has to be whole.":
    "الرقم عدّ لأيام أو ساعات أو وحدات — فيجب أن يكون صحيحًا.",
  "The part of the system that speaks first. Everything else waits to be asked — an invoice falls overdue in silence, a permit lapses while a container is at sea. These are the conditions worth being interrupted for.":
    "الجزء من النظام الذي يتكلّم أولًا. كل ما عداه ينتظر أن تسأله — فالفاتورة تتأخّر في صمت، والتصريح ينتهي وحاوية في عرض البحر. وهذه هي الحالات التي تستحق أن تُقاطَع من أجلها.",
  "The words on the public site, and what a search engine is told about each page. Everything here has a compiled default — clear a box and the original text comes back, so nothing typed here can leave a page blank.":
    "الكلمات على الموقع العام، وما يُقال لمحركات البحث عن كل صفحة. لكل شيء هنا قيمة افتراضية في الكود — أفرِغ الحقل ويعود النص الأصلي، فلا شيء تكتبه هنا يمكن أن يترك صفحة فارغة.",
  "There is one active owner.":
    "يوجد مالك مفعَّل واحد.",
  "These are the values the website and every document read at runtime. Changing them here takes effect immediately — no deploy, no developer.":
    "هذه هي القيم التي يقرأها الموقع وكل مستند أثناء التشغيل. وتغييرها هنا يسري فورًا — بلا نشر ولا مطوّر.",
  "These override what each page already generates. Leave a box empty and the built-in title or description is used — which for the 68 catalogue pages is already written from the specimen itself, so emptying a box is safe and blanking one is not possible.":
    "هذه تتجاوز ما تولّده كل صفحة أصلًا. اترك الحقل فارغًا ويُستخدم العنوان أو الوصف المدمج — وهو لصفحات الكتالوج الـ68 مكتوب من الصنف نفسه، فإفراغ الحقل آمن وتركه بلا نص غير ممكن.",
  "This is hidden, not gone. Restore it, or remove it from the database for good.":
    "هذا مخفيّ لا محذوف. استعده، أو أزله من قاعدة البيانات نهائيًّا.",
  "This is what the audit log records beside everything you change.":
    "هذا ما يسجّله سجل التدقيق بجانب كل تغيير تجريه.",
  "This moves the stock, adds to the delivered quantities and re-derives the order status. Delivering more than remains is refused outright.":
    "هذا يحرّك المخزون، ويضيف إلى الكميات المسلَّمة، ويعيد اشتقاق حالة الطلب. وتسليم أكثر من المتبقّي مرفوض رفضًا قاطعًا.",
  "This version has been issued, so its lines are locked. Use":
    "صدرت هذه النسخة، فبنودها مقفلة. استخدم",
  "This version has been issued, so its lines are locked. Use “Revise” to create v{next} — the customer is holding this document.":
    "صدرت هذه النسخة، فبنودها مقفلة. استخدم «مراجعة» لإنشاء النسخة {next} — فالعميل يحمل هذه الوثيقة الآن.",
  "This version has been issued. Create a new version to change it.":
    "صدرت هذه النسخة. أنشئ نسخة جديدة لتعديلها.",
  "Title":
    "العنوان",
  "Title — aim for 50–60 characters":
    "العنوان — استهدف 50–60 حرفًا",
  "To":
    "إلى",
  "Topic":
    "الموضوع",
  "Total":
    "الإجمالي",
  "Total (AED)":
    "الإجمالي (درهم)",
  "Total landed":
    "الإجمالي النهائي",
  "Total leads":
    "إجمالي الاستفسارات",
  "Totals":
    "الإجماليات",
  "Trade licence":
    "الرخصة التجارية",
  "Trading — Operations":
    "Trading — التشغيل",
  "Trunk girth (cm)":
    "محيط الجذع (سم)",
  "Try the list it should be in:":
    "جرّب القائمة التي يُفترض أن يكون فيها:",
  "Type":
    "النوع",
  "Undo":
    "تراجع",
  "Unit":
    "الوحدة",
  "Unit (AED)":
    "سعر الوحدة (درهم)",
  "Unit cost":
    "تكلفة الوحدة",
  "Unit price (AED)":
    "سعر الوحدة (درهم)",
  "Units":
    "الوحدات",
  "Unknown health.":
    "حالة صحية غير معروفة.",
  "Unknown kind of record.":
    "نوع سجلّ غير معروف.",
  "Unknown language.":
    "لغة غير معروفة.",
  "Unknown severity.":
    "درجة خطورة غير معروفة.",
  "Unknown status.":
    "حالة غير معروفة.",
  "Update":
    "تحديث",
  "Update status":
    "حدّث الحالة",
  "Updated":
    "حُدّث",
  "Urgent":
    "عاجل",
  "VAT":
    "ضريبة القيمة المضافة",
  "VAT is off and no TRN is set, so invoices carry no VAT line and are marked not applicable for e-invoicing. UAE e-invoicing is Peppol PINT AE — structured XML through an accredited provider, not a PDF — and the identifiers it needs are already on each invoice, so switching it on is a mapping rather than a migration.":
    "الضريبة غير مفعّلة ولا رقم ضريبي مُدخَل، فالفواتير لا تحمل بند ضريبة وتُعلَّم غير منطبقة للفوترة الإلكترونية. والفوترة الإلكترونية في الإمارات هي Peppol PINT AE — ملف XML منظَّم عبر مزوّد معتمد، لا ملف PDF — والمعرّفات التي تحتاجها موجودة أصلًا على كل فاتورة، فتفعيلها ربطُ حقولٍ لا ترحيلُ نظام.",
  "VAT is off, so quotations carry no VAT line and state “exclusive of VAT where applicable”. Switch it on in settings once a TRN is issued.":
    "الضريبة غير مفعّلة، فعروض الأسعار لا تحمل بند ضريبة وتنصّ على «غير شاملة الضريبة حيثما تنطبق». فعّلها في الإعدادات بمجرد صدور الرقم الضريبي.",
  "VAT is off.":
    "الضريبة غير مفعّلة.",
  "VG-XXXXXXX":
    "VG-XXXXXXX",
  "Valid until":
    "ساري حتى",
  "Value won":
    "قيمة ما رُبح",
  "Vehicle":
    "المركبة",
  "Verde Garden":
    "Verde Garden",
  "Version":
    "النسخة",
  "View the site →":
    "عرض الموقع →",
  "View this language →":
    "عرض هذه اللغة →",
  "Viewer":
    "اطّلاع فقط",
  "Viewers cannot add stock.":
    "لا يمكن للمطّلعين إضافة مخزون.",
  "Viewers cannot change alerts.":
    "لا يمكن للمطّلعين تغيير التنبيهات.",
  "Viewers cannot change leads.":
    "لا يمكن للمطّلعين تغيير الاستفسارات.",
  "Viewers cannot change quotations.":
    "لا يمكن للمطّلعين تغيير عروض الأسعار.",
  "Viewers cannot change shipments.":
    "لا يمكن للمطّلعين تغيير الشحنات.",
  "Viewers cannot change stock.":
    "لا يمكن للمطّلعين تغيير المخزون.",
  "Viewers cannot complete deliveries.":
    "لا يمكن للمطّلعين إتمام التسليمات.",
  "Viewers cannot create orders.":
    "لا يمكن للمطّلعين إنشاء طلبات.",
  "Viewers cannot create quotations.":
    "لا يمكن للمطّلعين إنشاء عروض أسعار.",
  "Viewers cannot create shipments.":
    "لا يمكن للمطّلعين إنشاء شحنات.",
  "Viewers cannot delete anything.":
    "لا يمكن للمطّلعين حذف أي شيء.",
  "Viewers cannot edit content.":
    "لا يمكن للمطّلعين تعديل المحتوى.",
  "Viewers cannot raise invoices.":
    "لا يمكن للمطّلعين إصدار فواتير.",
  "Viewers cannot record measurements.":
    "لا يمكن للمطّلعين تسجيل القياسات.",
  "Viewers cannot record payments.":
    "لا يمكن للمطّلعين تسجيل مدفوعات.",
  "Viewers cannot revise quotations.":
    "لا يمكن للمطّلعين مراجعة عروض الأسعار.",
  "Viewers cannot schedule deliveries.":
    "لا يمكن للمطّلعين جدولة تسليمات.",
  "Volume each (m³)":
    "الحجم للوحدة (م³)",
  "Warning":
    "تحذير",
  "Weight each (kg)":
    "الوزن للوحدة (كغ)",
  "What":
    "ماذا",
  "What is on the way":
    "ما هو في الطريق",
  "What the roles mean":
    "ماذا تعني الأدوار",
  "What they said":
    "ماذا قالوا",
  "What was said, what was agreed, what is next.":
    "ما قيل، وما اتُّفق عليه، وما التالي.",
  "WhatsApp":
    "واتساب",
  "When":
    "متى",
  "Where":
    "أين",
  "Where the money is":
    "أين المال",
  "Where they are":
    "أين وصلت",
  "Where you are signed in":
    "أين سجّلت دخولك",
  "Which channel generates revenue":
    "أي قناة تولّد الإيرادات",
  "Which trees make money":
    "أي الأشجار تربح",
  "Who":
    "من",
  "Who buys, and who comes back":
    "من يشتري، ومن يعود",
  "Who can sign in, and what they may do. The roles have been in the database since the beginning and every page respects them — this is the screen that lets you use them without a developer.":
    "من يمكنه الدخول، وما المسموح له به. الأدوار موجودة في قاعدة البيانات منذ البداية وكل صفحة تحترمها — وهذه هي الشاشة التي تتيح لك استخدامها بلا مطوّر.",
  "Who converts":
    "من يتحوّل إلى عميل",
  "Why this cannot be removed yet":
    "لماذا لا يمكن إزالته بعد",
  "Win rate — none decided yet":
    "نسبة الإغلاق — لم يُحسم أي منها بعد",
  "Won":
    "رُبحت",
  "Wording — leave empty for the built-in text.":
    "الصياغة — اتركها فارغة للنص الافتراضي.",
  "Work this lead":
    "اعمل على هذا الاستفسار",
  "You can see these, but only the owner can change them.":
    "يمكنك الاطّلاع عليها، لكن المالك وحده يمكنه تعديلها.",
  "You can see this, but only an owner can change it.":
    "يمكنك الاطّلاع عليه، لكن المالك وحده يمكنه تعديله.",
  "You can see this, but you cannot change it.":
    "يمكنك الاطّلاع على هذا، لكن لا يمكنك تعديله.",
  "You have read-only access.":
    "صلاحيتك للاطّلاع فقط.",
  "Your account":
    "حسابك",
  "Your name":
    "اسمك",
  "Your reference":
    "مرجعكم",
  "Zero because no landed cost has been recorded against stock yet — cost a shipment and this fills in.":
    "صفر لأنه لم تُسجَّل تكلفة نهائية على المخزون بعد — احسب تكلفة شحنة وسيمتلئ هذا.",
  "advance — the agreed percentage up front":
    "دفعة مقدّمة — النسبة المتفق عليها مسبقًا",
  "at least 10 characters":
    "10 أحرف على الأقل",
  "been sitting":
    "بقي",
  "cannot sell from":
    "لا يمكن البيع من",
  "edited":
    "معدَّل",
  "email of 12 March, site meeting…":
    "بريد 12 مارس، اجتماع موقع…",
  "gate width, overhead cables, community timing rules":
    "عرض البوابة، كابلات علوية، أوقات مسموح بها في المجمّع",
  "h ago":
    "ساعة مضت",
  "health is":
    "الحالة الصحية",
  "just now":
    "الآن",
  "lead has":
    "استفسار",
  "leads have":
    "استفسارات",
  "locked at purchase":
    "مثبَّت عند الشراء",
  "min ago":
    "دقيقة مضت",
  "moved":
    "نُقل",
  "name of whoever signed for it":
    "اسم من وقّع بالاستلام",
  "nobody":
    "لا أحد",
  "not sellable":
    "غير قابلة للبيع",
  "olive-trees-gulf-summer":
    "olive-trees-gulf-summer",
  "product — from the catalogue":
    "منتج — من الكتالوج",
  "proforma":
    "فاتورة مبدئية",
  "retention — released after the holding period":
    "مبلغ محتجز — يُفرج عنه بعد مدة الاحتجاز",
  "sellable":
    "قابلة للبيع",
  "service — delivery, crane, planting":
    "خدمة — تسليم، رافعة، زراعة",
  "specimen {code}":
    "الشجرة {code}",
  "specimen — one named tree":
    "شجرة — شجرة واحدة محدَّدة",
  "status is":
    "الحالة",
  "still acclimatising until":
    "ما زالت في التأقلم حتى",
  "system":
    "النظام",
  "tax invoice — the order":
    "فاتورة ضريبية — الطلب",
  "translated":
    "مترجَم",
  "uncontacted for more than 24 hours.":
    "دون تواصل لأكثر من 24 ساعة.",
  "enquiry":
    "طلب استفسار",
  "quotation":
    "عرض سعر",
  "order":
    "طلب",
  "invoice":
    "فاتورة",
  "payment":
    "دفعة",
  "delivery":
    "تسليم",
  "shipment":
    "شحنة",
  "specimen":
    "صنف",
  "customer":
    "عميل",
  "supplier":
    "مورّد",
  "shipment line":
    "بند شحنة",
  "shipment cost":
    "تكلفة شحنة",
  "shipment document":
    "مستند شحنة",
  "quotation line":
    "بند عرض سعر",
  "order line":
    "بند طلب",
  "purchase order":
    "أمر شراء",
  "Still linked to this {parent}: {n} × {child}. Remove those first.":
    "ما زال مرتبطًا بهذا السجل ({parent}): {n} × {child}. احذفها أولًا.",
  "That record no longer exists.":
    "هذا السجل لم يعد موجودًا.",
  "Delete it first. Permanently removing a record that is still live is one click away from removing the wrong one.":
    "احذفه أولًا. الإزالة النهائية لسجل ما زال نشطًا تبعد نقرة واحدة عن إزالة السجل الخطأ.",
  "This invoice has payments against it. An invoice that has been paid is an accounting record the law requires to be kept — cancel it instead, which voids it without erasing it.":
    "على هذه الفاتورة دفعات مسجَّلة. والفاتورة المدفوعة سجل محاسبي يُلزم القانون بحفظه — ألغِها بدلًا من ذلك، فتبطل دون أن تُمحى.",
  "A received payment is an accounting record. Reverse it with a credit rather than deleting the evidence that money arrived.":
    "الدفعة المستلمة سجل محاسبي. اعكسها بإشعار دائن بدلًا من حذف الدليل على وصول المال.",
  "Import permit (MOCCAE)":
    "تصريح استيراد (MOCCAE)",
  "Phytosanitary certificate":
    "شهادة صحة نباتية",
  "CITES certificate":
    "شهادة سايتس (CITES)",
  "Commercial invoice":
    "فاتورة تجارية",
  "Packing list":
    "قائمة تعبئة",
  "Bill of lading / airway bill":
    "بوليصة شحن / بوليصة شحن جوي",
  "Certificate of origin":
    "شهادة منشأ",
  "Customs declaration":
    "بيان جمركي",
  "Other":
    "أخرى",
  "Remove {doc}":
    "إزالة {doc}",
  "Required":
    "مطلوب",
  "Requested":
    "تم طلبه",
  "Verified":
    "تم التحقق",
  "Not applicable":
    "لا ينطبق",
  "Trade licence {n}":
    "الرخصة التجارية {n}",
  "TRN {n}":
    "الرقم الضريبي {n}",
  "WhatsApp {n}":
    "واتساب {n}",
  "Import permit {n} expired on {date}. A consignment of live plants cannot clear on an expired permit — it will sit at the port accruing storage. Renew before arrival.":
    "انتهت صلاحية تصريح الاستيراد {n} في {date}. ولا يمكن تخليص شحنة من النباتات الحية بتصريح منتهٍ — ستبقى في الميناء وتتراكم عليها رسوم التخزين. جدّده قبل الوصول.",
  "{n} of {total} still outstanding":
    "{n} من {total} ما زالت ناقصة",
  "{n} expired":
    "{n} منتهية الصلاحية",
  "{n} expiring within 30 days":
    "{n} تنتهي خلال 30 يومًا",
  "A container does not clear on the strength of the ones that are done.":
    "الحاوية لا تُخلَّص بفضل المستندات الجاهزة وحدها.",
  "Nothing needs attention. The checks ran {when} — if that says never, press “Run checks now”.":
    "لا شيء يحتاج انتباهًا. آخر تشغيل للفحوصات كان {when} — وإن كان «أبدًا» فاضغط «شغّل الفحوصات الآن».",
  "never":
    "أبدًا",
  "This run has been delivered: the stock has moved and the order counts it. Mark it failed or cancelled instead of erasing what happened.":
    "تم تنفيذ هذا التسليم: المخزون تحرّك والطلب يحتسبه. علِّمه كفاشل أو ملغى بدل محو ما حدث.",
  "Something went wrong":
    "حدث خطأ ما",
  "This screen could not finish loading. Nothing you were doing has been lost — the records are unchanged. Try again, and if it keeps happening send the reference below.":
    "تعذّر تحميل هذه الشاشة بالكامل. ولم يضع شيء مما كنت تفعله — السجلات كما هي. أعد المحاولة، وإن تكرر الأمر فأرسل الرقم المرجعي أدناه.",
  "Try again":
    "أعد المحاولة",
  "Put {code} back? It will appear in the lists again.":
    "هل تريد إرجاع {code}؟ سيظهر في القوائم من جديد.",
  "Credit note":
    "إشعار دائن",
  "Account name":
    "اسم الحساب",
  "Bank":
    "المصرف",
  "Cancelled":
    "ملغاة",
  "Payment":
    "الدفع",
  "Please quote {code} on the transfer.":
    "يُرجى ذكر {code} في بيان التحويل.",
  "Bank: account name":
    "المصرف: اسم الحساب",
  "Bank: name and branch":
    "المصرف: الاسم والفرع",
  "Bank: IBAN":
    "المصرف: الآيبان",
  "Bank: SWIFT / BIC":
    "المصرف: سويفت / BIC",
  "Note printed under the bank details":
    "ملاحظة تُطبع أسفل بيانات المصرف",
  "Legal name":
    "الاسم القانوني",
  "Brand name":
    "الاسم التجاري",
  "Tagline":
    "العبارة التعريفية",
  "WhatsApp number (digits, with country code)":
    "رقم واتساب (أرقام فقط مع رمز الدولة)",
  "WhatsApp, as displayed":
    "واتساب، كما يظهر",
  "City / emirate":
    "المدينة / الإمارة",
  "Country":
    "الدولة",
  "Instagram link":
    "رابط إنستغرام",
  "LinkedIn link":
    "رابط لينكدإن",
  "Facebook link":
    "رابط فيسبوك",
  "YouTube link":
    "رابط يوتيوب",
  "TikTok link":
    "رابط تيك توك",
  "Trade licence number":
    "رقم الرخصة التجارية",
  "Founded (year, or yyyy-mm-dd)":
    "سنة التأسيس (سنة أو yyyy-mm-dd)",
  "Founded in (city, country)":
    "مكان التأسيس (مدينة، دولة)",
  "Italian company behind this one, if any":
    "الشركة الإيطالية التي تقف خلفها، إن وُجدت",
  "Its website":
    "موقعها الإلكتروني",
  "Growing / trading in Italy since (year)":
    "تزرع/تتاجر في إيطاليا منذ (سنة)",
  "TRN (tax registration number)":
    "الرقم الضريبي (TRN)",
  "Charge VAT":
    "تحصيل ضريبة القيمة المضافة",
  "VAT rate (0.05 = 5%)":
    "نسبة الضريبة (0.05 = ٥٪)",
  "Quotation validity (days)":
    "مدة صلاحية عرض السعر (أيام)",
  "Registered office":
    "المقر المسجَّل",
  "Commerce":
    "التجارة",
  "New enquiry":
    "طلب استفسار جديد",
  "Enquiry still unanswered":
    "استفسار ما زال بلا رد",
  "Follow-up due":
    "موعد متابعة مستحق",
  "Quotation accepted":
    "عرض سعر مقبول",
  "Quotation about to expire":
    "عرض سعر يوشك أن ينتهي",
  "Order confirmed":
    "طلب مؤكَّد",
  "Delivery coming up":
    "تسليم قادم",
  "Shipment arriving":
    "شحنة قادمة",
  "Import permit expiring":
    "تصريح استيراد يوشك أن ينتهي",
  "Invoice falling due":
    "فاتورة تقترب من الاستحقاق",
  "Invoice overdue":
    "فاتورة متأخرة",
  "Payment received":
    "دفعة مستلمة",
  "Stock running low":
    "المخزون يقترب من النفاد",
  "Stock not moving":
    "مخزون راكد",
  "Tree in poor health":
    "شجرة في حالة صحية سيئة",
  "No recent backup":
    "لا توجد نسخة احتياطية حديثة",
  "Customer over credit limit":
    "عميل تجاوز حد الائتمان",
  "The first hour decides the sale. An enquiry that waits until someone opens the list has usually already been answered by a competitor.":
    "الساعة الأولى هي التي تحسم البيع. والاستفسار الذي ينتظر حتى يفتح أحدهم القائمة يكون غالبًا قد ردّ عليه منافس بالفعل.",
  "Catches what the arrival alert missed — an enquiry nobody has touched after the given number of hours.":
    "يلتقط ما فات تنبيه الوصول — استفسار لم يلمسه أحد بعد عدد الساعات المحدد.",
  "A promised call that never happens costs the deal and the reputation. Fires for follow-ups due within the given number of days.":
    "مكالمة وُعد بها ولم تحدث تكلّف الصفقة والسمعة. يعمل للمتابعات المستحقة خلال عدد الأيام المحدد.",
  "Acceptance starts a clock: stock is reserved, the order has to be raised and the customer expects confirmation the same day.":
    "القبول يُطلق عدّادًا: يُحجز المخزون، ويجب إصدار الطلب، والعميل يتوقع التأكيد في اليوم نفسه.",
  "A quotation nearing its validity date is the cheapest sale left in the pipeline — one call, on a price already agreed.":
    "عرض السعر الذي يقترب من انتهاء صلاحيته هو أرخص بيعة متبقية في المسار — مكالمة واحدة على سعر متفق عليه أصلًا.",
  "Confirmation is where fulfilment, invoicing and delivery planning all begin.":
    "من التأكيد يبدأ التنفيذ والفوترة وتخطيط التسليم.",
  "A delivery needs a crane, a permit and a driver arranged the day before, not the morning of. Fires for deliveries scheduled within the given number of days.":
    "التسليم يحتاج رافعة وتصريحًا وسائقًا يُرتَّب في اليوم السابق لا في صباح اليوم نفسه. يعمل لعمليات التسليم المجدولة خلال عدد الأيام المحدد.",
  "Live trees do not wait at a port. Clearance, transport and yard space have to be ready before the container lands, not after demurrage starts.":
    "الأشجار الحية لا تنتظر في الميناء. التخليص والنقل ومساحة الساحة يجب أن تكون جاهزة قبل وصول الحاوية لا بعد بدء غرامات التأخير.",
  "A MOCCAE permit is valid six months. If it lapses while a container is at sea, the shipment cannot clear — and a container of live trees sitting at the port is the most expensive failure in this business.":
    "تصريح الوزارة صالح ستة أشهر. وإذا انتهى بينما الحاوية في البحر تعذّر تخليص الشحنة — وحاوية أشجار حية واقفة في الميناء هي أغلى إخفاق في هذه التجارة.",
  "A reminder before the due date collects far more than a chase after it, and costs nothing in goodwill.":
    "التذكير قبل تاريخ الاستحقاق يحصّل أكثر بكثير من المطالبة بعده، ولا يكلّف شيئًا من العلاقة.",
  "Contractors here pay late as a matter of course. The alert re-raises as the debt crosses 30, 60 and 90 days, because each band is a different conversation.":
    "المقاولون هنا يتأخرون في الدفع كعادة. ويتكرر التنبيه كلما تجاوز الدين ٣٠ و٦٠ و٩٠ يومًا، لأن كل مرحلة حديث مختلف.",
  "Cash landing is the only event that closes the loop, and the one the owner most wants to see.":
    "وصول النقد هو الحدث الوحيد الذي يُغلق الدورة، وهو ما يودّ المالك رؤيته أكثر من غيره.",
  "Replacement stock comes from Italy with a lead time measured in weeks, so the reorder decision has to be made while there is still something to sell.":
    "المخزون البديل يأتي من إيطاليا بمهلة تُقاس بالأسابيع، فقرار إعادة الطلب يجب أن تُتخذ وما زال هناك ما يُباع.",
  "Living stock costs water, labour and space every month it waits, and a tree that has not sold in months is usually mispriced rather than unlucky.":
    "المخزون الحي يكلّف ماءً وعمالة ومساحة كل شهر ينتظره، والشجرة التي لم تُبع منذ أشهر يكون سعرها خاطئًا غالبًا لا حظها.",
  "A stressed tree can be saved; a dead one is a written-off asset. This is the alert that pays for itself first.":
    "الشجرة المجهدة يمكن إنقاذها؛ أما الميتة فأصل مشطوب. وهذا التنبيه أول ما يسدّد كلفته.",
  "A backup system fails silently — nothing breaks when it stops, and the discovery happens on the one day it was needed. This is the alert that makes the silence audible.":
    "نظام النسخ الاحتياطي يتعطّل بصمت — لا شيء ينكسر حين يتوقف، ويُكتشف الأمر في اليوم الوحيد الذي احتجناه فيه. وهذا التنبيه هو ما يجعل ذلك الصمت مسموعًا.",
  "The limit exists to stop one contractor quietly becoming the whole receivables book. Crossing it should be a decision, not a discovery.":
    "الحد موجود كي لا يصبح مقاول واحد بهدوء كامل دفتر الذمم. وتجاوزه ينبغي أن يكون قرارًا لا اكتشافًا.",
  "Hours without contact":
    "ساعات بلا تواصل",
  "Days ahead":
    "أيام مقدَّمًا",
  "Days before expiry":
    "أيام قبل انتهاء الصلاحية",
  "Days before ETA":
    "أيام قبل الوصول المتوقع",
  "Days before due":
    "أيام قبل الاستحقاق",
  "Days past due":
    "أيام بعد الاستحقاق",
  "Units remaining or fewer":
    "الوحدات المتبقية أو أقل",
  "Days in stock":
    "أيام في المخزون",
  "Hours since the last good backup":
    "ساعات منذ آخر نسخة احتياطية ناجحة",
  "on the event":
    "عند وقوع الحدث",
  "on a schedule":
    "حسب جدول زمني",
  "{n} in total. A kind with no rule raises nothing — silence is a choice, not a fault.":
    "{n} في المجموع. والنوع الذي لا قاعدة له لا يُطلق شيئًا — فالصمت اختيار لا عطل.",
  "specimens":
    "صنفًا",
  "emirates":
    "إمارات",
  "languages":
    "لغات",
  "Italian roots for a greener tomorrow":
    "جذورٌ إيطالية لغدٍ أكثر خضرة",
  "Mature specimens lifted in Italy, cleared, acclimatised and planted across the Emirates.":
    "أصناف ناضجة تُقتلع في إيطاليا، ثم تُخلَّص وتتأقلم وتُغرس في جميع أنحاء الإمارات.",
  "Dubai":
    "دبي",
  "Welcome back":
    "أهلًا بعودتك",
  "Welcome back, {name}":
    "أهلًا بعودتك، {name}",
  "Name greeted on the sign-in screen":
    "الاسم الذي تُحيّيه شاشة الدخول",
  "unverified":
    "غير مُتحقَّق منه",
  "version {n}":
    "النسخة {n}",
  "why this changed":
    "سبب هذا التغيير",
  "{emirate}, United Arab Emirates":
    "{emirate}، الإمارات العربية المتحدة",
  "{min}–{max} weeks from order confirmation to site.":
    "من {min} إلى {max} أسبوعًا من تأكيد الطلب إلى الموقع.",
  "{n} of {total} rules send an email.":
    "‏{n} من أصل {total} قاعدة ترسل بريدًا إلكترونيًّا.",
  "· AED":
    "· درهم",
  "← All leads":
    "→ كل الاستفسارات",
  "← Inventory":
    "→ المخزون",
  "← Orders":
    "→ الطلبات",
  "← Quotations":
    "→ عروض الأسعار",
  "← Shipments":
    "→ الشحنات",
  "− AED":
    "− درهم",
};

export const ADMIN_DICTS: Record<Locale, Partial<Record<AdminKey, string>>> = {
  en: {}, ar, it,
};

/**
 * The console translator.
 *
 *   const t = adminUi(user.locale);
 *   t('Quotations')   ->  'Preventivi'
 *
 * An untranslated string comes back as its own English, which is the key — so
 * a screen not yet worked through is half Italian and fully readable, rather
 * than half empty.
 */
export function adminUi(locale?: string | null) {
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = ADMIN_DICTS[l];
  /**
   * `tokens` is why several console sentences were still English.
   *
   * "12 of 16 rules send an email" was written as `{n} of {total} rules send`
   * with the numbers in the markup, so the extractor saw three fragments and
   * no sentence. Translated as fragments they come back in English word order
   * with the numbers stranded — which in Arabic, read right to left, is not a
   * sentence at all. With a token the whole sentence is one string and each
   * language decides where the number goes.
   *
   * An unknown token is left visible rather than blanked, so a missing value
   * shows up as `{n}` on screen instead of a silent gap nobody notices.
   */
  return (key: AdminKey, tokens?: Record<string, string | number>): string => {
    const s = dict[key] ?? key;
    return tokens
      ? s.replace(/\{(\w+)\}/g, (all, k) => (k in tokens ? String(tokens[k]) : all))
      : s;
  };
}

/** What the coverage test measures. */
export const ADMIN_KEYS = ADMIN_EN;

/**
 * The status words, which are data rather than copy.
 *
 * 'partially_delivered' is a value in the database, written by the code that
 * moves stock and read by every query that counts orders. It must never be
 * translated at rest — a row whose status depends on who saved it would break
 * every filter and every total. So it stays English in the column and is
 * translated here, on the way to the screen, and nowhere else.
 *
 * The console rendered these with `.replace(/_/g, ' ')`, which turns
 * partially_delivered into "partially delivered" and is the whole of the
 * presentation. That was invisible to the string extractor — there is no
 * literal to find — which is why an otherwise Italian orders screen still had
 * English chips down the middle of it.
 */
const STATUS_EN = [
  // leads
  'new', 'contacted', 'qualified', 'quoted', 'negotiation', 'won', 'lost',
  // quotations
  'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'superseded',
  // orders and deliveries
  'confirmed', 'preparing', 'partially_delivered', 'delivered', 'completed',
  'cancelled', 'scheduled', 'loaded', 'out_for_delivery', 'failed',
  // invoices
  'issued', 'part_paid', 'paid', 'overdue',
  // stock
  'incoming', 'acclimatising', 'available', 'reserved', 'sold', 'dead', 'written_off',
  // shipments and their documents
  'planned', 'booked', 'in_transit', 'arrived', 'customs', 'cleared', 'received',
  'required', 'requested', 'verified', 'not_applicable',
  // outbound messages
  'queued', 'sending', 'blocked',
] as const;

export type StatusKey = (typeof STATUS_EN)[number];

const STATUS_IT: Record<StatusKey, string> = {
  new: 'nuova', contacted: 'contattata', qualified: 'qualificata', quoted: 'quotata',
  negotiation: 'in trattativa', won: 'acquisita', lost: 'persa',
  draft: 'bozza', sent: 'inviato', viewed: 'visualizzato', accepted: 'accettato',
  rejected: 'rifiutato', expired: 'scaduto', superseded: 'sostituito',
  confirmed: 'confermato', preparing: 'in preparazione',
  partially_delivered: 'parzialmente consegnato', delivered: 'consegnato',
  completed: 'completato', cancelled: 'annullato', scheduled: 'pianificata',
  loaded: 'caricata', out_for_delivery: 'in consegna', failed: 'non riuscita',
  issued: 'emessa', part_paid: 'parz. pagata', paid: 'pagata', overdue: 'scaduta',
  incoming: 'in arrivo', acclimatising: 'in acclimatazione', available: 'disponibile',
  reserved: 'riservato', sold: 'venduto', dead: 'morto', written_off: 'svalutato',
  planned: 'pianificata', booked: 'prenotata', in_transit: 'in transito',
  arrived: 'arrivata', customs: 'in dogana', cleared: 'sdoganata', received: 'ricevuta',
  required: 'richiesto', requested: 'sollecitato', verified: 'verificato',
  not_applicable: 'non applicabile',
  queued: 'in coda', sending: 'in invio', blocked: 'bloccato',
};

const STATUS_AR: Record<StatusKey, string> = {
  new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهَّل', quoted: 'مُسعَّر',
  negotiation: 'قيد التفاوض', won: 'رُبح', lost: 'خُسر',
  draft: 'مسودّة', sent: 'مُرسَل', viewed: 'اطُّلع عليه', accepted: 'مقبول',
  rejected: 'مرفوض', expired: 'منتهٍ', superseded: 'مُستبدَل',
  confirmed: 'مؤكَّد', preparing: 'قيد التجهيز',
  partially_delivered: 'مُسلَّم جزئيًا', delivered: 'مُسلَّم',
  completed: 'مكتمل', cancelled: 'ملغى', scheduled: 'مجدول',
  loaded: 'مُحمَّل', out_for_delivery: 'في الطريق', failed: 'فشل',
  issued: 'صادرة', part_paid: 'مدفوعة جزئيًا', paid: 'مدفوعة', overdue: 'متأخرة',
  incoming: 'وارد', acclimatising: 'قيد التأقلم', available: 'متاح',
  reserved: 'محجوز', sold: 'مُباع', dead: 'نافق', written_off: 'مشطوب',
  planned: 'مخطَّطة', booked: 'محجوزة', in_transit: 'في الطريق',
  arrived: 'وصلت', customs: 'في الجمارك', cleared: 'مُخلَّصة', received: 'مستلَمة',
  required: 'مطلوب', requested: 'طُلب', verified: 'مُتحقَّق منه',
  not_applicable: 'غير منطبق',
  queued: 'في الطابور', sending: 'قيد الإرسال', blocked: 'محجوب',
};

export const STATUS_DICTS: Record<Locale, Partial<Record<StatusKey, string>>> = {
  en: {}, it: STATUS_IT, ar: STATUS_AR,
};
export const STATUS_KEYS = STATUS_EN;

/**
 * A status, as a person should read it.
 *
 * Anything unrecognised falls through to the old presentation — underscores
 * become spaces — so a status added to the database tomorrow shows up as
 * readable English rather than as a blank cell or a raw identifier.
 */
export function adminStatus(locale?: string | null) {
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = STATUS_DICTS[l];
  return (value: string | null | undefined): string => {
    if (!value) return '';
    return dict[value as StatusKey] ?? value.replace(/_/g, ' ');
  };
}
