'use client';

/**
 * Optimized Image Component
 * 
 * A wrapper around Next.js Image with sensible defaults for the BUSYBEES platform.
 * Includes lazy loading, blur placeholder, and optimized configuration.
 */

import Image from 'next/image';
import { useState, useCallback, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, 'placeholder' | 'blurDataURL'> {
  /** Enable blur placeholder (default: true) */
  enableBlur?: boolean;
  /** Custom blur data URL (base64) */
  customBlurDataURL?: string;
  /** Container class name */
  containerClassName?: string;
  /** Fallback src when image fails to load */
  fallbackSrc?: string;
  /** Aspect ratio for container (e.g., '16/9', '1/1') */
  aspectRatio?: string;
  /** Object fit style (default: 'cover') */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Generate a simple base64 blur placeholder
 */
function generateBlurDataURL(width = 10, height = 10): string {
  // Simple gray placeholder
  const shimmer = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(shimmer).toString('base64')}`;
}

/**
 * Default blur data URL for placeholder
 */
const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';

/**
 * Optimized Image Component with defaults
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  enableBlur = true,
  customBlurDataURL,
  containerClassName,
  fallbackSrc = '/images/placeholder.png',
  aspectRatio,
  objectFit = 'cover',
  className,
  loading = 'lazy',
  sizes,
  quality = 85,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImgError(true);
      onError?.(e);
    },
    [onError]
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const imageSrc = imgError ? fallbackSrc : src;
  const blurDataURL = customBlurDataURL ?? defaultBlurDataURL;

  // Container styles
  const containerStyles: React.CSSProperties = aspectRatio
    ? { aspectRatio }
    : {};

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fill ? 'w-full h-full' : '',
        isLoading && enableBlur ? 'animate-pulse' : '',
        containerClassName
      )}
      style={containerStyles}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        loading={loading}
        placeholder={enableBlur ? 'blur' : 'empty'}
        blurDataURL={enableBlur ? blurDataURL : undefined}
        sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={quality}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}

/**
 * Avatar Image with optimized defaults
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'fill'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      enableBlur={false}
      {...props}
    />
  );
}

/**
 * Card Image with aspect ratio
 */
export function CardImage({
  src,
  alt,
  aspectRatio = '16/9',
  className,
  containerClassName,
  ...props
}: Omit<OptimizedImageProps, 'fill'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      aspectRatio={aspectRatio}
      containerClassName={containerClassName}
      className={className}
      {...props}
    />
  );
}

/**
 * Hero Image with full width
 */
export function HeroImage({
  src,
  alt,
  height = 400,
  className,
  containerClassName,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'fill'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      containerClassName={cn('w-full', containerClassName)}
      style={{ height: `${height}px`, ...props.style }}
      className={className}
      priority
      loading="eager"
      {...props}
    />
  );
}

/**
 * Thumbnail Image for lists
 */
export function ThumbnailImage({
  src,
  alt,
  size = 80,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'fill'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-md', className)}
      enableBlur={false}
      {...props}
    />
  );
}

export default OptimizedImage;
