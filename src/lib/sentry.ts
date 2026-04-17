/**
 * Sentry error tracking for Porterful
 * 
 * Client-side: Initialize in providers.tsx
 * Server-side: Initialize in layout.tsx
 * 
 * Captures:
 * - Client runtime errors
 * - Auth callback errors
 * - Dashboard render errors
 * - Unhandled promise rejections
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const isSentryEnabled = !!SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry not configured - set NEXT_PUBLIC_SENTRY_DSN to enable error tracking');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Error Sampling - reduce noise in production
    sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
    
    // Don't send errors from localhost
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY_DEV === 'true',
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Before send - filter sensitive data
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      const exception = event.exception?.values?.[0];
      if (exception?.value?.includes('extension://')) {
        return null;
      }
      
      // Don't send network errors from ad blockers
      if (exception?.value?.includes('Failed to fetch') || 
          exception?.value?.includes('NetworkError')) {
        return null;
      }
      
      return event;
    },
    
    // Environment
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    
    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  });
}

export function captureException(error: unknown, context?: {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string };
}) {
  if (!isSentryEnabled) {
    console.error('[Sentry disabled]', error);
    return;
  }

  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}) {
  if (!isSentryEnabled) {
    console.log(`[Sentry disabled] ${level}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
}

// Auth-specific error tracking
export function captureAuthError(error: unknown, context: {
  step: 'login' | 'callback' | 'logout' | 'session-refresh' | 'session-validation';
  provider?: 'email' | 'google' | 'likeness';
  userId?: string;
}) {
  captureException(error, {
    tags: {
      error_type: 'auth',
      auth_step: context.step,
      auth_provider: context.provider || 'unknown',
    },
    extra: {
      auth_context: context,
    },
    user: context.userId ? { id: context.userId } : undefined,
  });
}

// Dashboard render error tracking
export function captureDashboardError(error: unknown, context: {
  dashboardType: 'artist' | 'supporter' | 'admin';
  component: string;
  userId?: string;
}) {
  captureException(error, {
    tags: {
      error_type: 'dashboard',
      dashboard_type: context.dashboardType,
      component: context.component,
    },
    extra: {
      dashboard_context: context,
    },
    user: context.userId ? { id: context.userId } : undefined,
  });
}
