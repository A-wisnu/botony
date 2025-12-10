import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Leaf = ({ position, rotation, speed }) => {
    const mesh = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        mesh.current.position.y -= speed * 0.01;
        mesh.current.rotation.z += Math.sin(time * speed) * 0.005;
        mesh.current.rotation.x += Math.cos(time * speed) * 0.005;

        // Reset position when it goes below screen
        if (mesh.current.position.y < -10) {
            mesh.current.position.y = 10;
            mesh.current.position.x = (Math.random() - 0.5) * 20;
        }
    });

    return (
        <mesh ref={mesh} position={position} rotation={rotation}>
            <coneGeometry args={[0.2, 0.5, 3]} />
            {/* Simple geometry for now, would replace with leaf shape or gltf later */}
            <meshStandardMaterial color="#84A98C" transparent opacity={0.6} />
        </mesh>
    );
};

const ThreeBackground = () => {
    const count = 50;
    const leaves = useMemo(() => {
        return new Array(count).fill().map((_, i) => ({
            position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            speed: 0.5 + Math.random(),
        }));
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-botani-cream">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                {leaves.map((leaf, i) => (
                    <Leaf key={i} {...leaf} />
                ))}
                {/* Subtle fog for depth */}
                <fog attach="fog" args={['#FDFBF7', 5, 20]} />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
