const common = {
  format: ["progress", "json:reports/cucumber/cucumber.json"],
  import: ["tests/acceptance/**/*.ts"],
  paths: ["specs/*/acceptance/*.feature"],
  retry: 0,
  strict: true,
};

export const dry = {
  ...common,
  dryRun: true,
};

export const ready = {
  ...common,
  tags: "not @wip",
};

export default common;
