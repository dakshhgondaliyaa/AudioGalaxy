import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Planet = ({ position, size, color, speed, texture }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = t * speed * 0.2;
            // Orbit logic could go here, for now just rotation
            meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
            <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                />
            </Sphere>
            {/* Glow Halo */}
            <Sphere args={[size * 1.2, 32, 32]} position={position}>
                <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
            </Sphere>
        </Float>
    );
};

const GalaxyBackground = () => {
    return (
        <>
            <color attach="background" args={['#030014']} />

            {/* Background Stars - Deep space feeling */}
            <Stars radius={300} depth={60} count={10000} factor={4} saturation={1} fade speed={0.5} />

            {/* Ambient Light */}
            <ambientLight intensity={0.5} color="#4433ff" />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f3ff" />
            <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ff0055" />

            {/* Planets / Energy Orbs */}
            <Planet position={[-4, 2, -5]} size={1.2} color="#00f3ff" speed={0.5} />
            <Planet position={[5, -1, -8]} size={1.8} color="#7000ff" speed={0.3} />
            <Planet position={[0, -4, -10]} size={0.8} color="#ff0055" speed={0.8} />

            {/* Distant Fog/Nebula effect using simple fog for depth */}
            <fog attach="fog" args={['#030014', 10, 40]} />
        </>
    );
};

export default GalaxyBackground;
