export type CompanyStatus = 'active' | 'suspended'
export type LocationStatus = 'active' | 'inactive'
export type AssignmentStatus = 'active' | 'inactive'
export type TenantId = string
export type LocationId = string
export type ContextVersion = number

export interface Company {
  readonly id: TenantId
  name: string
  legalName: string
  taxId: string
  email: string
  phone: string
  status: CompanyStatus
  subscriptionId: string | null
  createdAt: string
  updatedAt: string
}

export interface Location {
  readonly id: LocationId
  readonly companyId: TenantId
  name: string
  address: string
  phone: string
  timezone: string
  currency: string
  status: LocationStatus
  createdAt: string
  updatedAt: string
}

export interface UserLocation {
  readonly userId: string
  readonly companyId: TenantId
  readonly locationId: LocationId
  role: 'admin' | 'waiter' | 'kitchen' | 'bar'
  status: AssignmentStatus
}

export interface CompanySettings {
  readonly companyId: TenantId
  branding: {
    logoUrl?: string
    primaryColor?: string
  }
  fiscal: {
    fiscalYearStartMonth: number
  }
  locale: string
  featureFlags: Record<string, boolean>
}

export interface LocationSettings {
  readonly locationId: LocationId
  readonly companyId: TenantId
  ticketing: {
    receiptHeader?: string
    receiptFooter?: string
  }
  taxes: {
    standardIvaPercent: number
  }
  operations: {
    kdsRefreshRateMs: number
  }
  openingHours: Array<{
    day: number
    open: string
    close: string
  }>
}

export interface ActiveContext {
  companyId: TenantId
  locationId: LocationId
  userId: string
  role: 'admin' | 'waiter' | 'kitchen' | 'bar'
  contextVersion: ContextVersion
}
