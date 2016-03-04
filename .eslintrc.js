module.exports = {
  env: {
    node: true,
    es6: true
  },
  extends: "airbnb/base",
  rules: {
    // Override any settings from the "parent" configuration
    quotes: [2, "single"],
    "no-var": [2]
  },
  plugins: [
    "react"
  ]
};
