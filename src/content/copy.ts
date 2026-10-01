/**
 * Copy de Tope. La UI no inventa textos: los toma de acá.
 *
 * Reglas (ver docs/voz.md):
 * - Voseo rioplatense, frases cortas, sin jerga contable.
 * - Las funciones reciben strings YA formateados (usar `src/content/format.ts`)
 *   o números simples. Acá no se formatea moneda.
 * - Tranquilizar, nunca asustar: incluso en rojo, decir qué hacer.
 */

import type { EstadoCobro, LetraCategoria, NivelSemaforo } from "@/lib/domain/types";

/** "1 día" / "3 días". */
const dias = (n: number) => (n === 1 ? "1 día" : `${n} días`);

export type TipoAlerta =
  | "recategorizacion"
  | "vencimiento_cuota"
  | "cerca_del_tope"
  | "excede_tope"
  | "cobro_atrasado"
  | "pasa_de_categoria";

export interface TextoAlerta {
  titulo: string;
  cuerpo: string;
  cta?: string;
}

export type FiltroCobros = "todos" | EstadoCobro;

export const copy = {
  app: {
    nombre: "Tope",
    tagline: "Facturá en 30 segundos y nunca más te preocupes por el monotributo.",
    taglineCorta: "Tu monotributo, en orden.",
    skipLink: "Saltar al contenido",
  },

  nav: {
    ariaLabel: "Navegación principal",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    items: {
      inicio: "Inicio",
      cobros: "Cobros",
      semaforo: "Semáforo",
      clientes: "Clientes",
      facturas: "Facturas",
      ajustes: "Ajustes",
    },
    badgeProximamente: "Pronto",
  },

  dashboard: {
    /** `hora` 0–23 en hora argentina. `nombre` puede venir vacío. */
    saludo: (nombre: string, hora: number): string => {
      const base = hora >= 5 && hora < 13 ? "Buen día" : hora >= 13 && hora < 20 ? "Buenas tardes" : "Buenas noches";
      const pila = nombre.trim().split(/\s+/)[0];
      return pila ? `${base}, ${pila}` : base;
    },
    titulo: "Tu mes",
    subtitulo: (mesLargo: string) => `Así viene ${mesLargo}.`,
    metricas: {
      cobrado: {
        label: "Cobrado este mes",
        descripcion: "Lo que ya entró.",
      },
      porCobrar: {
        label: "Por cobrar",
        descripcion: "Lo que te deben y todavía está en fecha.",
      },
      atrasado: {
        label: "Atrasado",
        descripcion: "Ya venció y no entró.",
        descripcionVacia: "Nada atrasado. Bien ahí.",
      },
      apartar: {
        label: "Apartá para impuestos",
        descripcion: "Para que el mes que viene no te agarre de sorpresa.",
        ayudaTitulo: "¿De dónde sale este número?",
        ayuda:
          "Es la cuota del monotributo (impuesto, jubilación y obra social, todo junto) más una reserva sobre lo que cobraste, por si aparece algo extra como Ingresos Brutos. Separalo apenas cobrás y listo: esa plata ya no es tuya.",
        detalleCuota: (montoCuota: string) => `Cuota: ${montoCuota}`,
        detalleReserva: (montoReserva: string, porcentaje: string) =>
          `Reserva (${porcentaje} de lo cobrado): ${montoReserva}`,
      },
    },
    notaDolares: (tipoCambio: string) => `Los dólares los estimamos a ${tipoCambio} por US$ 1.`,
    proximosCobros: {
      titulo: "Próximos cobros",
      verTodos: "Ver todos",
      vacio: "No tenés cobros pendientes.",
    },
  },

  semaforo: {
    titulo: "Semáforo",
    /** Títulos grandes, en serif. */
    tituloPorNivel: {
      verde: "Vas tranqui",
      amarillo: "Ojo, te estás acercando",
      rojo: "Estás al límite",
    } as const satisfies Record<NivelSemaforo, string>,
    bajadaPorNivel: {
      verde: "Tenés margen de sobra en tu categoría. Seguí facturando sin drama.",
      amarillo: "Todavía estás dentro de tu categoría, pero conviene mirar los próximos cobros.",
      rojo: "Llegaste al tope de tu categoría. Tranqui, tiene solución: te contamos qué hacer.",
    } as const satisfies Record<NivelSemaforo, string>,
    ariaNivel: {
      verde: "Semáforo en verde",
      amarillo: "Semáforo en amarillo",
      rojo: "Semáforo en rojo",
    } as const satisfies Record<NivelSemaforo, string>,
    teFaltan: (monto: string) => `Te faltan ${monto} para el tope`,
    tePasaste: (monto: string) => `Te pasaste ${monto} del tope`,
    llevas: (monto: string, tope: string) => `Llevás ${monto} de ${tope}`,
    usado: (porcentaje: string) => `${porcentaje} del tope`,
    doceMeses: "Sumamos lo que facturaste en los últimos 12 meses, no en el año calendario.",
    doceMesesLabel: "Últimos 12 meses",
    categoriaLabel: "Tu categoría",
    categoria: (letra: LetraCategoria) => `Categoría ${letra}`,
    topeLabel: "Tope de la categoría",
    categoriaSiguiente: "Categoría siguiente",
    categoriaSiguienteDetalle: (letra: LetraCategoria, tope: string, cuota: string) =>
      `${letra}: tope ${tope}, cuota ${cuota} por mes`,
    sinCategoriaSiguiente: "Ya estás en la categoría más alta.",
    graficoTitulo: "Facturación por mes",
    graficoAria: (meses: number) => `Gráfico de facturación de los últimos ${meses} meses`,
    alertasTitulo: "Para tener en cuenta",
    sinAlertas: "Nada pendiente por ahora.",
  },

  alertas: {
    ariaCerrar: "Descartar aviso",
    /** Recategorización semestral (enero y julio). */
    recategorizacion: (d: { mesLargo: string; fechaLimite: string; enDias: string }): TextoAlerta => ({
      titulo: `Se viene la recategorización de ${d.mesLargo}`,
      cuerpo: `Cada seis meses ARCA te pide revisar si seguís en la categoría correcta según lo que facturaste. Tenés tiempo hasta el ${d.fechaLimite} (${d.enDias}).`,
      cta: "Ver mi categoría",
    }),
    vencimiento_cuota: (d: { monto: string; fecha: string; enDias: string }): TextoAlerta => ({
      titulo: `Tu cuota vence ${d.enDias}`,
      cuerpo: `Son ${d.monto} y vence el ${d.fecha}. Si tenés débito automático, no hace falta que hagas nada.`,
      cta: "Ver cómo pagar",
    }),
    cerca_del_tope: (d: { porcentaje: string; teFaltan: string; categoria: LetraCategoria }): TextoAlerta => ({
      titulo: `Ya usaste el ${d.porcentaje} de tu tope`,
      cuerpo: `Te quedan ${d.teFaltan} en la categoría ${d.categoria}. No pasa nada, pero mirá bien los próximos cobros grandes.`,
      cta: "Ver semáforo",
    }),
    excede_tope: (d: { excedente: string; categoria: LetraCategoria; categoriaSiguiente?: LetraCategoria }): TextoAlerta => ({
      titulo: "Pasaste el tope de tu categoría",
      cuerpo: d.categoriaSiguiente
        ? `Estás ${d.excedente} arriba del tope de la ${d.categoria}. Lo que corresponde es pasarte a la ${d.categoriaSiguiente} en la próxima recategorización. Es un trámite, no un problema.`
        : `Estás ${d.excedente} arriba del tope más alto del monotributo. Conviene hablar con un contador para ver el paso siguiente con tiempo.`,
      cta: d.categoriaSiguiente ? "Ver qué cambia" : "Entender mis opciones",
    }),
    cobro_atrasado: (d: { cliente: string; monto: string; hace: string }): TextoAlerta => ({
      titulo: `${d.cliente} te debe ${d.monto}`,
      cuerpo: `Venció ${d.hace}. Un mensajito amable suele alcanzar.`,
      cta: "Marcar como cobrado",
    }),
    /** Simulación: al facturar este cobro, cambiás de categoría. */
    pasa_de_categoria: (d: { categoriaNueva: LetraCategoria; cuotaNueva?: string }): TextoAlerta => ({
      titulo: `Este cobro te pasa a la categoría ${d.categoriaNueva}`,
      cuerpo: d.cuotaNueva
        ? `Con este cobro superás el tope actual. En la próxima recategorización tu cuota pasaría a ${d.cuotaNueva} por mes. Podés facturarlo igual; solo queremos que lo sepas antes.`
        : "Con este cobro superás el tope actual. Podés facturarlo igual; solo queremos que lo sepas antes.",
      cta: "Facturar igual",
    }),
  },

  cobros: {
    titulo: "Cobros",
    filtrosAria: "Filtrar cobros",
    filtros: {
      todos: "Todos",
      por_cobrar: "Por cobrar",
      cobrado: "Cobrados",
      atrasado: "Atrasados",
    } as const satisfies Record<FiltroCobros, string>,
    /** Singular, para badges. */
    estado: {
      por_cobrar: "Por cobrar",
      cobrado: "Cobrado",
      atrasado: "Atrasado",
    } as const satisfies Record<EstadoCobro, string>,
    venceHoy: "Vence hoy",
    venceEn: (n: number) => (n === 1 ? "Vence mañana" : `Vence en ${dias(n)}`),
    vencio: (n: number) => (n === 1 ? "Venció ayer" : `Venció hace ${dias(n)}`),
    cobradoEl: (fecha: string) => `Cobrado el ${fecha}`,
    acciones: {
      marcarCobrado: "Marcar como cobrado",
      facturar: "Facturar",
      nuevo: "Nuevo cobro",
      masOpciones: "Más opciones",
    },
    toastCobrado: (cliente: string) => `Listo, ${cliente} marcado como cobrado.`,
    deshacer: "Deshacer",
    sinFactura: "Sin factura",
    facturado: "Facturado",
    conteo: (n: number) => (n === 1 ? "1 cobro" : `${n} cobros`),
  },

  emptyStates: {
    cobros: {
      todos: {
        titulo: "Todo en blanco",
        descripcion: "Cargá tu primer cobro y Tope te avisa cuándo vence y cuánto apartar.",
        cta: "Nuevo cobro",
      },
      por_cobrar: {
        titulo: "Nadie te debe nada",
        descripcion: "No tenés cobros pendientes. Cuando cargues uno, aparece acá.",
        cta: "Nuevo cobro",
      },
      cobrado: {
        titulo: "Todavía no entró nada",
        descripcion: "Cuando marques un cobro como cobrado, lo vas a ver acá.",
        cta: "Ver por cobrar",
      },
      atrasado: {
        titulo: "Todo al día",
        descripcion: "No tenés cobros vencidos. Así da gusto.",
        cta: "Ver todos",
      },
    } as const satisfies Record<FiltroCobros, { titulo: string; descripcion: string; cta: string }>,
    clientes: {
      titulo: "Tus clientes, en un lugar",
      descripcion: "Guardalos una vez y facturales en segundos, estén acá o afuera.",
      cta: "Agregar cliente",
    },
    facturas: {
      titulo: "Ninguna factura todavía",
      descripcion: "Cuando factures desde Tope, o importes las de ARCA, las vas a ver acá.",
      cta: "Facturar",
    },
  },

  proximamente: {
    etiqueta: "Próximamente",
    clientes: {
      titulo: "Clientes",
      descripcion: "Muy pronto vas a poder guardar a tus clientes, de acá y del exterior, y facturarles en un toque.",
    },
    facturas: {
      titulo: "Facturas",
      descripcion: "Muy pronto vas a poder facturar en 30 segundos e importar lo que ya emitiste en ARCA.",
    },
    ajustes: {
      titulo: "Ajustes",
      descripcion: "Muy pronto vas a poder cambiar tu categoría, tus datos y los recordatorios.",
    },
    volver: "Volver al inicio",
  },

  recordatorios: {
    titulo: "Recordatorios de cobro",
    descripcion: "Si un cliente se atrasa, te avisamos para que le escribas. Vos decidís cuándo.",
    activar: "Activar recordatorios",
    porDias: {
      3: {
        titulo: "A los 3 días",
        descripcion: "Un empujoncito amable, por si se le pasó.",
      },
      7: {
        titulo: "A la semana",
        descripcion: "Un recordatorio claro, con el monto y la fecha.",
      },
      15: {
        titulo: "A los 15 días",
        descripcion: "Un último aviso, firme y cordial.",
      },
    },
  },

  errores: {
    generico: {
      titulo: "Algo no salió bien",
      descripcion: "No es tu culpa. Probá de nuevo en un ratito.",
      cta: "Reintentar",
    },
    sinConexion: {
      titulo: "Parece que no hay internet",
      descripcion: "Cuando vuelva la conexión, seguimos donde estabas.",
      cta: "Reintentar",
    },
    noEncontrado: {
      titulo: "Esta página no existe",
      descripcion: "Capaz el link está mal escrito o la movimos.",
      cta: "Volver al inicio",
    },
    cargaDatos: "No pudimos cargar tus datos. Probá de nuevo.",
    campoRequerido: "Completá este campo.",
  },

  tema: {
    ariaGrupo: "Tema de la aplicación",
    ariaToggle: "Cambiar tema",
    claro: "Claro",
    oscuro: "Oscuro",
    sistema: "Como el sistema",
    ariaClaro: "Usar tema claro",
    ariaOscuro: "Usar tema oscuro",
    ariaSistema: "Usar el tema del sistema",
  },

  comun: {
    cargando: "Cargando…",
    cerrar: "Cerrar",
    cancelar: "Cancelar",
    guardar: "Guardar",
    valorDeEjemplo: "Valor de ejemplo, no oficial",
  },
} as const;

export type Copy = typeof copy;
