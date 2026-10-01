# Voz de Tope

> Facturá en 30 segundos y nunca más te preocupes por el monotributo.

Tope le habla a un freelancer que quiere trabajar, cobrar y no pensar en ARCA. Hablamos como un amigo que sabe de números: claro, tranquilo, al grano.

Todo el texto de la UI vive en `src/content/copy.ts`. Los formatos de números y fechas, en `src/content/format.ts`. Los componentes no escriben textos propios.

## Principios

1. **El número va primero.** El texto lo acompaña y no compite con él. "Te faltan $ 2.300.000 para el tope" es mejor que un párrafo.
2. **Voseo rioplatense.** Cobraste, tenés, mirá, apartá. Nunca "usted" ni "tú".
3. **Frases cortas.** Una idea por frase. Si un aviso necesita más de dos frases, sobra algo.
4. **Cero jerga contable.** Si un término de ARCA es inevitable, lo explicamos en criollo la primera vez.
5. **Tranquilizar, nunca asustar.** Incluso en rojo decimos qué pasa y qué hacer. Nada de "¡ATENCIÓN!", nada de signos de exclamación alarmistas.
6. **Siempre un próximo paso.** Cada alerta y cada estado vacío termina con algo para hacer (una CTA).
7. **Cálido, no cargoso.** Un "Bien ahí" de vez en cuando suma; tres por pantalla, no.

## Sí / No

| Sí | No |
| --- | --- |
| Vas tranqui | Su situación fiscal es óptima |
| Ojo, te estás acercando | ¡Advertencia! Proximidad al límite |
| Estás al límite. Tranqui, tiene solución | ¡Excediste el tope! Riesgo de exclusión |
| Te faltan $ 2.300.000 para el tope | Margen disponible: 2300000,00 ARS |
| Apartá para impuestos | Provisión de obligaciones tributarias |
| Acme te debe US$ 1.200. Venció hace 4 días | Comprobante impago vencido |
| Algo no salió bien. Probá de nuevo en un ratito | Error 500: Internal Server Error |
| Nadie te debe nada | No hay registros para mostrar |

## Glosario: término ARCA → cómo lo decimos

| ARCA / contable | En Tope |
| --- | --- |
| Ingresos brutos devengados últimos 12 meses | Lo que facturaste en los últimos 12 meses |
| Parámetro máximo de ingresos / límite de categoría | Tope (de tu categoría) |
| Recategorización semestral | Recategorización: cada seis meses revisás si seguís en la categoría correcta (enero y julio) |
| Cuota mensual (impuesto integrado + SIPA + obra social) | Cuota del monotributo (impuesto, jubilación y obra social, todo junto) |
| Exclusión del régimen | No lo nombramos en alertas. Si hace falta: "pasarte al régimen general"; sugerimos hablar con un contador |
| Comprobante / factura C / factura E | Factura (la E es la de clientes del exterior; solo la nombramos si hace falta) |
| CAE | El código que ARCA le da a tu factura para que sea válida |
| Ingresos Brutos (IIBB) | Ingresos Brutos, "un impuesto provincial aparte" |
| Contribuyente | Vos |
| Mis Comprobantes | Tus facturas en ARCA |

Decimos **ARCA**, nunca AFIP.

## Números y fechas

- **Pesos:** `$ 1.234.567` — punto para miles, sin decimales salvo que importen (`$ 1.234,50`). Espacio duro entre símbolo y número.
- **Dólares:** `US$ 1.234`. Nunca `USD 1234`, `U$S` ni `$` solo para dólares.
- **Porcentaje:** pegado, `82%`. Con decimal, coma: `82,5%`.
- **Fechas absolutas:** `15 de octubre`. Si no es el año en curso: `15 de octubre de 2025`. Nunca `15/10` en textos.
- **Meses:** largo `marzo`, corto `mar` (en ejes de gráficos). Siempre en minúscula.
- **Fechas relativas** (preferidas cuando están cerca): `hoy`, `mañana`, `ayer`, `en 3 días`, `hace 2 días`.
- Cifras importantes en serif con números tabulares (regla de diseño).
- Los montos se guardan en centavos; formateá siempre con `formatMoney`, nunca a mano.

## Patrones

- **Títulos del semáforo** (serif, grandes): Vas tranqui · Ojo, te estás acercando · Estás al límite.
- **Alertas:** `{ titulo, cuerpo, cta }`. Título = el hecho con el número. Cuerpo = qué significa + qué hacer, en una o dos frases. CTA = verbo en imperativo o acción concreta.
- **Estados vacíos:** título breve y cálido ("Todo al día"), una frase que explica qué va a aparecer, una CTA.
- **Errores:** nunca culpar al usuario, nunca mostrar códigos técnicos.
- **Botones:** verbo + objeto. "Marcar como cobrado", "Nuevo cobro", "Facturar".
- **Mayúsculas:** solo la inicial (estilo oración). Nada en MAYÚSCULAS.
