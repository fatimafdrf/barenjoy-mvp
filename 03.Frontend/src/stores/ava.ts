import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useInventarioStore } from './inventario'
import { useEscandallosStore } from './escandallos'
import { useCrmStore } from './crm'
import { useBiStore } from './bi'
import { usePersonalStore } from './personal'
import { useReservasStore } from './reservas'
import { useMesasStore } from './mesas'

export interface ConversationMessage {
  id: string
  prompt: string
  timestamp: string
  summary: string
  dataUsed: string
  conclusions: string
  actionsRecommended: string[]
  priority: 'alta' | 'media' | 'baja'
  modulesConsulted: string[]
  actionRoute?: string
  actionText?: string
}

export const useAvaStore = defineStore('ava', () => {
  const history = ref<ConversationMessage[]>([])
  const favorites = ref<string[]>([])
  const activeMessage = ref<ConversationMessage | null>(null)

  // Load from localStorage if present
  try {
    const hist = localStorage.getItem('aveniq_ava_history')
    if (hist) history.value = JSON.parse(hist)
    const favs = localStorage.getItem('aveniq_ava_favorites')
    if (favs) favorites.value = JSON.parse(favs)
  } catch (e) {
    console.error('Error loading AVA storage:', e)
  }

  watch(history, () => {
    localStorage.setItem('aveniq_ava_history', JSON.stringify(history.value))
  }, { deep: true })

  watch(favorites, () => {
    localStorage.setItem('aveniq_ava_favorites', JSON.stringify(favorites.value))
  }, { deep: true })

  const toggleFavorite = (promptText: string) => {
    if (favorites.value.includes(promptText)) {
      favorites.value = favorites.value.filter(f => f !== promptText)
    } else {
      favorites.value.push(promptText)
    }
  }

  const sendPrompt = (promptText: string) => {
    const inventarioStore = useInventarioStore()
    const escandallosStore = useEscandallosStore()
    const crmStore = useCrmStore()
    const biStore = useBiStore()
    const personalStore = usePersonalStore()
    const reservasStore = useReservasStore()
    const mesasStore = useMesasStore()

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    let summary = ''
    let dataUsed = ''
    let conclusions = ''
    let actionsRecommended: string[] = []
    let priority: 'alta' | 'media' | 'baja' = 'baja'
    let modulesConsulted: string[] = []
    let actionRoute = ''
    let actionText = ''

    const pLower = promptText.toLowerCase()

    if (pLower.includes('comprar') || pLower.includes('abastecimiento') || pLower.includes('reposición')) {
      // Out of stock or low stock items
      const criticalItems = inventarioStore.products.filter(p => p.stock < p.minStock)
      modulesConsulted = ['Inventario', 'Almacén']
      priority = criticalItems.length > 0 ? 'alta' : 'baja'
      
      summary = `Análisis de aprovisionamiento de stock crítico solicitado.`
      dataUsed = `${criticalItems.length} insumos identificados en nivel de stock por debajo del límite mínimo parametrizado.`
      
      if (criticalItems.length > 0) {
        conclusions = `Se requiere reposición urgente para evitar quiebres de servicio. Los insumos más comprometidos son: ${criticalItems.map(i => `${i.name} (${i.stock} un)`).join(', ')}.`
        actionsRecommended = [
          'Generar albarán de compra rápido para el proveedor Makro.',
          'Reajustar el stock de seguridad en productos de alta demanda para fines de semana.'
        ]
        actionRoute = '/inventario'
        actionText = 'Abrir Almacén'
      } else {
        conclusions = 'Todos los niveles de almacén se encuentran en rangos de stock seguros.'
        actionsRecommended = ['Monitorear consumos diarios en comanda.']
      }
    } 
    else if (pLower.includes('margen') || pLower.includes('peor margen') || pLower.includes('escandallo')) {
      const worstRecipes = [...escandallosStore.recipesWithCosts].sort((a, b) => a.marginPercent - b.marginPercent).slice(0, 2)
      modulesConsulted = ['Escandallos', 'Inventario']
      priority = 'media'
      
      summary = 'Análisis de márgenes operacionales por receta técnica.'
      dataUsed = `Evaluadas ${escandallosStore.recipesWithCosts.length} fichas técnicas de platos y bebidas con costes reactivos de materias primas.`
      
      if (worstRecipes.length > 0) {
        conclusions = `Los productos con menor margen detectados en carta son: ${worstRecipes.map(r => `${r.name} (${r.marginPercent.toFixed(0)}% margen)`).join(', ')}.`
        actionsRecommended = [
          'Negociar costo de compra de Ternera y Brioche con proveedores.',
          'Incrementar precio sugerido en carta un 5-10% en productos críticos.'
        ]
        actionRoute = '/escandallos'
        actionText = 'Abrir Ficha Escandallos'
      } else {
        conclusions = 'Todos los platos mantienen márgenes operacionales por encima del 50%.'
        actionsRecommended = ['Auditar costes de materia prima trimestralmente.']
      }
    } 
    else if (pLower.includes('camarero') || pLower.includes('empleado') || pLower.includes('vende más')) {
      const topWaiter = [...biStore.salesByWaiterChart].sort((a, b) => b.value - a.value)[0]
      modulesConsulted = ['BI Ventas', 'Personal']
      priority = 'baja'
      
      summary = 'Auditoría de rendimiento de fuerza laboral en sala.'
      dataUsed = `Facturación acumulada por empleado en el rango seleccionado.`
      
      if (topWaiter) {
        conclusions = `El colaborador con mayor nivel de ventas registrado es ${topWaiter.label} con un total de ${topWaiter.value.toFixed(2)} € de recaudación.`
        actionsRecommended = [
          'Establecer a Laura Gómez como entrenadora de ventas cruzadas para el equipo.',
          'Diseñar un programa de incentivos para camareros basado en ticket medio.'
        ]
        actionRoute = '/personal'
        actionText = 'Abrir Control Personal'
      } else {
        conclusions = 'No se registran comandas de cobro activas para evaluar hoy.'
        actionsRecommended = ['Simular ventas en el panel de mesas para generar estadísticas.']
      }
    } 
    else if (pLower.includes('mesa') || pLower.includes('mesas') || pLower.includes('ingresos')) {
      const active = mesasStore.tables.filter(t => t.status === 'occupied' || t.status === 'bill').length
      modulesConsulted = ['Sala Planos', 'Caja POS']
      priority = 'media'
      
      summary = 'Estadísticas operativas de rotación y consumo por mesa.'
      dataUsed = `Auditoría del estado actual de las mesas en el plano digital de sala.`
      conclusions = `Se registran ${active} mesas ocupadas o listas para el cobro. La tasa de ocupación actual de sala es de ${((active / mesasStore.tables.length) * 100).toFixed(0)}%.`
      actionsRecommended = [
        'Agilizar la preparación de comandas en KDS para liberar mesas en hora punta.',
        'Ofrecer postres sugeridos en mesas activas para incrementar el ticket medio.'
      ]
      actionRoute = '/mesas'
      actionText = 'Ver Plano de Sala'
    } 
    else if (pLower.includes('clientes') || pLower.includes('tiempo sin venir') || pLower.includes('crm')) {
      const inactives = crmStore.clients.filter(c => c.visitsCount <= 1)
      modulesConsulted = ['CRM Clientes', 'BI']
      priority = 'media'
      
      summary = 'Fidelización y análisis de clientes en riesgo de inactividad.'
      dataUsed = `Auditoría de base de datos CRM completa de comensales registrados.`
      
      if (inactives.length > 0) {
        conclusions = `Se detectan ${inactives.length} clientes registrados catalogados como "Inactivos" o con visitas esporádicas. Los más críticos son: ${inactives.map(c => c.name).join(', ')}.`
        actionsRecommended = [
          'Enviar campaña promocional dirigida por email con descuento de fidelidad.',
          'Llamar de forma personalizada a los clientes VIP con reservas pendientes.'
        ]
        actionRoute = '/crm'
        actionText = 'Abrir CRM Ficha 360'
      } else {
        conclusions = 'Todos los clientes registrados registran visitas periódicas seguras.'
        actionsRecommended = ['Mantener newsletter mensual activa.']
      }
    } 
    else if (pLower.includes('no show') || pLower.includes('riesgo') || pLower.includes('reservas')) {
      const todayStr = new Date().toISOString().split('T')[0]
      const unconfirmed = reservasStore.reservations.filter(r => r.date === todayStr && r.status === 'pending')
      modulesConsulted = ['Reservas', 'CRM']
      priority = 'alta'
      
      summary = 'Evaluación de seguridad ante cancelaciones y No Shows hoy.'
      dataUsed = `Auditoría de ${reservasStore.reservations.filter(r => r.date === todayStr).length} reservas agendadas para el día de hoy.`
      
      if (unconfirmed.length > 0) {
        conclusions = `Existen ${unconfirmed.length} reservas en estado "Pendiente de Confirmación" con riesgo moderado de no presentarse.`
        actionsRecommended = [
          'Enviar recordatorio de confirmación por SMS/WhatsApp automatizado a los clientes.',
          'Aplicar política de tarjeta de crédito obligatoria para reservas de grupos grandes.'
        ]
        actionRoute = '/reservas'
        actionText = 'Abrir Libro de Reservas'
      } else {
        conclusions = 'Todas las reservas activas para el turno de hoy han sido confirmadas por los comensales.'
        actionsRecommended = ['Preparar mesas asignadas según las alergias registradas.']
      }
    } 
    else if (pLower.includes('agotaremos') || pLower.includes('inventario agotado') || pLower.includes('agotados')) {
      const outOfStock = inventarioStore.products.filter(p => p.stock === 0)
      modulesConsulted = ['Inventario Almacén', 'Cocina']
      priority = 'alta'
      
      summary = 'Auditoría de roturas de stock en tiempo real.'
      dataUsed = `Recuento físico de materias primas activas en la despensa central.`
      
      if (outOfStock.length > 0) {
        conclusions = `Se registran ${outOfStock.length} productos totalmente agotados hoy: ${outOfStock.map(p => p.name).join(', ')}.`
        actionsRecommended = [
          'Bloquear la venta de platos vinculados en el menú digital para evitar comandas canceladas.',
          'Solicitar compra de urgencia con proveedor de proximidad.'
        ]
        actionRoute = '/inventario'
        actionText = 'Abrir Inventario'
      } else {
        conclusions = 'No hay materias primas agotadas en el almacén hoy.'
        actionsRecommended = ['Revisar stock diario al cierre del turno.']
      }
    } 
    else if (pLower.includes('beneficio') || pLower.includes('esta semana') || pLower.includes('ganancia')) {
      const revenue = biStore.totalSalesRevenue
      const costLabour = personalStore.clocks.length * 15 * 8 // simulate cost
      const profit = Math.max(0, revenue - costLabour)
      modulesConsulted = ['BI Finanzas', 'Caja', 'Personal']
      priority = 'media'
      
      summary = 'Balance financiero consolidado de ingresos y costes semanales.'
      dataUsed = `Ventas semanales acumuladas (${revenue.toFixed(2)} €) frente a coste de personal y mano de obra estimado.`
      conclusions = `El beneficio bruto semanal de Aveniq se sitúa en ${profit.toFixed(2)} €, manteniendo un margen promedio saludable.`
      actionsRecommended = [
        'Ajustar cuadrantes de personal para el turno de tarde para reducir costes ociosos.',
        'Potenciar platos de alto margen en las recomendaciones del chef.'
      ]
      actionRoute = '/bi'
      actionText = 'Abrir BI Analytics'
    } 
    else {
      // General custom fallback answer
      modulesConsulted = ['BI', 'Dashboard', 'Caja']
      priority = 'baja'
      summary = `Consulta ejecutiva procesada: "${promptText}".`
      dataUsed = 'Auditoría de los logs operacionales e históricos consolidados.'
      conclusions = 'AVA ha evaluado las variables generales del restaurante y no detecta desviaciones presupuestarias o de inventario.'
      actionsRecommended = [
        'Monitorear indicadores clave de rendimiento (KPIs) en la home del Dashboard.',
        'Lanzar cualquiera de las tarjetas de prompts rápidos recomendadas a la izquierda.'
      ]
    }

    const newMessage: ConversationMessage = {
      id: 'ava-' + Math.random().toString(36).substr(2, 9),
      prompt: promptText,
      timestamp: timeStr,
      summary,
      dataUsed,
      conclusions,
      actionsRecommended,
      priority,
      modulesConsulted,
      actionRoute,
      actionText
    }

    history.value.unshift(newMessage)
    activeMessage.value = newMessage
  }

  const clearHistory = () => {
    history.value = []
    activeMessage.value = null
  }

  return {
    history,
    favorites,
    activeMessage,
    toggleFavorite,
    sendPrompt,
    clearHistory
  }
})
