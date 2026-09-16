'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Hologram3DShowcase() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pickupCity, setPickupCity] = useState('Multan');
  const [dropoffCity, setDropoffCity] = useState('Karachi');
  const [weightTons, setWeightTons] = useState(25);
  const [estimatedRate, setEstimatedRate] = useState(185000);
  const [distanceKm, setDistanceKm] = useState(945);
  const [estimatedHours, setEstimatedHours] = useState(14.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0.4;
    let angleX = 0.2;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 420;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      angleY += dx * 0.008;
      angleX += dy * 0.008;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 15;
      const scale = Math.min(canvas.width, canvas.height) / 4.2;

      if (!isDragging) {
        angleY += 0.005;
      }

      const vertices = [
        { x: -1.2, y: -0.8, z: 0.8 },
        { x: -0.2, y: -0.8, z: 0.8 },
        { x: -0.2, y: 0.6, z: 0.8 },
        { x: -1.2, y: 0.6, z: 0.8 },
        { x: -1.2, y: -0.8, z: -0.8 },
        { x: -0.2, y: -0.8, z: -0.8 },
        { x: -0.2, y: 0.6, z: -0.8 },
        { x: -1.2, y: 0.6, z: -0.8 },
        { x: -0.1, y: -1.1, z: 0.9 },
        { x: 2.2, y: -1.1, z: 0.9 },
        { x: 2.2, y: 0.6, z: 0.9 },
        { x: -0.1, y: 0.6, z: 0.9 },
        { x: -0.1, y: -1.1, z: -0.9 },
        { x: 2.2, y: -1.1, z: -0.9 },
        { x: 2.2, y: 0.6, z: -0.9 },
        { x: -0.1, y: 0.6, z: -0.9 },
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
        [8, 9], [9, 10], [10, 11], [11, 8], [12, 13], [13, 14], [14, 15], [15, 12], [8, 12], [9, 13], [10, 14], [11, 15]
      ];

      function project(v: { x: number; y: number; z: number }) {
        let x1 = v.x * Math.cos(angleY) - v.z * Math.sin(angleY);
        let z1 = v.x * Math.sin(angleY) + v.z * Math.cos(angleY);
        let y2 = v.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = v.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        const distance = 4;
        const fov = scale / (distance + z2);
        return { x: cx + x1 * fov * 250, y: cy + y2 * fov * 250 };
      }

      const projected = vertices.map(project);

      // Background grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i += 0.5) {
        const p1 = project({ x: i, y: 0.7, z: -3 });
        const p2 = project({ x: i, y: 0.7, z: 3 });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 3D Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        const isCabin = i < 8 && j < 8;
        ctx.strokeStyle = isCabin ? '#10B981' : '#06B6D4';
        ctx.lineWidth = isCabin ? 2.5 : 2;
        ctx.shadowColor = isCabin ? '#10B981' : '#06B6D4';
        ctx.shadowBlur = 12;
        ctx.stroke();
      });

      // Nodes
      projected.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 || idx === 2 ? '#F59E0B' : '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 15;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    let basePrice = 185000;
    let dist = 945;
    let hours = 14.5;

    if (pickupCity === 'Lahore' && dropoffCity === 'Karachi') { basePrice = 210000; dist = 1210; hours = 18.5; }
    else if (pickupCity === 'Faisalabad' && dropoffCity === 'Karachi') { basePrice = 165000; dist = 1120; hours = 17.0; }
    else if (pickupCity === 'Peshawar' && dropoffCity === 'Karachi') { basePrice = 245000; dist = 1450; hours = 22.0; }
    else if (dropoffCity === 'Islamabad') { basePrice = 95000; dist = 540; hours = 7.5; }
    else if (pickupCity === dropoffCity) { basePrice = 45000; dist = 40; hours = 1.5; }

    const finalRate = Math.round(basePrice * (weightTons / 25));
    setEstimatedRate(finalRate);
    setDistanceKm(dist);
    setEstimatedHours(hours);
  }, [pickupCity, dropoffCity, weightTons]);

  const tranche1 = Math.round(estimatedRate * 0.3);
  const tranche2 = estimatedRate - tranche1;

  return (
    <section className="max-w-7xl mx-auto my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
      {/* 3D HOLOGRAM STAGE */}
      <div className="lg:col-span-7 glass-3d-card p-6 flex flex-col gap-4">
        <div className="truck-art-filigree mb-2"></div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Interactive 3D Telematics Stage</span>
            <h2 className="text-2xl font-extrabold text-white">Pakistani Master 22-Wheeler Trailer</h2>
          </div>
          <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            🇵🇰 Motive DRIVE Certified
          </span>
        </div>

        <div className="relative flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-[420px] cursor-grab"></canvas>

          <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur text-xs flex flex-col gap-1 shadow-xl">
            <span className="text-slate-400">Live GPS Coordinates</span>
            <span className="text-emerald-400 font-mono font-bold">30.1978° N, 71.4697° E</span>
            <span className="text-slate-400 text-[10px]">Multan Industrial Zone</span>
          </div>

          <div className="absolute top-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur text-xs flex flex-col gap-1 shadow-xl text-right">
            <span className="text-slate-400">Speed & Dynamics</span>
            <span className="text-cyan-400 font-mono font-bold">78 KM/H (Cruise)</span>
            <span className="text-emerald-400 text-[10px]">0 DTC Faults</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-2">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Motive Score</div>
            <div className="text-lg font-extrabold text-emerald-400">98/100</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Tire Pressure</div>
            <div className="text-lg font-extrabold text-cyan-400">115 PSI</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Fuel Level</div>
            <div className="text-lg font-extrabold text-amber-400">84% (420L)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Escrow Balance</div>
            <div className="text-lg font-extrabold text-indigo-400">100% Protected</div>
          </div>
        </div>
      </div>

      {/* 3D FREIGHT ESTIMATOR CALCULATOR */}
      <div className="lg:col-span-5 glass-3d-card p-6 flex flex-col gap-4">
        <div className="truck-art-filigree mb-2"></div>
        <h3 className="text-xl font-extrabold text-white">💰 3D Freight Estimator & Escrow</h3>
        <p className="text-xs text-slate-400">Instant motorway distance & tranche breakdown</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup City (پک اپ)</label>
            <select
              value={pickupCity}
              onChange={(e) => setPickupCity(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            >
              <option value="Multan">Multan (ملتان)</option>
              <option value="Lahore">Lahore (لاہور)</option>
              <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
              <option value="Peshawar">Peshawar (پشاور)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Destination City (ڈیلیوری)</label>
            <select
              value={dropoffCity}
              onChange={(e) => setDropoffCity(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            >
              <option value="Karachi">Karachi (کراچی)</option>
              <option value="Islamabad">Islamabad (اسلام آباد)</option>
              <option value="Lahore">Lahore (لاہور)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cargo Weight: <span className="text-emerald-400 font-bold">{weightTons} Tons</span>
            </label>
            <input
              type="range"
              min="5"
              max="45"
              value={weightTons}
              onChange={(e) => setWeightTons(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 text-center shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recommended Freight Budget</span>
            <div className="text-3xl font-black text-emerald-400 my-1">Rs. {estimatedRate.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Route: {distanceKm} KM • Motorway Route • Est: {estimatedHours} Hours</div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">30% Fuel Advance</div>
                <div className="font-bold text-white">Rs. {tranche1.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">70% Delivery Vault</div>
                <div className="font-bold text-emerald-400">Rs. {tranche2.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
