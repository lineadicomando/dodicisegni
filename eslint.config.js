/**
 * Il linter: regole, non formattazione.
 *
 * Niente formattatore, ed è una scelta (voce 9 del `TODO.md`): i commenti di
 * questo repo sono prosa mandata a capo a mano, e un formattatore che li
 * rifluisse non romperebbe niente e peggiorerebbe tutto. Niente nemmeno dei
 * preset accesi in blocco: ogni regola qui sotto è stata provata sul codice e
 * tenuta perché vede qualcosa che `tsc` e `svelte-check` non vedono. Una
 * regola nuova si aggiunge allo stesso modo, una alla volta.
 *
 * Due famiglie. Le prime sono le regole generali che il compilatore non ha:
 * le promesse lasciate cadere, i confronti che non possono essere veri. Le
 * seconde sono i vincoli di `CLAUDE.md` che finora stavano solo scritti, e che
 * un import dimenticato aggirava senza che nessuno se ne accorgesse.
 */

import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

/** Un import di valore dal motore nel client trascina le effemeridi nel bundle. */
const SOLO_TIPI_DAL_MOTORE = {
  name: '@dodicisegni/core',
  allowTypeImports: true,
  message:
    'Nel client da @dodicisegni/core si importano solo tipi (import type): un import di ' +
    'valore trascina effemeridi e modulo nativo nel bundle del browser. Vedi CLAUDE.md.',
};

/** Il PNG porta un modulo nativo: entra solo da `lib/server`. */
const PNG_SOLO_DAL_SERVER = {
  name: '@dodicisegni/ruota/png',
  message:
    "@dodicisegni/ruota/png porta un modulo nativo: lato web si importa solo da lib/server. " +
    'Vedi CLAUDE.md.',
};

/** Il codice di `apps/web` che gira sul server, e che può quindi importare valori. */
const WEB_SERVER = [
  'apps/web/src/lib/server/**',
  'apps/web/src/routes/**/+server.ts',
  'apps/web/src/**/*.server.ts',
  'apps/web/vite.config.ts',
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.svelte-kit/**',
      'apps/desktop/bundle/**',
      'apps/desktop/release/**',
      'texts/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },

  // Il parser per tutti i file TypeScript e Svelte, con i tipi dove un
  // tsconfig li conosce.
  {
    files: ['**/*.ts', '**/*.svelte'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
    },
    plugins: { svelte },
    processor: 'svelte/svelte',
  },

  // Le regole generali.
  {
    files: ['**/*.ts', '**/*.svelte'],
    rules: {
      'no-constant-binary-expression': 'error',
      'no-self-compare': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['**/*.svelte'],
    rules: {
      // Senza questa, le eccezioni scritte nei commenti HTML di un componente
      // (<!-- eslint-disable-next-line … -->) non vengono lette.
      'svelte/comment-directive': 'error',
      'svelte/no-at-html-tags': 'error',
      'svelte/require-each-key': 'error',
      'svelte/no-unused-svelte-ignore': 'error',
    },
  },

  // I test dei pacchetti non stanno in nessun tsconfig.json: quelli di ruota
  // sono in tsconfig.test.json, che il servizio di progetto non cerca. Niente
  // tipi, quindi niente regole che li chiedono.
  {
    files: ['packages/*/test/**/*.ts'],
    ...tseslint.configs.disableTypeChecked,
  },

  // I vincoli di CLAUDE.md.

  // La catena di calcolo è sincrona: lo stato siderale di Swiss Ephemeris è
  // globale, e il primo await apre una corsa fra richieste con ayanamsa
  // diversi. Oggi il motore non ne ha uno: la regola tiene le cose così.
  {
    files: ['packages/core/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'AwaitExpression',
          message:
            'Niente await nel motore: lo zodiaco siderale è stato globale di Swiss Ephemeris. ' +
            'Vedi CLAUDE.md, «Niente async/await nella catena di calcolo».',
        },
        {
          selector: ':function[async=true]',
          message:
            'Niente funzioni async nel motore: lo zodiaco siderale è stato globale di Swiss ' +
            'Ephemeris. Vedi CLAUDE.md.',
        },
      ],
    },
  },

  // Il disegno e la lettura non vedono il motore, nemmeno i tipi.
  {
    files: ['packages/ruota/src/**/*.ts', 'packages/lettura/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@dodicisegni/core',
              message:
                'ruota e lettura non importano da @dodicisegni/core, nemmeno i tipi: ' +
                'ruota li ridichiara in types.ts, lettura riceve una stringa. Vedi CLAUDE.md.',
            },
          ],
        },
      ],
    },
  },

  // Il client di apps/web: dal motore solo tipi, e il PNG mai.
  {
    files: ['apps/web/src/**/*.ts', 'apps/web/src/**/*.svelte'],
    ignores: [...WEB_SERVER, 'apps/web/src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { paths: [SOLO_TIPI_DAL_MOTORE, PNG_SOLO_DAL_SERVER] },
      ],
    },
  },
  // Le rotte di server e i test possono importare il motore, ma il PNG
  // entra comunque da lib/server.
  {
    files: ['apps/web/src/routes/**/+server.ts', 'apps/web/src/**/*.server.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { paths: [PNG_SOLO_DAL_SERVER] }],
    },
  },
);
