const { useEffect, useMemo, useRef, useState } = React;

const ROWS = 9;
const COLS = 14;
const START = { r: Math.floor(ROWS / 2), c: 1 };
const END = { r: Math.floor(ROWS / 2), c: COLS - 2 };

const id = (r, c) => `${r},${c}`;
const same = (a, b) => a.r === b.r && a.c === b.c;

function buildAutoTrack() {
  const tracks = new Set([id(START.r, START.c), id(END.r, END.c)]);
  let r = START.r;
  let c = START.c;

  while (c < END.c) {
    c += 1;
    tracks.add(id(r, c));
  }
  const mid = Math.floor((START.c + END.c) / 2);
  tracks.add(id(START.r - 1, mid));
  tracks.add(id(START.r + 1, mid));
  return tracks;
}

function neighbors(cell, tracks) {
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  return dirs
    .map(([dr, dc]) => ({ r: cell.r + dr, c: cell.c + dc }))
    .filter(
      (n) =>
        n.r >= 0 &&
        n.r < ROWS &&
        n.c >= 0 &&
        n.c < COLS &&
        tracks.has(id(n.r, n.c))
    );
}

function findPath(tracks) {
  const queue = [START];
  const prev = new Map([[id(START.r, START.c), null]]);

  while (queue.length) {
    const current = queue.shift();
    if (same(current, END)) break;

    for (const next of neighbors(current, tracks)) {
      const nextId = id(next.r, next.c);
      if (prev.has(nextId)) continue;
      prev.set(nextId, current);
      queue.push(next);
    }
  }

  if (!prev.has(id(END.r, END.c))) return [];

  const path = [];
  let cursor = END;
  while (cursor) {
    path.push(cursor);
    cursor = prev.get(id(cursor.r, cursor.c));
  }
  return path.reverse();
}

