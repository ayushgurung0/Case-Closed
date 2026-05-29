"use client";

import React, { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Menu,
} from "lucide-react";

const MODEL_URL = "/models/tshirt.glb";

const PRODUCTS = [
  {
    id: "monolith-tee",
    name: "Monolith Tee",
    price: 2490,
    category: "Tees",
    color: "Bone",
    colorHex: "#e8e6df",
    customizable: true,
    tagline: "Heavyweight 250 GSM. The blank that started it all.",
  },
  {
    id: "void-tee",
    name: "Void Tee",
    price: 2490,
    category: "Tees",
    color: "Onyx",
    colorHex: "#18181b",
    customizable: true,
    tagline: "Garment-dyed black that holds its depth.",
  },
  {
    id: "ash-tee",
    name: "Ash Tee",
    price: 2490,
    category: "Tees",
    color: "Ash",
    colorHex: "#71717a",
    customizable: true,
    tagline: "Pigment-dyed mid-grey with a vintage hand-feel.",
  },
  {
    id: "circuit-print",
    name: "Circuit · Pre-designed",
    price: 2890,
    category: "Drops",
    color: "Bone",
    colorHex: "#e8e6df",
    customizable: false,
    tagline: "From the inaugural run. Limited to 200 units.",
    presetDesign: { zone: "center-front", graphic: "circuit" },
  },
  {
    id: "glyph-print",
    name: "Glyph · Pre-designed",
    price: 2890,
    category: "Drops",
    color: "Onyx",
    colorHex: "#18181b",
    customizable: false,
    tagline: "Hand-screened on garment-dyed black.",
    presetDesign: { zone: "center-front", graphic: "glyph" },
  },
  {
    id: "wordmark-print",
    name: "Wordmark · Pre-designed",
    price: 2890,
    category: "Drops",
    color: "Bone",
    colorHex: "#e8e6df",
    customizable: false,
    tagline: "Bold typography. Pulled from the archive.",
    presetDesign: { zone: "center-front", graphic: "wordmark" },
  },
];

const ZONES = [
  { id: "left-chest", label: "Left chest", group: "Front", side: "front", u: 0.32, v: 0.72, size: 0.1 },
  { id: "right-chest", label: "Right chest", group: "Front", side: "front", u: 0.68, v: 0.72, size: 0.1 },
  { id: "center-front", label: "Center front", group: "Front", side: "front", u: 0.5, v: 0.5, size: 0.3 },
  { id: "left-shoulder", label: "Left shoulder", group: "Shoulders", side: "front", u: 0.18, v: 0.85, size: 0.08 },
  { id: "right-shoulder", label: "Right shoulder", group: "Shoulders", side: "front", u: 0.82, v: 0.85, size: 0.08 },
  { id: "back-neck", label: "Back neck", group: "Back", side: "back", u: 0.5, v: 0.88, size: 0.08 },
  { id: "center-back", label: "Center back", group: "Back", side: "back", u: 0.5, v: 0.5, size: 0.3 },
  { id: "bottom-hem", label: "Bottom hem", group: "Back", side: "back", u: 0.5, v: 0.15, size: 0.12 },
];

const GRAPHICS = [
  { id: "monolith", name: "Monolith", category: "Geometric" },
  { id: "circuit", name: "Circuit", category: "Geometric" },
  { id: "wordmark", name: "Käthe", category: "Typography" },
  { id: "glyph", name: "Glyph", category: "Geometric" },
  { id: "barcode", name: "Barcode", category: "Typography" },
  { id: "grid", name: "Grid", category: "Geometric" },
];

const COLORS = [
  { id: "bone", name: "Bone", hex: "#e8e6df" },
  { id: "onyx", name: "Onyx", hex: "#18181b" },
  { id: "ash", name: "Ash", hex: "#71717a" },
];

