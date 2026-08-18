module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "off" : "off",
    "unused-imports/no-unused-imports": process.env.NODE_ENV === "production" ? "error" : "warn",
  },
  plugins: ["unused-imports"],
};
