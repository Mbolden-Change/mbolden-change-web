export type AnalyticsLocation = string;

export function isDonateCta() {
  return false;
}

export function trackDonateClick(_location: AnalyticsLocation) {}

export function trackNewsletterSignup(_location: AnalyticsLocation) {}