function drawGraphic(ctx, graphicId, cx, cy, ink, bgInk, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;

  if (graphicId === "monolith") {
    ctx.fillRect(-40, -70, 80, 140);
    ctx.fillStyle = bgInk;
    ctx.fillRect(-25, -55, 50, 6);
  } else if (graphicId === "circuit") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-55, 0); ctx.lineTo(-80, 0);
    ctx.moveTo(55, 0); ctx.lineTo(80, 0);
    ctx.moveTo(0, -55); ctx.lineTo(0, -80);
    ctx.moveTo(0, 55); ctx.lineTo(0, 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (graphicId === "wordmark") {
    ctx.font = "900 40px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("KÄTHE", 0, -5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-70, 20);
    ctx.lineTo(70, 20);
    ctx.stroke();
  } else if (graphicId === "glyph") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-55, 55);
    ctx.lineTo(0, -55);
    ctx.lineTo(55, 55);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 10, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (graphicId === "barcode") {
    const widths = [3, 5, 3, 8, 3, 4, 7, 3, 5, 4, 3, 8, 4, 3];
    let x = -65;
    widths.forEach((w, i) => {
      if (i % 2 === 0) ctx.fillRect(x, -40, w, 80);
      x += w + 4;
    });
    ctx.font = "600 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0 250 GSM 26", 0, 55);
  } else if (graphicId === "grid") {
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 15, -50);
      ctx.lineTo(i * 15, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-50, i * 15);
      ctx.lineTo(50, i * 15);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function makeShirtTexture(baseColor, design) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 2048, 2048);

  const isDark = baseColor === "#18181b" || baseColor === "#71717a";

  // subtle fabric noise
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)";
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 2048;
    ctx.fillRect(x, y, 1, 1);
  }

  if (design?.graphic && design?.zone) {
    const zone = ZONES.find((z) => z.id === design.zone);
    if (zone) {
      const ink = isDark ? "#fafafa" : "#0a0a0a";
      const bgInk = isDark ? "#0a0a0a" : "#fafafa";
      const cx = zone.u * 2048;
      const cy = (1 - zone.v) * 2048;
      const scale = zone.size * 12;
      drawGraphic(ctx, design.graphic, cx, cy, ink, bgInk, scale);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false; // GLTF convention
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function ShirtModel({ color, design, autoRotate }) {
  const groupRef = useRef();
  const { scene } = useGLTF(MODEL_URL);

  // Clone the scene so multiple instances on the page don't share state
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const texture = useMemo(() => makeShirtTexture(color, design), [color, design?.graphic, design?.zone]);

  // Apply material to all meshes in the model
  useEffect(() => {
    let logged = false;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (!logged && typeof window !== "undefined") {
          // one-time debug log so we can see what we're working with
          const box = new THREE.Box3().setFromObject(clonedScene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          console.log("[Käthe] Model loaded:", {
            meshName: child.name,
            materialName: child.material?.name,
            size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
            center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) },
          });
          logged = true;
        }

        // Replace material with one that uses our texture
        const newMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.85,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
        child.material = newMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, texture]);

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#27272a" transparent opacity={0} />
    </mesh>
  );
}

function Studio3D({ color, design, autoRotate }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 2.5], fov: 35 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 4, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <directionalLight position={[0, -2, 3]} intensity={0.25} />
      <Suspense fallback={<LoadingFallback />}>
        <ShirtModel color={color} design={design} autoRotate={autoRotate} />
        <ContactShadows
          position={[0, -0.65, 0]}
          opacity={0.4}
          scale={3}
          blur={2.5}
          far={2}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}

function GraphicSwatch({ id, size = 56, dark = false }) {
  const ink = dark ? "#fafafa" : "#0a0a0a";
  const stroke = { stroke: ink, strokeWidth: 2.5, fill: "none" };
  const fill = { fill: ink };
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size}>
      {id === "monolith" && (
        <>
          <rect x="-18" y="-32" width="36" height="64" {...fill} />
          <rect x="-12" y="-26" width="24" height="3" fill={dark ? "#0a0a0a" : "#fafafa"} />
        </>
      )}
      {id === "circuit" && (
        <>
          <circle cx="0" cy="0" r="22" {...stroke} />
          <circle cx="0" cy="0" r="11" {...stroke} />
          <line x1="-22" y1="0" x2="-32" y2="0" {...stroke} />
          <line x1="22" y1="0" x2="32" y2="0" {...stroke} />
          <line x1="0" y1="-22" x2="0" y2="-32" {...stroke} />
          <line x1="0" y1="22" x2="0" y2="32" {...stroke} />
          <circle cx="0" cy="0" r="3" {...fill} />
        </>
      )}
      {id === "wordmark" && (
        <>
          <text x="0" y="2" textAnchor="middle" fontFamily="Inter" fontSize="16" fontWeight="900" letterSpacing="1" fill={ink}>
            KÄTHE
          </text>
          <line x1="-30" y1="10" x2="30" y2="10" {...stroke} />
        </>
      )}
      {id === "glyph" && (
        <>
          <path d="M -22 22 L 0 -22 L 22 22 Z" {...stroke} />
          <circle cx="0" cy="4" r="5" {...fill} />
        </>
      )}
      {id === "barcode" && (
        <>
          {[0, 4, 7, 12, 15, 19, 23, 27].map((x, i) => (
            <rect key={i} x={x - 18} y="-20" width={i % 2 === 0 ? 2 : 1} height="40" {...fill} />
          ))}
        </>
      )}
      {id === "grid" && (
        <>
          {[-12, -4, 4, 12].map((v) => (
            <React.Fragment key={v}>
              <line x1={v} y1="-20" x2={v} y2="20" {...stroke} strokeWidth="1.5" />
              <line x1="-20" y1={v} x2="20" y2={v} {...stroke} strokeWidth="1.5" />
            </React.Fragment>
          ))}
        </>
      )}
    </svg>
  );
}

