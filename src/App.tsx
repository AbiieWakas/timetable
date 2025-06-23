import React, { useEffect, useRef } from 'react';
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

// Date-to-day-order mapping (YYYY-MM-DD: 0-based day order index)
const dayOrderMap: Record<string, number | null> = {
  // June 2025
  '2025-06-23': 0, '2025-06-24': 1, '2025-06-25': 2, '2025-06-26': 3, '2025-06-27': 4, '2025-06-28': 0, '2025-06-30': 1,
  // July 2025
  '2025-07-01': 2, '2025-07-02': 3, '2025-07-03': 4, '2025-07-08': 0, '2025-07-09': 1, '2025-07-10': 2, '2025-07-11': 3, '2025-07-12': 4, '2025-07-14': 0, '2025-07-15': 1, '2025-07-16': 2, '2025-07-17': 3, '2025-07-18': 4, '2025-07-21': 0, '2025-07-22': 1, '2025-07-23': 2, '2025-07-24': 3, '2025-07-25': 4, '2025-07-26': 0, '2025-07-28': 1, '2025-07-29': 2, '2025-07-30': 3, '2025-07-31': 4,
  // August 2025
  '2025-08-01': 0, '2025-08-04': 1, '2025-08-05': 2, '2025-08-06': 3, '2025-08-07': 4, '2025-08-08': 0, '2025-08-09': 1, '2025-08-11': 2, '2025-08-12': 3, '2025-08-13': 4, '2025-08-18': 0, '2025-08-19': 1, '2025-08-20': 2, '2025-08-21': 3, '2025-08-22': 4, '2025-08-23': 0, '2025-08-25': 1, '2025-08-26': 2, '2025-08-28': 3, '2025-08-29': 4, '2025-08-30': 0,
  // September 2025
  '2025-09-01': 1, '2025-09-02': 2, '2025-09-03': 3, '2025-09-08': 4, '2025-09-09': 0, '2025-09-10': 1, '2025-09-11': 2, '2025-09-12': 3, '2025-09-13': 4, '2025-09-15': 0, '2025-09-16': 1, '2025-09-17': 2, '2025-09-18': 3, '2025-09-19': 4, '2025-09-22': 0, '2025-09-23': 1, '2025-09-24': 2, '2025-09-25': 3, '2025-09-26': 4, '2025-09-27': 0, '2025-09-29': 1, '2025-09-30': 2,
  // October 2025
  '2025-10-06': 3, '2025-10-07': 4, '2025-10-08': 0, '2025-10-09': 1, '2025-10-10': 2, '2025-10-11': 3, '2025-10-13': 4, '2025-10-14': 0, '2025-10-15': 1, '2025-10-16': 2, '2025-10-17': 3,
};

