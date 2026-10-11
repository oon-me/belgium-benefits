// Publisher details. Required on a published site under EU/Belgian e-commerce rules, which
// expect a visitor to be able to identify and contact whoever runs it.
//
// Set these at build time:
//   VITE_PUBLISHER_NAME="Your Name"
//   VITE_CONTACT_EMAIL="you@example.be"
//
// Left unset, the legal page says so visibly rather than rendering a blank — a silently empty
// publisher notice is worse than an obviously missing one.
export const PUBLISHER_NAME = import.meta.env?.VITE_PUBLISHER_NAME || "";
export const CONTACT_EMAIL = import.meta.env?.VITE_CONTACT_EMAIL || "";
export const isPublisherConfigured = Boolean(PUBLISHER_NAME && CONTACT_EMAIL);
