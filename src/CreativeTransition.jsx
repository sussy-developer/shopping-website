import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CreativeTransition({ transitionTrigger, onMidpoint }) {
  const containerRef = useRef();
  const layer1Ref = useRef();
  const layer2Ref = useRef();
  const layer3Ref = useRef();
  const clickPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });

  // Globally track mouse down position in the capture phase
  // This ensures we always know exactly where the mouse was right before a navigation happens
  useEffect(() => {
    const handleMouse = (e) => {
      clickPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousedown', handleMouse, true);
    return () => window.removeEventListener('mousedown', handleMouse, true);
  }, []);

  // Store the latest callback in a ref to avoid triggering useEffect twice on parent re-renders
  const onMidpointRef = useRef(onMidpoint);
  useEffect(() => {
    onMidpointRef.current = onMidpoint;
  }, [onMidpoint]);

  useEffect(() => {
    if (!transitionTrigger) return;
    
    const { x, y } = clickPos.current;
    
    // Calculate the maximum radius needed to cover the entire screen from the click point
    const maxDistX = Math.max(x, window.innerWidth - x);
    const maxDistY = Math.max(y, window.innerHeight - y);
    const maxRadius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY) + 50;

    // Instantly collapse layers exactly to the click position without animation
    gsap.set([layer1Ref.current, layer2Ref.current, layer3Ref.current], {
      clipPath: `circle(0px at ${x}px ${y}px)`
    });

    // Block interaction during transition
    if (containerRef.current) containerRef.current.style.pointerEvents = 'auto';

    const tl = gsap.timeline({
      onComplete: () => {
        if (onMidpointRef.current) onMidpointRef.current();
        
        // Outward transition
        const tlOut = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) containerRef.current.style.pointerEvents = 'none';
          }
        });

        // Retract layers back to the origin, revealing the new page
        tlOut.to(layer3Ref.current, {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          duration: 0.6,
          ease: "power3.inOut"
        }, 0.1) // Deliberate hold time to mask the page rendering
        .to(layer2Ref.current, {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          duration: 0.5,
          ease: "power3.inOut"
        }, 0.15)
        .to(layer1Ref.current, {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          duration: 0.4,
          ease: "power3.inOut"
        }, 0.2);
      }
    });

    // Explosive staggered entry from the cursor point
    tl.to(layer1Ref.current, {
      clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
      duration: 0.5,
      ease: "power3.inOut"
    }, 0)
    .to(layer2Ref.current, {
      clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
      duration: 0.5,
      ease: "power3.inOut"
    }, 0.05)
    .to(layer3Ref.current, {
      clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
      duration: 0.5,
      ease: "power3.inOut"
    }, 0.1);

  }, [transitionTrigger]); // Removed onMidpoint to prevent double-firing

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100000] pointer-events-none">
      {/* Layer 1: Dark Glass */}
      <div ref={layer1Ref} className="absolute inset-0 bg-stone-900/20" style={{ clipPath: 'circle(0px at 50% 50%)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
      {/* Layer 2: Subtle Orange Glass Gradient */}
      <div ref={layer2Ref} className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 via-orange-200/20 to-amber-100/20" style={{ clipPath: 'circle(0px at 50% 50%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} />
      {/* Layer 3: Final Frosted Glass Overlay */}
      <div ref={layer3Ref} className="absolute inset-0 bg-white/10 border-[1px] border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)]" style={{ clipPath: 'circle(0px at 50% 50%)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }} />
    </div>
  );
}
