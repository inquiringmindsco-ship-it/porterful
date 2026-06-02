export type GuidanceProgressState = 'complete' | 'current' | 'upcoming'

export type GuidanceProgressStep = {
  label: string
  state: GuidanceProgressState
}

export type GuidanceSignal = {
  label: string
  value: string
}

export type GuidedRoadmapData = {
  eyebrow: string
  title: string
  summary: string
  currentStage: string
  nextStep: string
  steps: GuidanceProgressStep[]
  signals: GuidanceSignal[]
  action: {
    href: string
    label: string
  }
}

function buildSteps(labels: string[], currentIndex: number): GuidanceProgressStep[] {
  return labels.map((label, index) => ({
    label,
    state:
      index < currentIndex
        ? 'complete'
        : index === currentIndex
          ? 'current'
          : 'upcoming',
  }))
}

function sumInventoryVisibleUnits(summaries: Array<{ on_hand?: number; reserved?: number; available?: number; shipped?: number; returned?: number }>) {
  return summaries.reduce((sum, summary) => {
    return sum + Number(summary.available ?? 0)
  }, 0)
}

function countJobsByStatuses(jobs: Array<{ status?: string }>, statuses: string[]) {
  return jobs.filter((job) => statuses.includes(String(job.status || '').toLowerCase())).length
}

export function buildArtistGuidance(input: {
  assets: Array<{ approval_status?: string; production_status?: string }>
  skus: Array<{ active?: boolean }>
  inventorySummaries: Array<{ on_hand?: number; reserved?: number; available?: number }>
  jobs: Array<{ status?: string }>
}): GuidedRoadmapData {
  const assets = input.assets || []
  const skus = input.skus || []
  const inventorySummaries = input.inventorySummaries || []
  const jobs = input.jobs || []

  const submittedAssets = assets.filter((asset) => ['submitted', 'under_review'].includes(String(asset.approval_status || '').toLowerCase()))
  const approvedAssets = assets.filter((asset) => String(asset.approval_status || '').toLowerCase() === 'approved')
  const productionApprovedAssets = assets.filter((asset) => String(asset.production_status || '').toLowerCase() === 'production_approved')
  const activeSkus = skus.filter((sku) => sku.active)
  const inventoryVisibleUnits = sumInventoryVisibleUnits(inventorySummaries)
  const inventoryVisibleSkus = inventorySummaries.filter((summary) => Number(summary.available ?? 0) > 0)
  const openJobs = jobs.filter((job) => !['delivered', 'cancelled'].includes(String(job.status || '').toLowerCase()))

  let currentIndex = 0
  let currentStage = 'Submit Production Asset'
  let nextStep = 'Submit your first asset so Porterful can review it.'
  let action = { href: '/dashboard/artist/assets', label: 'Submit Asset' }

  if (assets.length === 0) {
    currentIndex = 0
    currentStage = 'Submit Production Asset'
    nextStep = 'Create and submit your first asset for review.'
  } else if (submittedAssets.length > 0) {
    currentIndex = 1
    currentStage = 'Waiting for Review'
    nextStep = 'Track approval status until the asset is reviewed.'
  } else if (approvedAssets.length > 0 && productionApprovedAssets.length === 0) {
    currentIndex = 2
    currentStage = 'Asset Approved'
    nextStep = 'Wait for production approval before the asset can become a SKU.'
  } else if (productionApprovedAssets.length > 0 && activeSkus.length === 0) {
    currentIndex = 3
    currentStage = 'Asset Production Approved'
    nextStep = 'Check the SKU registry once the approved asset is turned into sellable variants.'
    action = { href: '/dashboard/artist/skus', label: 'View SKUs' }
  } else if (activeSkus.length > 0 && inventoryVisibleUnits === 0 && inventoryVisibleSkus.length === 0) {
    currentIndex = 4
    currentStage = 'SKU Created'
    nextStep = 'Inventory needs to be received before the SKU is ready to move.'
    action = { href: '/dashboard/artist/inventory', label: 'View Inventory' }
  } else if (inventoryVisibleUnits > 0 && openJobs.length === 0) {
    currentIndex = 5
    currentStage = 'Inventory Available'
    nextStep = 'A fulfillment job can be created once inventory is ready.'
    action = { href: '/dashboard/artist/fulfillment', label: 'View Fulfillment' }
  } else {
    currentIndex = 6
    currentStage = 'Fulfillment Ready'
    nextStep = 'Track the active fulfillment job through the queue.'
    action = { href: '/dashboard/artist/fulfillment', label: 'View Fulfillment' }
  }

  return {
    eyebrow: 'Guided Experience',
    title: 'Artist path',
    summary: 'Move creative work from submission to fulfillment readiness.',
    currentStage,
    nextStep,
    steps: buildSteps(
      [
        'Submit Production Asset',
        'Wait for Review',
        'Asset Approved',
        'Asset Production Approved',
        'SKU Created',
        'Inventory Available',
        'Fulfillment Ready',
      ],
      currentIndex
    ),
    signals: [
      { label: 'Submitted assets', value: String(submittedAssets.length) },
      { label: 'Approved assets', value: String(approvedAssets.length) },
      { label: 'Active SKUs', value: String(activeSkus.length) },
      { label: 'Inventory visible', value: String(inventoryVisibleUnits) },
      { label: 'Open jobs', value: String(openJobs.length) },
    ],
    action,
  }
}