function App() {
  const [tracks, setTracks] = useState(() => buildAutoTrack());
  const [view, setView] = useState('map');
  const [running, setRunning] = useState(false);
  const [path, setPath] = useState([]);
  const [trainIndex, setTrainIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0);
  const [throttle, setThrottle] = useState(35);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(100);
  const [trips, setTrips] = useState(0);
  const [passengersWaiting, setPassengersWaiting] = useState(48);
  const [passengersDelivered, setPassengersDelivered] = useState(0);
  const [status, setStatus] = useState('Build a route, then run the train.');

  const animationRef = useRef(null);

  const trainCell = useMemo(() => {
    if (!running || path.length < 2) return null;
    const a = path[Math.min(trainIndex, path.length - 1)];
    const b = path[Math.min(trainIndex + 1, path.length - 1)] || a;
    if (!a || !b) return null;

    if (segmentProgress < 0.5) return a;
    return b;
  }, [running, path, trainIndex, segmentProgress]);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      setSpeed((current) => current + ((throttle * 1.4) - current) * 0.1);
      setSegmentProgress((p) => p + Math.max(0.02, speed / 2400));
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [running, throttle, speed]);

  useEffect(() => {
    if (!running) return;

    if (segmentProgress >= 1) {
      setSegmentProgress((p) => p - 1);
      setTrainIndex((idx) => idx + 1);
    }
  }, [segmentProgress, running]);

  useEffect(() => {
    if (!running) return;

    if (trainIndex >= path.length - 1 && path.length > 1) {
      const delivered = Math.min(passengersWaiting, 20 + Math.floor(Math.random() * 45));
      const earned = delivered * 4;

      setRunning(false);
      setSpeed(0);
      setThrottle(0);
      setTrips((t) => t + 1);
      setScore((s) => s + delivered + 40);
      setMoney((m) => m + earned);
      setPassengersDelivered((d) => d + delivered);
      setPassengersWaiting(20 + Math.floor(Math.random() * 90));
      setStatus(`Trip complete! Delivered ${delivered} passengers and earned $${earned}.`);
    }
  }, [trainIndex, path, running, passengersWaiting]);

  function toggleTrack(r, c) {
    if (running) return;
    if ((r === START.r && c === START.c) || (r === END.r && c === END.c)) return;

    setTracks((old) => {
      const next = new Set(old);
      const key = id(r, c);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onRun() {
    const computed = findPath(tracks);
    if (computed.length < 2) {
      setStatus('No valid route. Connect Start to End with continuous tracks.');
      return;
    }

    setPath(computed);
    setTrainIndex(0);
    setSegmentProgress(0);
    setSpeed(0);
    setRunning(true);
    setThrottle((t) => (t < 20 ? 35 : t));
    setStatus('Train departed. You are now driving live.');
  }

  function onStop() {
    setRunning(false);
    setSpeed(0);
    setThrottle(0);
    setStatus('Train stopped at the nearest safe point.');
  }

  function onClear() {
    if (running) return;
    setTracks(new Set([id(START.r, START.c), id(END.r, END.c)]));
    setStatus('Track layout cleared. Build your own route.');
  }

  function onAuto() {
    if (running) return;
    setTracks(buildAutoTrack());
    setStatus('Auto route built. You can still customize it.');
  }

  function onBrake() {
    setSpeed((s) => s * 0.5);
    setThrottle((t) => Math.max(0, t - 30));
    setStatus('Brake engaged.');
  }

  function onHorn() {
    setStatus('HOOONK! Crossings and passengers react to your horn.');
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🚂 React Train Simulator</h1>
        <div className="badge">Interactive browser build-and-drive game</div>
      </div>

      <div className="layout">
        <div className="panel">
          {view === 'map' ? (
            <div className="map-grid">
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const r = Math.floor(i / COLS);
                const c = i % COLS;
                const key = id(r, c);
                const isStart = r === START.r && c === START.c;
                const isEnd = r === END.r && c === END.c;
                const isTrack = tracks.has(key);
                const hasTrain = trainCell && trainCell.r === r && trainCell.c === c;

                let cls = 'cell';
                if (isTrack) cls += ' track';
                if (isStart) cls += ' station-start';
                if (isEnd) cls += ' station-end';
                if (hasTrain) cls += ' train';

                return (
                  <div key={key} className={cls} onClick={() => toggleTrack(r, c)}>
                    <span className="icon">
                      {isStart ? 'S' : isEnd ? 'E' : hasTrain ? '🚆' : isTrack ? '═' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cab">
              <div
                className="signal"
                style={{ background: running ? '#22c55e' : '#f59e0b' }}
                title={running ? 'Signal Clear' : 'Signal Hold'}
              />
              <div className="hud">
                <div>Speed: {Math.round(speed)} km/h</div>
                <div>Throttle: {throttle}%</div>
                <div>Passengers waiting: {passengersWaiting}</div>
              </div>
            </div>
          )}

          <div className="mode-toggle">
            <button onClick={() => setView('map')} disabled={view === 'map'}>Map View</button>
            <button onClick={() => setView('cab')} disabled={view === 'cab'}>Cab View</button>
          </div>
        </div>

        <div className="panel controls">
          <h3>Drive Controls</h3>
          <label>Throttle</label>
          <input
            type="range"
            min="0"
            max="100"
            value={throttle}
            onChange={(e) => setThrottle(Number(e.target.value))}
          />

          <button onClick={onBrake}>Brake</button>
          <button onClick={onHorn}>Horn</button>

          <h3>Track Controls</h3>
          <button onClick={onRun} disabled={running}>Run Train</button>
          <button onClick={onStop} disabled={!running}>Stop Train</button>
          <button onClick={onAuto} disabled={running}>Auto Build Route</button>
          <button onClick={onClear} disabled={running}>Clear Tracks</button>

          <h3>Company Stats</h3>
          <div>Trips completed: {trips}</div>
          <div>Passengers delivered: {passengersDelivered}</div>
          <div>Money: ${money}</div>
          <div>Score: {score}</div>

          <div className="status">{status}</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
