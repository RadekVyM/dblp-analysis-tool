'use client'

import { clamp } from '@/utils/numbers'
import { useEffect, useState } from 'react'

export default function useTimer(time: number, callback: () => void) {
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pausedTime, setPausedTime] = useState(0);
    const [paused, setPaused] = useState(false);
    const [timer, setTimer] = useState<{ offset: number, paused: boolean, done: boolean } | null>(null);

    useEffect(() => {
        if (timer) {
            timer.paused = paused;
        }
    }, [paused, timer]);

    function start() {
        if (timer) {
            return
        }

        const newTimer = createTimer(time, callback, setProgress, setElapsedTime);
        setTimer(newTimer);
        newTimer.start();
    }

    function pause() {
        if (paused) {
            return
        }

        setPausedTime(elapsedTime);
        setPaused(true);
    }

    function resume() {
        if (!paused) {
            return
        }

        if (timer && pausedTime > 0) {
            timer.offset = timer.offset + (elapsedTime - pausedTime);
        }
        setPaused(false);
        setPausedTime(-1);
    }

    function stop() {
        if (timer) {
            timer.done = true;
        }
    }

    return {
        progress,
        paused,
        start,
        pause,
        resume,
        stop
    }
}

function createTimer(
    time: number,
    callback: () => void,
    setProgress: (value: number) => void,
    setElapsedTime: (value: number) => void) {
    let startTime: number | undefined = undefined;

    const data = {
        started: false,
        paused: false,
        done: false,
        offset: 0,
        start: start
    };

    function start() {
        const started = data.started;
        data.started = true;
        if (!started) {
            requestAnimationFrame(step);
        }
    }

    function step(timeStamp: number) {
        if (data.done) {
            return
        }

        if (!startTime) {
            startTime = timeStamp;
        }

        const elapsedTime = timeStamp - startTime;
        const progress = (elapsedTime - data.offset) / time;
        setElapsedTime(elapsedTime);
        if (!data.paused) {
            setProgress(clamp(progress, 0, 1));
        }

        if (data.paused || progress < 1) {
            requestAnimationFrame(step);
        }
        else {
            data.done = true;
            callback();
        }
    }

    return data
}