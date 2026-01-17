"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

type MoodLevel = "low" | "medium" | "high"

interface MoodAvatarProps {
  riskLevel: MoodLevel
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MoodAvatar({ riskLevel, size = "md", className }: MoodAvatarProps) {
  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 160,
  }

  const avatarSize = sizeMap[size]

  const animationConfig = useMemo(() => {
    switch (riskLevel) {
      case "low":
        return {
          y: [0, -8, 0],
          scale: [1, 1.02, 1],
          duration: 3,
          expression: "happy",
        }
      case "medium":
        return {
          y: [0, -3, 0],
          scale: [1, 1.005, 1],
          duration: 4,
          expression: "neutral",
        }
      case "high":
        return {
          y: [0, -5, 2, -3, 0],
          x: [-1, 1, -1, 1, 0],
          scale: [1, 1.01, 0.99, 1.01, 1],
          duration: 1.5,
          expression: "stressed",
        }
    }
  }, [riskLevel])

  const eyeExpression = useMemo(() => {
    switch (animationConfig.expression) {
      case "happy":
        return { eyeY: 0, mouthCurve: 8 }
      case "neutral":
        return { eyeY: 0, mouthCurve: 0 }
      case "stressed":
        return { eyeY: -2, mouthCurve: -5 }
    }
  }, [animationConfig.expression])

  return (
    <motion.div
      className={className}
      animate={{
        y: animationConfig.y,
        x: animationConfig.x || 0,
        scale: animationConfig.scale,
      }}
      transition={{
        duration: animationConfig.duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <svg width={avatarSize} height={avatarSize} viewBox="0 0 100 100" className="drop-shadow-lg">
        {/* Head - Main circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          className="fill-muted stroke-border"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Inner gradient circle */}
        <circle cx="50" cy="50" r="35" className="fill-card" opacity="0.5" />

        {/* Left eye */}
        <motion.ellipse
          cx="38"
          cy={45 + eyeExpression.eyeY}
          rx="4"
          ry={riskLevel === "happy" ? "3" : "4"}
          className="fill-foreground"
          animate={{
            scaleY: riskLevel === "high" ? [1, 0.6, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: riskLevel === "high" ? Number.POSITIVE_INFINITY : 0,
            repeatDelay: 2,
          }}
        />

        {/* Right eye */}
        <motion.ellipse
          cx="62"
          cy={45 + eyeExpression.eyeY}
          rx="4"
          ry={riskLevel === "happy" ? "3" : "4"}
          className="fill-foreground"
          animate={{
            scaleY: riskLevel === "high" ? [1, 0.6, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: riskLevel === "high" ? Number.POSITIVE_INFINITY : 0,
            repeatDelay: 2,
          }}
        />

        {/* Mouth */}
        <motion.path
          d={`M 35 65 Q 50 ${65 + eyeExpression.mouthCurve} 65 65`}
          fill="none"
          className="stroke-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Decorative elements */}
        <motion.circle
          cx="75"
          cy="30"
          r="3"
          className="fill-muted-foreground"
          opacity="0.3"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.circle
          cx="80"
          cy="40"
          r="2"
          className="fill-muted-foreground"
          opacity="0.2"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        />
      </svg>
    </motion.div>
  )
}
