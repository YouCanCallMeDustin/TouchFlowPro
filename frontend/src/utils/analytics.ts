import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-HF7K076SEK";

/**
 * Initializes Google Analytics 4 with the specified measurement ID.
 */
export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
  console.log("GA4 Initialized with ID:", MEASUREMENT_ID);
};

/**
 * Logs a page view event.
 * @param path The URL path to track.
 */
export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * Logs a custom event.
 * @param category The event category.
 * @param action The event action.
 * @param label Optional event label.
 */
export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
