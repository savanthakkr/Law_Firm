import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loaderVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
      },
      size: {
        sm: "w-8 h-8",
        default: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ variant, size, className }))}
        {...props}
        style={{
          animation: 'fadeIn 0.5s ease-in-out'
        }}
      >
        {/* Scales of Justice Icon with Smooth Animation */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" style={{
            animation: 'smoothPulse 2s ease-in-out infinite'
          }}>
            <path d="M12 2L13 8H11L12 2Z" style={{
              animation: 'smoothBounce 2s ease-in-out infinite',
              transformOrigin: 'center bottom'
            }} />
            <circle cx="7" cy="15" r="3" style={{
              animation: 'smoothSpin 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              transformOrigin: '7px 15px'
            }} />
            <circle cx="17" cy="15" r="3" style={{
              animation: 'smoothSpinReverse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              transformOrigin: '17px 15px'
            }} />
            <path d="M4 15H10M14 15H20M12 8L7 12M12 8L17 12" stroke="currentColor" strokeWidth="1" fill="none" style={{
              animation: 'smoothFade 3s ease-in-out infinite'
            }} />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" style={{
          animation: 'smoothRotate 3s linear infinite'
        }}></div>
        
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes smoothPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes smoothBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-2px) rotate(-1deg); }
            75% { transform: translateY(-1px) rotate(1deg); }
          }
          @keyframes smoothSpin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          @keyframes smoothSpinReverse {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(-180deg) scale(1.1); }
            100% { transform: rotate(-360deg) scale(1); }
          }
          @keyframes smoothFade {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes smoothRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
)
Loader.displayName = "Loader"

export { Loader, loaderVariants }