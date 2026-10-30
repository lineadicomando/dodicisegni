/**
 * Le dodici case, per scegliere quella del quesito.
 *
 * Il motore non sceglie la casa: la sceglie chi chiede, dalla domanda, come
 * la sceglieva Lilly. Questo elenco serve a farla scegliere sapendo che cosa
 * ciascuna significa **secondo Lilly**, *Christian Astrology* (1647), libro
 * I, cap. VII, «Of the twelve Houses, their Nature and signification», pp.
 * 50-56. Per ogni casa le significazioni che Lilly elenca per prime, tradotte
 * e nel suo ordine; le membra, i colori e i consignificatori, che non servono
 * a scegliere, restano fuori. Le sue parole stanno nella trascrizione
 * (`texts/occidentale/lilly-christian-astrology-1647/trascrizioni.md`).
 *
 * Non è una descrizione nostra delle case e non è la moderna: la quinta di
 * Lilly ha le taverne e gli ambasciatori, la terza le lettere e i vicini. Chi
 * cerca una casa per una domanda di oggi trova la voce che le somiglia.
 */
export interface CasaLilly {
  numero: number;
  pagina: string;
  temi: string;
}

export const CASE_LILLY: readonly CasaLilly[] = [
  { numero: 1, pagina: '50', temi: 'chi pone la domanda: la sua vita, il suo aspetto, la sua persona' },
  {
    numero: 2,
    pagina: '51-52',
    temi: 'i beni di chi chiede: ricchezza o povertà, beni mobili, denaro prestato, guadagno o perdita',
  },
  {
    numero: 3,
    pagina: '52',
    temi: 'fratelli, sorelle, cugini e parenti, vicini, brevi viaggi, spostamenti, lettere, voci, messaggeri',
  },
  {
    numero: 4,
    pagina: '52-53',
    temi: 'il padre, terre, case, eredità, tesori nascosti, città e castelli, la fine di ogni cosa',
  },
  {
    numero: 5,
    pagina: '53',
    temi: 'i figli, la donna incinta, ambasciatori e messaggeri, banchetti, taverne, spettacoli',
  },
  {
    numero: 6,
    pagina: '53',
    temi: 'servi e lavoranti, affittuari, piccoli animali, la malattia, gli zii paterni',
  },
  {
    numero: 7,
    pagina: '54',
    temi: 'il matrimonio e le domande d\'amore, la persona cercata, i nemici dichiarati, le liti e le cause, i ladri e i furti, i fuggitivi',
  },
  {
    numero: 8,
    pagina: '54-55',
    temi: 'la morte, i beni dei defunti, testamenti e lasciti, la dote, la paura e l\'angoscia',
  },
  {
    numero: 9,
    pagina: '55',
    temi: 'i lunghi viaggi oltre mare, il clero, i sogni e le visioni, i paesi stranieri, i libri e il sapere, i parenti del coniuge',
  },
  {
    numero: 10,
    pagina: '55',
    temi: 're, principi, giudici, magistrati e chi ha autorità, la madre, l\'onore, l\'avanzamento, la professione o il mestiere',
  },
  {
    numero: 11,
    pagina: '56',
    temi: 'gli amici e l\'amicizia, la speranza, la fiducia, la lode o il biasimo di qualcuno',
  },
  {
    numero: 12,
    pagina: '56',
    temi: 'i nemici nascosti, i grandi animali, il dolore, la prigionia, chi trama di nascosto contro i vicini',
  },
];
