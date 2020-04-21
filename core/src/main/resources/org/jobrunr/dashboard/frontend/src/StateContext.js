import React from 'react';

let oldStats = null;

class State {
    constructor() {
        this._listeners = new Map();
        this._data = {};
        this._data.stats = {estimation: {}};
    }

    setStats(stats) {
        this._data.stats = stats;
        this._listeners.forEach(listener => listener(stats));
    }

    getStats() {
        return this._data.stats;
    }

    useStatsState(obj) {
        const [stats, setStats] = React.useState(state.getStats());
        const cleanup = () => this.removeListener(obj);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        React.useEffect(() => cleanup, []);
        this.addListener(obj, setStats);
        return stats;
    }

    addListener(obj, listener) {
        this._listeners.set(obj, listener);
        //console.log("Adding listener", this._listeners);
    }

    removeListener(obj) {
        this._listeners.delete(obj);
        //console.log("Removing listener", this._listeners);
    }
}

const state = new State();
Object.freeze(state);

const eventSource = new EventSource(process.env.REACT_APP_SSE_URL)
eventSource.onmessage = e => {
    const newStats = JSON.parse(e.data);
    if ((newStats.enqueued != null && newStats.enqueued < 1) && (newStats.processing != null && newStats.processing < 1)) {
        state.setStats({...newStats, estimation: {processingDone: true}});
    } else if (oldStats == null) {
        oldStats = {...newStats, timestamp: new Date()};
        state.setStats({...newStats, estimation: {processingDone: false, estimatedProcessingTimeAvailable: false}});
    } else {
        const amountSucceeded = newStats.succeeded - oldStats.succeeded;
        if (amountSucceeded < 1) {
            state.setStats({
                ...newStats,
                estimation: {processingDone: false, estimatedProcessingTimeAvailable: false}
            });
        } else {
            const timeDiff = new Date() - oldStats.timestamp;
            if (!isNaN(timeDiff)) {
                const amountSucceededPerSecond = amountSucceeded * 1000 / timeDiff;
                const estimatedProcessingTime = newStats.enqueued / amountSucceededPerSecond
                const processingTimeDate = (new Date().getTime() + (estimatedProcessingTime * 1000));
                state.setStats({
                    ...newStats,
                    estimation: {
                        processingDone: false,
                        estimatedProcessingTimeAvailable: true,
                        estimatedProcessingTime: processingTimeDate
                    }
                });
            }
        }
    }
};

export default state;