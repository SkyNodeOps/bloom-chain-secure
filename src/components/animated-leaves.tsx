import { Leaf } from "lucide-react";

export const AnimatedLeaves = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-32 overflow-hidden pointer-events-none z-10">
      {/* Multiple leaves with different delays */}
      {[...Array(8)].map((_, i) => (
        <Leaf
          key={i}
          className="absolute text-primary/30 animate-leaf-fall"
          size={24 + (i % 3) * 8}
          style={{
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${8 + (i % 3) * 2}s`,
          }}
        />
      ))}
      
      {/* Ground leaves that float gently */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-end pb-4">
        {[...Array(6)].map((_, i) => (
          <Leaf
            key={`ground-${i}`}
            className="text-primary/20 animate-float mx-4"
            size={20}
            style={{
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};