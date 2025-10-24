'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SWRFPHLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showText?: boolean
    className?: string
    textClassName?: string
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
}

const imageSizeClasses = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
}

export function SWRFPHLogo({
    size = 'md',
    showText = true,
    className = '',
    textClassName = ''
}: SWRFPHLogoProps) {
    return (
        <div className={cn('flex items-center space-x-3', className)}>
            <div className={cn('relative', sizeClasses[size])}>
                <Image
                    src="/swrfph-logo.png"
                    alt="SWRFPH Logo"
                    width={imageSizeClasses[size]}
                    height={imageSizeClasses[size]}
                    className="rounded-full"
                    priority
                />
            </div>
            {showText && (
                <div className={cn('flex flex-col', textClassName)}>
                    <span className="font-bold text-lg text-gray-800 leading-tight">
                        SWRFHP
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        South West Regional Fund for Health Promotion
                    </span>
                </div>
            )}
        </div>
    )
}