function getDayOrderFromMap(date: Date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  return dayOrderMap[key]; // 0-based index or undefined/null
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
  const [mounted, setMounted] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({ width: 800, height: 600 });
  const starfieldRef = React.useRef<HTMLCanvasElement>(null);

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

  // Real-time date and time
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOrder = getDayOrderFromMap(now);
  const currentPeriodIdx = dayOrder !== undefined && dayOrder !== null ? getCurrentPeriod(now) : null;
  const periods = dayOrder !== undefined && dayOrder !== null ? timetable[dayOrder] : [];
  const nextPeriodInfo = dayOrder !== undefined && dayOrder !== null ? getNextPeriodInfo(now) : null;

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

      <div className="relative z-10 max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Date and Time Box */}
        <div className="w-full bg-[#0f1729]/80 rounded-2xl shadow-lg border border-white/5 backdrop-blur-sm mb-1">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-y-3 sm:gap-y-0 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col items-center sm:items-start">
              <div className="text-zinc-500 text-xs sm:text-sm mb-1">Date</div>
              <div className="text-white text-base sm:text-lg font-medium">{formatDate(now)}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-xs sm:text-sm mb-1">Day</div>
              <div className="text-white text-base sm:text-lg font-medium">{dayNames[now.getDay() - 1]}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 text-xs sm:text-sm mb-1">Time</div>
              <div className="text-white text-base sm:text-lg font-medium whitespace-nowrap px-2">
                {now.toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                }).replace(/\s/g, '')}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-zinc-500 text-xs sm:text-sm mb-1 w-full">Day Order</div>
              <div className="text-white text-base sm:text-lg font-medium w-full">Day {dayOrder !== undefined && dayOrder !== null ? dayOrder + 1 : 'No Timetable Today'}</div>
            </div>
          </div>
        </div>

        {/* Timer box */}
        {nextPeriodInfo && (
          <div className="w-full bg-white/5 rounded-xl shadow-lg p-1 text-center border border-white/10 backdrop-blur-md mb-3">
            {nextPeriodInfo.type === 'in' ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="text-zinc-400 text-xs sm:text-base">Time left in this period:</span>
                <span className="text-xl sm:text-2xl font-bold text-[#15ff98]">
                  {Math.floor(nextPeriodInfo.left / 60).toString().padStart(2, '0')}:{(nextPeriodInfo.left % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="text-zinc-400 text-xs sm:text-base">Time left for next period:</span>
                <span className="text-xl sm:text-2xl font-bold text-[#15ff98]">
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
                ? 'bg-white/20 dark:bg-[#0a192f]/60 border-2 border-[#15ff98]/40 shadow-[0_0_20px_rgba(21,255,152,0.25)] ring-2 ring-[#15ff98]/30 backdrop-blur-2xl' 
                : 'bg-gray-900/50 border border-gray-800'
            } rounded-xl p-3 sm:p-5 transition-all duration-300`}
          >
            <h2 className="text-base sm:text-lg font-bold mb-2 text-[#15ff98]">Current Period</h2>
            {currentPeriodIdx !== null ? (
              <>
                <div className="text-lg sm:text-2xl font-semibold mb-3 text-white">{periods[currentPeriodIdx]}</div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm">
                  <span className="bg-[#15ff98]/10 text-[#15ff98] rounded px-2 sm:px-3 py-1 font-medium">
                    Period {currentPeriodIdx + 1}
                  </span>
                  <span className="text-zinc-400 hidden sm:inline">|</span>
                  <span className="text-zinc-300">{to12Hour(periodTimes[currentPeriodIdx].start)} - {to12Hour(periodTimes[currentPeriodIdx].end)}</span>
                </div>
              </>
            ) : (
              <p className="text-zinc-400 text-xs sm:text-base">No active period</p>
            )}
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="w-full rounded-2xl shadow bg-white/10 border border-white/20 p-3 sm:p-6 backdrop-blur-lg backdrop-saturate-150">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-white/90">Today's Timetable <span className="text-emerald-400">(Day {dayOrder !== undefined && dayOrder !== null ? dayOrder + 1 : 'No Timetable Today'}</span></h3>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="min-w-full text-xs sm:text-sm rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-zinc-800 text-zinc-200">
                  <th className="py-2 sm:py-3 px-3 sm:px-4 font-semibold w-12 sm:w-auto">Period</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 font-semibold w-32 sm:w-auto">Time</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 font-semibold">Subject</th>
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
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-center">{idx + 1}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-center whitespace-nowrap">{to12Hour(periodTimes[idx].start)} - {to12Hour(periodTimes[idx].end)}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-left">{subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Day Orders */}
        <div className="w-full rounded-2xl shadow bg-white/10 border border-white/20 p-3 sm:p-6 backdrop-blur-lg backdrop-saturate-150 mt-4 sm:mt-5">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-white/90">All Day Orders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {timetable.map((day, idx) => (
              <div
                key={idx}
                className={
                  "rounded-xl border shadow p-3 sm:p-4 h-full " +
                  (dayOrder === idx
                    ? "border-emerald-500 bg-emerald-900/20"
                    : "border-zinc-800 bg-zinc-950/60")
                }
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 sm:mb-2 gap-1 sm:gap-0">
                  <span className="font-semibold text-emerald-400">Day {idx + 1}</span>
                  <span className="text-zinc-400 text-xs">({dayNames[idx]})</span>
                </div>
                <ul className="space-y-1">
                  {day.map((subject, pidx) => (
                    <li
                      key={pidx}
                      className={
                        "flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 rounded " +
                        (dayOrder === idx && currentPeriodIdx === pidx
                          ? "bg-emerald-900/60 text-emerald-200 font-bold"
                          : "text-white/80 hover:bg-zinc-800/40 transition-colors")
                      }
                    >
                      <span className="inline-block w-4 sm:w-5 text-zinc-400">{pidx + 1}.</span> {subject}
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
