module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'prettier', 
      'plugin:prettier/recommended', 
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
        "comma-dangle": "warn",
        "max-len":["error", 140],
        "operator-linebreak": "off",
        "class-methods-use-this": "off",
        "eslint-plugin-import/no-cycle": [0, { "maxDepth": 1 }]
    },
    env: {
      jest: true, 
      node: true,
    }
  };