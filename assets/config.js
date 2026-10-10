/*
 * The only file you need to edit after setup.
 * SCRIPT_URL: paste the Web App URL you get when you deploy the Apps Script
 * (it ends with /exec). While it is empty, every page runs in demo mode with
 * sample data and nothing is saved anywhere.
 */
window.ADAM_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzC3llcdTyV_-RVWWWRi9d_toa-ZtRW1-pI81oTZzTPMDUarwFBcbIPkemCwFX6UF_R/exec",

  // Shown on the public results page
  PROJECT_NAME: "Adam",

  // Country used when a link has no ?c=  (qa, ae, sa, eg, other)
  DEFAULT_COUNTRY: "qa",

  // Targets per country (kept for reference only, not shown on any page)
  TARGETS: {
    qa:    { residents: 200, waitlist: 300, businesses: 20, commitments: 10 },
    ae:    { residents: 200, waitlist: 300, businesses: 20, commitments: 10 },
    sa:    { residents: 200, waitlist: 300, businesses: 20, commitments: 10 },
    eg:    { residents: 200, waitlist: 300, businesses: 20, commitments: 10 },
    other: { residents: 100, waitlist: 150, businesses: 10, commitments: 5 }
  },

  // The public page hides a breakdown until it has at least this many answers (0 = always show)
  PUBLIC_MIN_N: 0
};
