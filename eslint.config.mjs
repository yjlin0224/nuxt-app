import cspellConfigs from '@cspell/eslint-plugin/configs'
import stylistic from '@stylistic/eslint-plugin'
import prettierConfig from '@vue/eslint-config-prettier'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  cspellConfigs.recommended,
  prettierConfig,
  stylistic.configs.customize({
    // TODO: Add rules that not in customize (shared) configs
    //   https://eslint.style/packages/default
    //   https://eslint.style/packages/ts
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
    arrowParens: true,
    braceStyle: '1tbs',
    blockSpacing: true,
    quoteProps: 'consistent-as-needed',
    commaDangle: 'always-multiline',
  }),
  {
    rules: {
      'prettier/prettier': 'error',
      'import/prefer-default-export': 'off',
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'type',
            'external',
            'object',
            'internal',
            'parent',
            'sibling',
            'index',
            'unknown',
          ],
          'pathGroups': [
            {
              pattern: '@/**/*.vue',
              group: 'internal',
              position: 'after',
            },
          ],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
          'warnOnUnassignedImports': true,
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
      'object-shorthand': [
        'error',
        'always',
        {
          avoidQuotes: false,
          ignoreConstructors: true,
        },
      ],
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
    },
  },
  {
    rules: {
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
          style: {
            lang: 'scss',
          },
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: [
            'script:not([setup])',
            'script[setup]',
            'template',
            'style:not([scoped])',
            'style[scoped]',
            'i18n:not([locale=en])',
            'i18n[locale=en]',
          ],
        },
      ],
      'vue/block-tag-newline': [
        'error',
        {
          singleline: 'always',
          multiline: 'always',
          maxEmptyLines: 0,
        },
      ],
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false,
        },
      ],
      'vue/component-options-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/define-emits-declaration': ['error', 'type-based'],

      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/no-multiple-template-root': 'off',
    },
  },
)
