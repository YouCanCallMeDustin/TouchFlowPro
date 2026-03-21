import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView } from '../utils/analytics';

/**
 * Component that automatically tracks page views on route changes.
 * Should be placed inside the Router component.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track the current page view including search parameters
    logPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

export default AnalyticsTracker;