export function buildFounderGuidance(input: {
  assets: Array<{ approval_status?: string; production_status?: string; asset_id?: string }>
  skus: Array<{ active?: boolean; production_asset_id?: string; sku_id?: string }>
  inventorySummaries: Array<{ sku_id?: string; on_hand?: number; reserved?: number; available?: number; shipped?: number; returned?: number }>
  jobs: Array<{ status?: string }>
}): GuidedRoadmapData {
  const assets = input.assets || []
  const skus = input.skus || []
  const inventorySummaries = input.inventorySummaries || []
  const jobs = input.jobs || []

  const reviewQueue = assets.filter((asset) => ['submitted', 'under_review'].includes(String(asset.approval_status || '').toLowerCase()))
  const productionApprovedAssets = assets.filter((asset) => String(asset.production_status || '').toLowerCase() === 'production_approved')
  const currentApprovedAssets = assets.filter((asset) => String(asset.approval_status || '').toLowerCase() === 'approved')
  const assetIdsWithSkus = new Set(skus.map((sku) => sku.production_asset_id).filter(Boolean))
  const productionApprovedWithoutSku = productionApprovedAssets.filter((asset) => !assetIdsWithSkus.has(asset.asset_id || ''))
  const skuSummaries = new Map<string, { on_hand?: number; reserved?: number; available?: number; shipped?: number; returned?: number }>()
  inventorySummaries.forEach((summary) => {
    if (summary.sku_id) {
      skuSummaries.set(summary.sku_id, summary)
    }
  })
  const skusWithoutInventory = skus.filter((sku) => {
    const summary = skuSummaries.get(sku.sku_id || '')
    if (!summary) return true
    return Number(summary.on_hand ?? 0) === 0 && Number(summary.reserved ?? 0) === 0 && Number(summary.available ?? 0) === 0 && Number(summary.shipped ?? 0) === 0 && Number(summary.returned ?? 0) === 0
  })
  const jobsNeedingAction = jobs.filter((job) => ['pending', 'reserved', 'printing', 'qc', 'packed'].includes(String(job.status || '').toLowerCase()))
  const jobsWithExceptions = jobs.filter((job) => ['exception', 'cancelled'].includes(String(job.status || '').toLowerCase()))

  let currentIndex = 0
  let currentStage = 'Review submitted assets'
  let nextStep = 'Approve, reject, or request revision on the next submission.'
  let action = { href: '/dashboard/founder/assets', label: 'Review Assets' }

  if (assets.length === 0) {
    currentIndex = 0
    currentStage = 'Waiting for submissions'
    nextStep = 'Ask artists to submit production assets so review can begin.'
  } else if (reviewQueue.length > 0) {
    currentIndex = 0
    currentStage = 'Review submitted assets'
    nextStep = 'Approve, reject, or request revision.'
  } else if (currentApprovedAssets.length > 0 && productionApprovedWithoutSku.length > 0) {
    currentIndex = 3
    currentStage = 'Create SKUs'
    nextStep = 'Turn approved assets into sellable variants.'
    action = { href: '/dashboard/founder/skus', label: 'Create SKU' }
  } else if (skusWithoutInventory.length > 0) {
    currentIndex = 4
    currentStage = 'Add inventory'
    nextStep = 'Receive stock against the active SKU so it can move forward.'
    action = { href: '/dashboard/founder/inventory', label: 'Add Inventory' }
  } else if (jobsNeedingAction.length > 0) {
    currentIndex = 5
    currentStage = 'Manage fulfillment jobs'
    nextStep = 'Move jobs through reserve, printing, QC, pack, ship, and deliver.'
    action = { href: '/dashboard/founder/fulfillment', label: 'Open Queue' }
  } else {
    currentIndex = 6
    currentStage = jobsWithExceptions.length > 0 ? 'Resolve exceptions' : 'Track fulfillment status'
    nextStep = jobsWithExceptions.length > 0
      ? 'Review blocked or cancelled jobs before the queue stalls.'
      : 'Keep the queue moving and watch for any blocked items.'
    action = { href: '/dashboard/founder/fulfillment', label: 'Open Queue' }
  }

  return {
    eyebrow: 'Guided Experience',
    title: 'Founder operations',
    summary: 'Keep assets, SKUs, inventory, and jobs moving in sequence.',
    currentStage,
    nextStep,
    steps: buildSteps(
      [
        'Review submitted assets',
        'Approve / reject / request revision',
        'Mark asset production approved',
        'Create SKU',
        'Add inventory',
        'Create / manage fulfillment job',
        'Track fulfillment status',
      ],
      currentIndex
    ),
    signals: [
      { label: 'Review queue', value: String(reviewQueue.length) },
      { label: 'Approved assets w/o SKUs', value: String(productionApprovedWithoutSku.length) },
      { label: 'SKUs without inventory', value: String(skusWithoutInventory.length) },
      { label: 'Jobs needing action', value: String(jobsNeedingAction.length) },
      { label: 'Exceptions', value: String(jobsWithExceptions.length) },
    ],
    action,
  }
}
