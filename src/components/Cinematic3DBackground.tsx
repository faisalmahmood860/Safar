'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface DestinationHub {
  id: string;
  nameEn: string;
  code: string;
  x: number;
  y: number;
  z: number;
  color: string;
  completedLoads: number;
  status: string;
  connections: string[]; // IDs of connected hubs
  badgePos?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Cinematic3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.0003;
      targetMouseY = (e.clientY - height / 2) * 0.0003;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 3D Camera & Perspective Projection Setup
    const fov = 460;
    const cameraZ = -320;

    const project = (p: Point3D): { x: number; y: number; scale: number; cz: number } => {
      const cz = p.z - cameraZ;
      const scale = fov / Math.max(1, cz);
      const x = width / 2 + (p.x + mouseX * (p.z + 400)) * scale;
      const y = height / 2 + (p.y + mouseY * (p.z + 400)) * scale;
      return { x, y, scale, cz };
    };

    // --- PAKISTANI CITIES POSITIONED ON THE LOWER FLOOR GRID (SPIDER WEB NETWORK) ---
    const hubs: DestinationHub[] = [
      {
        id: 'gwd',
        nameEn: 'Gwadar Port',
        code: 'GWD',
        x: -1100,
        y: 460,
        z: 650,
        color: '#06B6D4',
        completedLoads: 680,
        status: 'CPEC Gateway',
        connections: ['qta', 'khi'],
        badgePos: 'bottom',
      },
      {
        id: 'qta',
        nameEn: 'Quetta Transit',
        code: 'QTA',
        x: -550,
        y: 440,
        z: 450,
        color: '#F59E0B',
        completedLoads: 540,
        status: 'Western Hub',
        connections: ['gwd', 'psh', 'fsd', 'skr'],
        badgePos: 'bottom',
      },
      {
        id: 'khi',
        nameEn: 'Karachi Port',
        code: 'KHI',
        x: -900,
        y: 430,
        z: 950,
        color: '#10B981',
        completedLoads: 1420,
        status: 'Sea Freight Port',
        connections: ['gwd', 'skr', 'mlt'],
        badgePos: 'top',
      },
      {
        id: 'skr',
        nameEn: 'Sukkur Hub',
        code: 'SKR',
        x: -450,
        y: 450,
        z: 1050,
        color: '#EC4899',
        completedLoads: 410,
        status: 'Indus Junction',
        connections: ['khi', 'qta', 'mlt'],
        badgePos: 'top',
      },
      {
        id: 'mlt',
        nameEn: 'Multan Logistics',
        code: 'MLT',
        x: -180,
        y: 430,
        z: 800,
        color: '#3B82F6',
        completedLoads: 950,
        status: 'Central Transit',
        connections: ['skr', 'fsd', 'lhr', 'khi'],
        badgePos: 'bottom',
      },
      {
        id: 'fsd',
        nameEn: 'Faisalabad Hub',
        code: 'FSD',
        x: 150,
        y: 440,
        z: 500,
        color: '#8B5CF6',
        completedLoads: 880,
        status: 'Textile Express',
        connections: ['mlt', 'lhr', 'isl', 'qta'],
        badgePos: 'bottom',
      },
      {
        id: 'lhr',
        nameEn: 'Lahore Dry Port',
        code: 'LHR',
        x: 400,
        y: 430,
        z: 850,
        color: '#10B981',
        completedLoads: 1850,
        status: 'Dry Port Hub',
        connections: ['mlt', 'fsd', 'isl', 'psh'],
        badgePos: 'top',
      },
      {
        id: 'isl',
        nameEn: 'Islamabad Hub',
        code: 'ISL',
        x: 650,
        y: 440,
        z: 450,
        color: '#F59E0B',
        completedLoads: 1120,
        status: 'Capital Terminal',
        connections: ['lhr', 'fsd', 'psh'],
        badgePos: 'right',
      },
      {
        id: 'psh',
        nameEn: 'Peshawar Gateway',
        code: 'PSH',
        x: 1050,
        y: 460,
        z: 650,
        color: '#EC4899',
        completedLoads: 730,
        status: 'Northern Hub',
        connections: ['isl', 'qta', 'lhr'],
        badgePos: 'right',
      },
    ];

    // Dynamic Ambient Dust Particles
    const particles: Array<{ x: number; y: number; z: number; size: number; speedZ: number }> = [];
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 1600,
        z: Math.random() * 1500,
        size: 1 + Math.random() * 2.5,
        speedZ: 0.4 + Math.random() * 1.2,
      });
    }

    // Dynamic Data Packet Pulses flowing along city connections
    interface PacketPulse {
      fromHubId: string;
      toHubId: string;
      progress: number;
      speed: number;
      color: string;
    }

    const pulses: PacketPulse[] = [];
    hubs.forEach((h1) => {
      h1.connections.forEach((targetId) => {
        pulses.push({
          fromHubId: h1.id,
          toHubId: targetId,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          color: h1.color,
        });
      });
    });

    // Main 60FPS Render Engine
    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Dark Space Radial Background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width * 0.95);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.55, '#0B1120');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Perspective Grid Floor
      const gridY = 440;
      const numGridLines = 36;
      const gridSpacing = 80;

      ctx.lineWidth = 1;
      for (let i = -numGridLines; i <= numGridLines; i++) {
        const p1 = project({ x: i * gridSpacing, y: gridY, z: 20 });
        const p2 = project({ x: i * gridSpacing * 2.8, y: gridY, z: 1500 });

        const alpha = Math.max(0, 0.25 - Math.abs(i) * 0.008);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Cross Grid Lines
      const timeOffset = (Date.now() * 0.045) % gridSpacing;
      for (let z = 20; z < 1500; z += gridSpacing) {
        const currentZ = z + timeOffset;
        const pLeft = project({ x: -2200, y: gridY, z: currentZ });
        const pRight = project({ x: 2200, y: gridY, z: currentZ });

        const fade = Math.max(0, 1 - currentZ / 1500);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.14 * fade})`;
        ctx.beginPath();
        ctx.moveTo(pLeft.x, pLeft.y);
        ctx.lineTo(pRight.x, pRight.y);
        ctx.stroke();
      }

      // 2. Draw Ambient Dust Star Particles
      particles.forEach((pt) => {
        pt.z -= pt.speedZ;
        if (pt.z <= 10) pt.z = 1500;

        const proj = project(pt);
        if (proj.scale > 0) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, proj.scale * 0.75)})`;
          ctx.fill();
        }
      });

      // 4. DRAW CITY CONNECTION LASER LINES (FREIGHT CORRIDORS)
      hubs.forEach((h1) => {
        h1.connections.forEach((targetId) => {
          const h2 = hubs.find((h) => h.id === targetId);
          if (!h2) return;

          const p1 = project({ x: h1.x, y: h1.y, z: h1.z });
          const p2 = project({ x: h2.x, y: h2.y, z: h2.z });

          if (p1.scale > 0 && p2.scale > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1.75;
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      });

      // 5. DRAW FREIGHT TELEMETRY DATA PULSES STREAMING BETWEEN CITIES
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) pulse.progress = 0;

        const h1 = hubs.find((h) => h.id === pulse.fromHubId);
        const h2 = hubs.find((h) => h.id === pulse.toHubId);
        if (!h1 || !h2) return;

        const p1 = project({ x: h1.x, y: h1.y, z: h1.z });
        const p2 = project({ x: h2.x, y: h2.y, z: h2.z });

        if (p1.scale > 0 && p2.scale > 0) {
          const px = p1.x + (p2.x - p1.x) * pulse.progress;
          const py = p1.y + (p2.y - p1.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.shadowColor = pulse.color;
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 6. DRAW HIGHLIGHTED PAKISTANI CITY HUB NODES & BADGES
      hubs.forEach((hub) => {
        const hp = project({ x: hub.x, y: hub.y, z: hub.z });
        if (hp.scale > 0) {
          // Radar Expanding Pulsing Rings
          const ringRadius = (16 + (Date.now() * 0.025) % 30) * hp.scale;
          const ringAlpha = Math.max(0, 1 - ringRadius / (48 * hp.scale));

          ctx.beginPath();
          ctx.arc(hp.x, hp.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = hub.color;
          ctx.globalAlpha = ringAlpha;
          ctx.lineWidth = 2 * hp.scale;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Glowing City Node Core
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 8.5 * hp.scale, 0, Math.PI * 2);
          ctx.fillStyle = hub.color;
          ctx.shadowColor = hub.color;
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner White Dot
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 3 * hp.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Holographic City Badge Card
          ctx.save();
          ctx.font = `bold ${Math.max(11, Math.round(13 * hp.scale))}px Inter, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = hub.color;
          ctx.shadowBlur = 10;

          let labelYOffset = -20 * hp.scale;
          let subYOffset = 24 * hp.scale;

          if (hub.badgePos === 'top') {
            ctx.textAlign = 'center';
            labelYOffset = -22 * hp.scale;
            subYOffset = -8 * hp.scale;
          } else if (hub.badgePos === 'bottom') {
            ctx.textAlign = 'center';
            labelYOffset = 20 * hp.scale;
            subYOffset = 34 * hp.scale;
          } else if (hub.badgePos === 'left') {
            ctx.textAlign = 'right';
            labelYOffset = -4 * hp.scale;
            subYOffset = 12 * hp.scale;
          } else if (hub.badgePos === 'right') {
            ctx.textAlign = 'left';
            labelYOffset = -4 * hp.scale;
            subYOffset = 12 * hp.scale;
          }

          const labelX = hub.badgePos === 'left' ? hp.x - 14 * hp.scale : hub.badgePos === 'right' ? hp.x + 14 * hp.scale : hp.x;

          // City Code & Name
          ctx.fillText(`🇵🇰 ${hub.code} • ${hub.nameEn}`, labelX, hp.y + labelYOffset);

          // Subtitle Badge
          ctx.font = `600 ${Math.max(9, Math.round(10 * hp.scale))}px Inter, sans-serif`;
          ctx.fillStyle = '#CBD5E1';
          ctx.fillText(`📦 ${hub.completedLoads} Completed Loads`, labelX, hp.y + subYOffset);
          ctx.restore();
        }
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
