export const START_TOUR_EVENT = 'it-hub:start-tour'
export const startTour = () => window.dispatchEvent(new Event(START_TOUR_EVENT))
