import React, { useEffect, useRef, useState } from 'react';
import './App.css';

// Real timetable: Day 1-5, each with periods and times
const periodTimes = [
  { period: 1, start: '08:45', end: '09:45' },
  { period: 2, start: '09:45', end: '10:45' },
  // Tea break (10:45 - 11:15)
  { period: 3, start: '11:15', end: '12:15' },
  { period: 4, start: '12:15', end: '13:15' },
  // Lunch break (13:15 - 14:15)
  { period: 5, start: '14:15', end: '15:15' },
  { period: 6, start: '15:15', end: '16:15' },
];

const timetable = [
  // Day 1
  [
    'Information Security',
    'High Speed Networks',
    'Advanced Wireless Technology',
    'Microwave and Optical Communication',
    'MW/OC LAB',
    'Microwave and Optical Communication Lab',
  ],
  // Day 2
  [
    'Advanced Wireless Technology',
    'Information Security',
    'Digital Image and Video Processing',
    'Microwave and Optical Communication',
    'Fundamentals of Network Security',
    'Information Security',
  ],
  // Day 3
  [
    'High Speed Networks',
    'Information Security',
    'Microwave and Optical Communication',
    'Information Security',
    'Fundamentals of Network Security',
    'Digital Image and Video Processing',
  ],
  // Day 4
  [
    'Digital Image and Video Processing',
    'Fundamentals of Network Security',
    'Microwave and Optical Communication',
    'Advanced Wireless Technology',
    'Fundamentals of Network Security',
    'High Speed Networks',
  ],
  // Day 5
  [
    'Advanced Wireless Technology',
    'High Speed Networks',
    'Digital Image and Video Processing',
    'Fundamentals of Network Security',
    'Microwave and Optical Communication',
    'Tutor Ward Meeting',
  ],
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getDayOrder(today: Date) {
  // Day 1 is today, so offset is 0
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diff % 5 + 5) % 5; // Always 0-4
}

function getCurrentPeriod(now: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const nowStr = pad(now.getHours()) + ':' + pad(now.getMinutes());
  for (let i = 0; i < periodTimes.length; i++) {
    if (nowStr >= periodTimes[i].start && nowStr < periodTimes[i].end) {
      return i;
    }
  }
  return null;
}

function getNextPeriodInfo(now: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < periodTimes.length; i++) {
    const [startH, startM] = periodTimes[i].start.split(":").map(Number);
    const [endH, endM] = periodTimes[i].end.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    if (nowMinutes >= startMin && nowMinutes < endMin) {
      // In this period
      const left = (endMin * 60) - (nowMinutes * 60 + now.getSeconds());
      return { type: 'in', period: i, left };
    }
    if (nowMinutes < startMin) {
      // Before this period
      const left = (startMin * 60) - (nowMinutes * 60 + now.getSeconds());
      return { type: 'before', period: i, left };
    }
  }
  return null;
}