function Nav({ onNav, cartCount, current }) {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <button onClick={() => onNav("home")} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-sm bg-zinc-50 flex items-center justify-center group-hover:bg-white transition">
            <div className="w-3 h-3 bg-zinc-950" />
          </div>
          <span className="font-black tracking-[0.22em] text-sm uppercase">Käthe</span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] uppercase">
          <button
            onClick={() => onNav("home")}
            className={`transition ${current === "home" ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-200"}`}
          >
            Store
          </button>
          <button
            onClick={() => onNav("studio")}
            className={`flex items-center gap-1.5 transition ${current === "studio" ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-200"}`}
          >
            <Sparkles className="w-3 h-3" strokeWidth={2} />
            Studio
          </button>
          <button className="text-zinc-500 hover:text-zinc-200 transition">Journal</button>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-zinc-900 rounded-md transition hidden md:block">
            <Search className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button className="relative p-2 hover:bg-zinc-900 rounded-md transition">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-zinc-50 text-zinc-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="p-2 hover:bg-zinc-900 rounded-md transition md:hidden">
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomePage({ onNav, onProduct }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Tees", "Drops"];
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-16 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-5">
                Mass customization · 2026
              </p>
              <h1 className="font-black uppercase tracking-tight text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.92] mb-6">
                Wear what<br />
                <span className="text-zinc-500">no one else</span><br />
                can.
              </h1>
              <p className="text-zinc-400 max-w-md leading-relaxed mb-8">
                Premium blanks, hand-screened in Kathmandu. Or step into the studio
                and configure your own — every neckline, every panel, every placement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNav("studio")}
                  className="group bg-zinc-50 text-zinc-950 font-black uppercase tracking-[0.2em] text-sm px-8 py-4 rounded-md hover:bg-white transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                  Open studio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => document.getElementById("store-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="border border-zinc-800 hover:border-zinc-600 text-zinc-100 font-black uppercase tracking-[0.2em] text-sm px-8 py-4 rounded-md transition"
                >
                  Shop drops
                </button>
              </div>
            </div>

            <div className="relative aspect-square bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #fafafa 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
              <Studio3D
                color="#e8e6df"
                design={{ zone: "center-front", graphic: "wordmark" }}
                autoRotate={true}
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500">
                  Live preview
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500">
                  Drag to rotate
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="store-grid" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-2">The store</p>
            <h2 className="font-black uppercase tracking-tight text-3xl md:text-5xl">
              Ready to wear.
            </h2>
          </div>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-md">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 text-xs tracking-[0.2em] uppercase rounded transition ${
                  filter === c
                    ? "bg-zinc-50 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} onClick={() => onProduct(p.id)} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-3">The studio</p>
              <h2 className="font-black uppercase tracking-tight text-4xl md:text-6xl mb-6 leading-[0.95]">
                Eight zones.<br />
                Six graphics.<br />
                <span className="text-zinc-500">One of one.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8 max-w-md">
                Rotate the model. Pick a zone — left chest, back neck, hem.
                Drop a graphic. See it render in real time.
              </p>
              <button
                onClick={() => onNav("studio")}
                className="group bg-zinc-50 text-zinc-950 font-black uppercase tracking-[0.2em] text-sm px-8 py-4 rounded-md hover:bg-white transition inline-flex items-center gap-2"
              >
                Start configuring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" strokeWidth={2.5} />
              </button>
            </div>

            <div className="aspect-[5/4] bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <Studio3D
                color="#18181b"
                design={{ zone: "center-front", graphic: "circuit" }}
                autoRotate={true}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onClick}
      className="group text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition"
    >
      <div className="aspect-square bg-zinc-950/40 relative overflow-hidden">
        <Studio3D
          color={product.colorHex}
          design={product.presetDesign || null}
          autoRotate={false}
        />
        {product.customizable && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-50/95 text-zinc-950 px-2.5 py-1 rounded text-[10px] tracking-[0.2em] uppercase font-bold z-10">
            <Sparkles className="w-3 h-3" strokeWidth={2.5} />
            Custom
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <h3 className="font-black uppercase tracking-wider text-sm">{product.name}</h3>
          <span className="text-sm font-bold">रू {product.price.toLocaleString()}</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{product.tagline}</p>
      </div>
    </motion.button>
  );
}

