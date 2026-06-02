'use client'

import { Clock3, ExternalLink, MapPin, Package, Truck } from 'lucide-react'
import {
  formatShipmentEventStatus,
  formatShipmentEventType,
  ShipmentEventRecord,
} from '@/lib/shipment-events'
import { EmptyState } from '@/components/guidance/GuidedExperience'

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function eventBadgeClasses(eventType: string) {
  const value = eventType.toLowerCase()
  if (value === 'label_created') return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
  if (value === 'shipped') return 'border-sky-500/30 bg-sky-500/10 text-sky-300'
  if (value === 'in_transit') return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
  if (value === 'delivered') return 'border-green-500/30 bg-green-500/10 text-green-300'
  if (value === 'exception') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (value === 'returned') return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

function statusBadgeClasses(eventStatus: string) {
  const value = eventStatus.toLowerCase()
  if (value === 'confirmed') return 'border-green-500/30 bg-green-500/10 text-green-300'
  if (value === 'exception') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (value === 'returned') return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  return 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
}

function locationLabel(city?: string | null, state?: string | null) {
  const parts = [city?.trim(), state?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export function ShipmentEventTimeline({
  events,
  emptyTitle = 'No shipment history yet',
  emptyDescription = 'Shipment events will appear here when a founder adds packing, shipping, transit, or delivery history for a fulfillment job.',
}: {
  events: ShipmentEventRecord[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<Package size={24} />}
        title={emptyTitle}
        description={emptyDescription}
        points={[
          { label: 'What is this?', text: 'An append-only record of shipment actions for each fulfillment job.' },
          { label: 'Why it matters', text: 'It shows where the package is in the shipping lifecycle.' },
          { label: 'Next step', text: 'Add a label, ship event, or delivery update from the founder queue.' },
        ]}
      />
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const job = event.fulfillment_job
        const location = locationLabel(event.location_city, event.location_state)

        return (
          <div key={event.id} className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${eventBadgeClasses(event.event_type)}`}>
                    {formatShipmentEventType(event.event_type)}
                  </span>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(event.event_status)}`}>
                    {formatShipmentEventStatus(event.event_status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--pf-text-muted)]">
                  <Clock3 size={14} />
                  <span>{formatDate(event.created_at)}</span>
                </div>
              </div>

              <div className="text-right text-xs text-[var(--pf-text-muted)] space-y-1">
                <div className="font-medium text-[var(--pf-text)]">
                  {job?.job_number || `Job ${event.fulfillment_job_id.slice(0, 8)}`}
                </div>
                <div>
                  {job?.sku?.sku_code || 'Unknown SKU'}
                  {job?.sku?.variant_name ? ` · ${job.sku.variant_name}` : ''}
                </div>
                <div>{job?.asset?.title || 'Unknown asset'}</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                {(event.carrier || event.tracking_number || event.tracking_url) && (
                  <div className="flex flex-wrap items-center gap-2 text-[var(--pf-text-secondary)]">
                    <Truck size={14} className="text-[var(--pf-orange)]" />
                    {event.carrier && <span>{event.carrier}</span>}
                    {event.tracking_number && <span className="font-medium">{event.tracking_number}</span>}
                    {event.tracking_url && (
                      <a
                        href={event.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--pf-orange)] hover:underline"
                      >
                        Tracking
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                {location && (
                  <div className="flex items-center gap-2 text-[var(--pf-text-secondary)]">
                    <MapPin size={14} className="text-[var(--pf-orange)]" />
                    <span>{location}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="text-[11px] uppercase tracking-wide text-[var(--pf-text-muted)]">Notes</div>
                <p className="text-[var(--pf-text-secondary)]">
                  {event.notes || 'No notes provided.'}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
