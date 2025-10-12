import { svgPaths } from "../imports/svg-yqwmlcl5sd";

interface LockIconProps {
  className?: string;
}

export function LockIcon({ className = "w-5 h-5" }: LockIconProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Shackle - top curved part of the lock */}
      <div className="absolute h-[37.5%] left-1/2 rounded-tl-[10px] rounded-tr-[10px] top-0 -translate-x-1/2 w-[58.3%]">
        <div 
          aria-hidden="true" 
          className="absolute border-[3px_3px_0px] border-solid border-current inset-0 pointer-events-none rounded-tl-[10px] rounded-tr-[10px]" 
        />
      </div>
      
      {/* Lock body */}
      <div className="absolute h-[62.5%] left-0 bottom-0 w-full">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <g clipPath="url(#clip0_lock)" id="SVG">
            <path 
              clipRule="evenodd" 
              d={svgPaths.p1c396c40} 
              fill="currentColor" 
              fillRule="evenodd" 
              id="Vector" 
            />
          </g>
          <defs>
            <clipPath id="clip0_lock">
              <rect fill="white" height="14.9988" width="15.0087" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}