function SectionLabel({ children }) {
  return (
    <h3 className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 font-medium mb-3">
      {children}
    </h3>
  );
}

function StudioPage({ onNav, onAddToCart, initialColor }) {
  const [color, setColor] = useState(initialColor || "#e8e6df");
  const [zone, setZone] = useState("center-front");
  const [graphic, setGraphic] = useState("wordmark");
  const [autoRotate, setAutoRotate] = useState(false);
  const [added, setAdded] = useState(false);

  const groupedZones = ZONES.reduce((acc, z) => {
    (acc[z.group] ||= []).push(z);
    return acc;
  }, {});

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleReset = () => {
    setColor("#e8e6df");
    setZone("center-front");
    setGraphic("wordmark");
  };

  return (
    <div>
      <div className="border-b border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <button
            onClick={() => onNav("home")}
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back to store
          </button>
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-zinc-50" strokeWidth={2.5} />
            <span className="font-bold">Studio</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10">
          <div className="space-y-4">
            <div className="relative aspect-square lg:aspect-[4/4.2] bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #fafafa 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
              <Studio3D color={color} design={{ zone, graphic }} autoRotate={autoRotate} />

              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md px-3 py-1.5">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400">
                    Drag · scroll to zoom
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-2 rounded-md border backdrop-blur transition ${
                    autoRotate
                      ? "bg-zinc-50 text-zinc-950 border-zinc-50"
                      : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-600 text-zinc-100"
                  }`}
                  title="Auto-rotate"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
                <div className="bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md px-3 py-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">Zone</p>
                  <p className="text-xs font-bold tracking-wider mt-0.5">
                    {ZONES.find((z) => z.id === zone)?.label}
                  </p>
                </div>
                <div className="bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md px-3 py-2 text-right">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">Graphic</p>
                  <p className="text-xs font-bold tracking-wider mt-0.5">
                    {GRAPHICS.find((g) => g.id === graphic)?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-7">
            <section>
              <SectionLabel>01 · Base color</SectionLabel>
              <div className="grid grid-cols-3 gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.hex)}
                    className={`p-3 rounded-lg border transition ${
                      color === c.hex
                        ? "border-zinc-50 bg-zinc-800/40"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded mb-2 border border-zinc-700"
                      style={{ background: c.hex }}
                    />
                    <span className="text-[10px] tracking-[0.2em] uppercase block">{c.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>02 · Placement zone</SectionLabel>
              <div className="space-y-4">
                {Object.entries(groupedZones).map(([group, zonesInGroup]) => (
                  <div key={group}>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 mb-2">
                      {group}
                      {group === "Back" && (
                        <span className="ml-2 text-zinc-700">(rotate model to view)</span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {zonesInGroup.map((z) => (
                        <button
                          key={z.id}
                          onClick={() => setZone(z.id)}
                          className={`px-3 py-2.5 text-xs tracking-wide rounded-md border transition text-left ${
                            zone === z.id
                              ? "border-zinc-50 bg-zinc-800/50 text-zinc-50"
                              : "border-zinc-800 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {z.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>03 · Graphic</SectionLabel>
              <div className="grid grid-cols-3 gap-2.5">
                {GRAPHICS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGraphic(g.id)}
                    className={`relative aspect-square flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition ${
                      graphic === g.id
                        ? "border-zinc-50 bg-zinc-800/40"
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                    }`}
                  >
                    <GraphicSwatch id={g.id} size={44} dark={true} />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-zinc-400">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="border-t border-zinc-900 pt-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.25em] uppercase text-zinc-500">
                  Configured total
                </span>
                <div className="text-right">
                  <div className="font-black text-2xl">रू 2,890</div>
                  <div className="text-[10px] tracking-widest uppercase text-zinc-500 mt-0.5">
                    Ships in 7–10 days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="bg-zinc-50 text-zinc-950 font-black uppercase tracking-[0.2em] text-sm py-4 rounded-md hover:bg-white transition relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" strokeWidth={3} /> Added
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        Add to collection
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <button
                  onClick={handleReset}
                  className="border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100 px-4 rounded-md transition"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPage({ productId, onNav, onStudio, onAddToCart }) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState("M");

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <div className="border-b border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
          <button
            onClick={() => onNav("home")}
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} /> All products
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16">
          <div className="aspect-square bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <Studio3D
              color={product.colorHex}
              design={product.presetDesign || null}
              autoRotate={false}
            />
          </div>

          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-3">
              {product.category} · {product.color}
            </p>
            <h1 className="font-black uppercase tracking-tight text-4xl md:text-5xl mb-4 leading-[0.95]">
              {product.name}
            </h1>
            <p className="text-zinc-400 leading-relaxed mb-8">{product.tagline}</p>

            <div className="text-3xl font-black mb-8">रू {product.price.toLocaleString()}</div>

            <div className="mb-8">
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-3">Size</p>
              <div className="grid grid-cols-5 gap-2">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3 text-sm font-bold tracking-wider border rounded-md transition ${
                      size === s
                        ? "border-zinc-50 bg-zinc-50 text-zinc-950"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="w-full bg-zinc-50 text-zinc-950 font-black uppercase tracking-[0.2em] text-sm py-4 rounded-md hover:bg-white transition"
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} /> Added to cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                    >
                      Add to cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {product.customizable && (
                <button
                  onClick={() => onStudio(product.colorHex)}
                  className="w-full border border-zinc-800 hover:border-zinc-50 hover:bg-zinc-900 text-zinc-100 font-black uppercase tracking-[0.2em] text-sm py-4 rounded-md transition flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                  Customize this blank
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="border-t border-zinc-900 pt-6 space-y-3 text-sm">
              {[
                ["Weight", "250 GSM combed cotton"],
                ["Construction", "Single jersey, tubular knit"],
                ["Finish", "Bio-washed, pre-shrunk"],
                ["Origin", "Kathmandu, Nepal"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-900/60 pb-3">
                  <span className="text-zinc-500 tracking-wide uppercase text-xs">{k}</span>
                  <span className="text-zinc-100 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [productId, setProductId] = useState(null);
  const [studioStartColor, setStudioStartColor] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const handleNav = (target) => {
    setPage(target);
    if (target === "home") setStudioStartColor(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProduct = (id) => {
    setProductId(id);
    setPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStudio = (color) => {
    setStudioStartColor(color);
    setPage("studio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      <Nav onNav={handleNav} cartCount={cartCount} current={page} />
      <AnimatePresence mode="wait">
        <motion.div
          key={page + (productId || "")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {page === "home" && <HomePage onNav={handleNav} onProduct={handleProduct} />}
          {page === "studio" && (
            <StudioPage
              onNav={handleNav}
              onAddToCart={() => setCartCount((c) => c + 1)}
              initialColor={studioStartColor}
            />
          )}
          {page === "product" && (
            <ProductPage
              productId={productId}
              onNav={handleNav}
              onStudio={handleStudio}
              onAddToCart={() => setCartCount((c) => c + 1)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <footer className="border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600">
            Käthe · Made in Nepal · MMXXVI
          </p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600">
            3D model by{" "}
            <a
              href="https://sketchfab.com/kylelhb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition underline"
            >
              kylelhb
            </a>{" "}
            · CC-BY 4.0
          </p>
        </div>
      </footer>
    </div>
  );
}
