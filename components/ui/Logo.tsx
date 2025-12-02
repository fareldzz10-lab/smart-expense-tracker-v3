import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <img
      src="/logo.svg"
      alt="Logo"
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback if image fails to load
        e.currentTarget.style.display = "none";
        console.error("Logo file not found in /public/logo.svg");
      }}
    />
  );
};
