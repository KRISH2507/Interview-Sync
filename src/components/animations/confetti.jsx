import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Confetti({ particleCount = 50, duration = 3000 }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            rotation: Math.random() * 360,
            color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][
                Math.floor(Math.random() * 5)
            ],
            delay: Math.random() * 0.5,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => {
            setParticles([]);
        }, duration);

        return () => clearTimeout(timer);
    }, [particleCount, duration]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute h-3 w-3 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: '-10px',
                        backgroundColor: particle.color,
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                        y: '110vh',
                        opacity: 0,
                        rotate: particle.rotation,
                    }}
                    transition={{
                        duration: 3,
                        delay: particle.delay,
                        ease: 'easeIn',
                    }}
                />
            ))}
        </div>
    );
}
