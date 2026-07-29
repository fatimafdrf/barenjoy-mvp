import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TenantId, LocationId, ContextVersion } from '@/domain/tenant/types'
import { DEFAULT_COMPANY_ID, DEFAULT_LOCATION_ID, CONTEXT_VERSION } from '@/domain/tenant/constants'

export const useContextStore = defineStore('context', () => {
  // State
  const companyId = ref<TenantId>(DEFAULT_COMPANY_ID)
  const locationId = ref<LocationId>(DEFAULT_LOCATION_ID)
  const contextVersion = ref<ContextVersion>(CONTEXT_VERSION)

  // Getter
  const activeContext = computed(() => ({
    companyId: companyId.value,
    locationId: locationId.value,
    contextVersion: contextVersion.value
  }))

  // Actions
  const setContext = (nextCompanyId: TenantId, nextLocationId: LocationId): void => {
    const trimmedCompany = (nextCompanyId || '').trim()
    const trimmedLocation = (nextLocationId || '').trim()

    if (!trimmedCompany || !trimmedLocation) {
      return
    }

    companyId.value = trimmedCompany
    locationId.value = trimmedLocation
  }

  const resetContext = (): void => {
    companyId.value = DEFAULT_COMPANY_ID
    locationId.value = DEFAULT_LOCATION_ID
    contextVersion.value = CONTEXT_VERSION
  }

  return {
    companyId,
    locationId,
    contextVersion,
    activeContext,
    setContext,
    resetContext
  }
})
