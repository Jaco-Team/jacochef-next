/** @type { import('@storybook/nextjs').StorybookConfig } */
const config = {
  stories: ["../design-system/**/*.stories.@(js|jsx|mjs)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