function formatDate(date: Date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function to12Hour(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const starfieldRef = useRef<HTMLCanvasElement>(null);

  console.log('Rendering App');

  useEffect(() => {
    console.log('App mounted');
  }, []);

  useEffect(() => {
    setMounted(true);
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Starfield animation effect
  useEffect(() => {
    if (!mounted) return;
    console.log('Starfield effect running');
    const canvas = starfieldRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width;
    let height = canvas.height;
    let animationId: number;
    let stars: {x: number, y: number, z: number}[] = [];
    const numStars = 200;
    let speed = 2;
    let acceleration = 0.002;

    function resize() {
      if (!canvas) return;
      width = canvas.width = windowSize.width;
      height = canvas.height = windowSize.height;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          z: Math.random() * width
        });
      }
    }

    function draw() {
      if (!ctx) return;
      // Fade previous frame for visible trails
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, width, height);
      // Overlay a subtle space-like gradient
      ctx.save();
      ctx.globalAlpha = 0.25;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a23');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      ctx.save();
      ctx.translate(width / 2, height / 2);
      for (let i = 0; i < numStars; i++) {
        let star = stars[i];
        star.z -= speed;
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
        }
        const k = 128.0 / star.z;
        const sx = star.x * k;
        const sy = star.y * k;
        if (sx < -width/2 || sx > width/2 || sy < -height/2 || sy > height/2) continue;
        let size = (1 - star.z / width) * 2 + 0.5;
        size = Math.max(0.2, size); // Clamp to positive radius
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.8 * (1 - star.z / width) + 0.2;
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      speed += acceleration;
      animationId = requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [mounted, windowSize]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOrder = getDayOrder(now);
  const currentPeriodIdx = getCurrentPeriod(now);
  const periods = timetable[dayOrder];
  const nextPeriodInfo = getNextPeriodInfo(now);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {mounted && (
        <canvas
          ref={starfieldRef}
          width={windowSize.width}
          height={windowSize.height}
          className="fixed inset-0"
        />
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Date and Time Box */}
        <div className="w-full bg-[#0f1729]/80 rounded-2xl shadow-lg border border-white/5 backdrop-blur-sm mb-1">
          <div className="grid grid-cols-4 px-6 py-4">
            <div className="flex flex-col items-start">
              <div className="text-zinc-500 text-sm mb-1">Date</div>
              <div className="text-white text-lg font-medium">{formatDate(now)}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-sm mb-1">Day</div>
              <div className="text-white text-lg font-medium">{dayNames[now.getDay() - 1]}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-sm mb-1">Time</div>
              <div className="text-white text-lg font-medium">
                {now.toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                }).replace(/\s/g, '')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-zinc-500 text-sm mb-1 w-full">Day Order</div>
              <div className="text-white text-lg font-medium w-full">Day {dayOrder + 1}</div>
            </div>
          </div>
        </div>

        {/* Timer box */}
        {nextPeriodInfo && (
          <div className="w-full bg-white/5 rounded-xl shadow-lg p-1 text-center border border-white/10 backdrop-blur-md mb-3">
            {nextPeriodInfo.type === 'in' ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-zinc-400">Time left in this period:</span>
                <span className="text-2xl font-bold text-[#15ff98]">
                  {Math.floor(nextPeriodInfo.left / 60).toString().padStart(2, '0')}:{(nextPeriodInfo.left % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-zinc-400">Time left for next period:</span>
                <span className="text-2xl font-bold text-[#15ff98]">
                  {Math.floor(nextPeriodInfo.left / 60).toString().padStart(2, '0')}:{(nextPeriodInfo.left % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Current Period Box */}
        <div className="w-full mb-3">
          <div 
            className={`${
              currentPeriodIdx !== null 
                ? 'bg-[#0a192f] border border-cyan-900/30' 
                : 'bg-gray-900/50 border border-gray-800'
            } rounded-xl p-5 backdrop-blur-xl`}
          >
            <h2 className="text-lg font-bold mb-2 text-[#15ff98]">Current Period</h2>
            {currentPeriodIdx !== null ? (
              <>
                <div className="text-2xl font-semibold mb-3 text-white">{periods[currentPeriodIdx]}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="bg-[#15ff98]/10 text-[#15ff98] rounded px-3 py-1 font-medium">
                    Period {currentPeriodIdx + 1}
                  </span>
                  <span className="text-zinc-400">|</span>
                  <span className="text-zinc-300">{to12Hour(periodTimes[currentPeriodIdx].start)} - {to12Hour(periodTimes[currentPeriodIdx].end)}</span>
                </div>
              </>
            ) : (
              <p className="text-zinc-400">No active period</p>
            )}
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="w-full rounded-2xl shadow bg-white/10 border border-white/20 p-6 backdrop-blur-lg backdrop-saturate-150">
          <h3 className="text-lg font-semibold mb-4 text-white/90">Today's Timetable <span className="text-emerald-400">(Day {dayOrder + 1})</span></h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-zinc-800 text-zinc-200">
                  <th className="py-3 px-4 font-semibold">Period</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((subject, idx) => (
                  <tr
                    key={idx}
                    className={
                      (currentPeriodIdx === idx
                        ? "bg-emerald-900/40 text-emerald-200 font-bold shadow-inner"
                        : "bg-zinc-950/60 text-white/90 hover:bg-zinc-800/60 transition-colors") +
                      " border-b border-zinc-800"
                    }
                  >
                    <td className="py-3 px-4 text-center">{idx + 1}</td>
                    <td className="py-3 px-4 text-center">{to12Hour(periodTimes[idx].start)} - {to12Hour(periodTimes[idx].end)}</td>
                    <td className="py-3 px-4 text-left">{subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Day Orders */}
        <div className="w-full rounded-2xl shadow bg-white/10 border border-white/20 p-6 backdrop-blur-lg backdrop-saturate-150">
          <h3 className="text-lg font-semibold mb-4 text-white/90">All Day Orders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {timetable.map((day, idx) => (
              <div
                key={idx}
                className={
                  "rounded-xl border shadow p-4 h-full " +
                  (dayOrder === idx
                    ? "border-emerald-500 bg-emerald-900/20"
                    : "border-zinc-800 bg-zinc-950/60")
                }
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-emerald-400">Day {idx + 1}</span>
                  <span className="text-zinc-400 text-xs">({dayNames[idx]})</span>
                </div>
                <ul className="space-y-1">
                  {day.map((subject, pidx) => (
                    <li
                      key={pidx}
                      className={
                        "flex items-center gap-2 px-2 py-1 rounded " +
                        (dayOrder === idx && currentPeriodIdx === pidx
                          ? "bg-emerald-900/60 text-emerald-200 font-bold"
                          : "text-white/80 hover:bg-zinc-800/40 transition-colors")
                      }
                    >
                      <span className="inline-block w-5 text-zinc-400">{pidx + 1}.</span> {subject}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
