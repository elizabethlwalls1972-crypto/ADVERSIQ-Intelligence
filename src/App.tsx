import { lazyWithReload } from 'somewhere';

//... omitted lines for brevity

const Gateway = lazyWithReload(() => import('./components/Gateway'));

//... omitted lines for brevity

setViewMode('consultant-os');

//... omitted lines for brevity

startNewMission();

// explicit report-generator render branch
renderReportGenerator();

// global-location-intel branch
//... continuation of your code