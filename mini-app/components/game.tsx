"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Game() {
  const [gameState, setGameState] = useState<
    "notStarted" | "running" | "finished"
  >("notStarted");
  const [currentNumber, setCurrentNumber] = useState(1);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [grid, setGrid] = useState<number[]>(shuffleArray());
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function shuffleArray(): number[] {
    const arr = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const startTimer = () => {
    const start = Date.now();
    intervalRef.current = window.setInterval(() => {
      setElapsed(Date.now() - start);
    }, 10);
  };

  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (gameState === "finished") {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameState]);

  const handleClick = (num: number) => {
    if (gameState !== "running") return;
    if (num !== currentNumber) return;
    if (num === 1) {
      startTimer();
    }
    setTapped((prev) => new Set(prev).add(num));
    if (currentNumber === 25) {
      stopTimer();
      setGameState("finished");
    } else {
      setCurrentNumber((c) => c + 1);
      setGrid(shuffleArray());
    }
  };

  const restart = () => {
    setGameState("notStarted");
    setCurrentNumber(1);
    setTapped(new Set());
    setGrid(shuffleArray());
    setElapsed(0);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-2xl font-semibold">{formatTime(elapsed)}</div>
      {gameState === "finished" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl">Completed in {formatTime(elapsed)}</div>
          <Button onClick={restart}>Restart</Button>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-5 gap-2",
            gameState === "notStarted" && "pointer-events-none opacity-50"
          )}
        >
          {grid.map((num) => (
            <Button
              key={num}
              variant="outline"
              size="lg"
              className="h-20 w-20 text-2xl"
              disabled={tapped.has(num)}
              onClick={() => handleClick(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      )}
      {gameState === "notStarted" && (
        <Button onClick={() => setGameState("running")}>Start Game</Button>
      )}
    </div>
  );
}
