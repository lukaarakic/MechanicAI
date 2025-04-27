import type { FC } from "react";
import { cn } from "~/lib/utils";

interface GradientHeadingProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const GradientHeading: FC<GradientHeadingProps> = ({
  children,
  className = "",
  size = "lg",
}) => {
  const sizeClasses = {
    sm: "text-40",
    md: "text-45",
    lg: "text-64",
  };
  const sizeClass = sizeClasses[size] || sizeClasses.lg;

  return (
    <h1
      className={cn(
        "by-the-sea font-semibold w-fit mx-auto leading-tight mb-25",
        sizeClass,
        className
      )}
    >
      {children}
    </h1>
  );
};

export default GradientHeading;
