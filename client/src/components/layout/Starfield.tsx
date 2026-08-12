import React, { useEffect, useState } from 'react';

const Starfield = () => {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; duration: string }[]>([]);
  
  useEffect(() => {
    setStars(Array.from({ length: 150 }).map((_, i) => ({
      id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`, duration: `${Math.random() * 5 + 2}s`,
    })));
  }, []);
  
  return (
    <div className="starfield">
      {stars.map((star) => (
        <div key={star.id} className="star"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, '--duration': star.duration } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
export default Starfield;
