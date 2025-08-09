import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError } from '@/types';

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  }, { status });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  message?: string,
  status: number = 400
): NextResponse<ApiError> {
  return NextResponse.json({
    success: false,
    error,
    message: message || error,
  }, { status });
}

/**
 * Handle API errors with proper logging and response
 */
export function handleApiError(
  error: unknown,
  context: string = 'API Error'
): NextResponse<ApiError> {
  console.error(`${context}:`, error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('unauthorized') || error.message.includes('403')) {
      return createErrorResponse(
        'Authentication required',
        'Please sign in and try again',
        401
      );
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return createErrorResponse(
        'Resource not found',
        error.message,
        404
      );
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return createErrorResponse(
        'Rate limit exceeded',
        'Please try again later',
        429
      );
    }

    return createErrorResponse(
      error.message,
      'An error occurred while processing your request',
      500
    );
  }

  return createErrorResponse(
    'Internal server error',
    'An unexpected error occurred',
    500
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS URLs from YouTube
    if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.includes('youtube.com')) {
      throw new Error('Invalid URL');
    }
    return parsedUrl.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

export const rateLimiter = new SimpleRateLimiter();