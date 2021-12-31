module.exports = {
  title: "",
  description:
    "The documentation of Mookme, a simple and easy-to-use, yet powerful and language agnostic git hook for monorepos.",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  smoothScroll: true,
  patterns: ["**/*.md", "**/*.vue"],
  themeConfig: {
    logo: "/logo.png",
    displayAllHeaders: true,
    nav: [
      { text: "GitHub", link: "https://github.com/Escape-Technologies/mookme"},
      { text: "Changelog", link: "https://github.com/Escape-Technologies/mookme/blob/beta/packages/mookme/CHANGELOG.md"}
    ],
    sidebar: [
      "",
      "get-started/",
      "features/",
      "examples/",
      "references/"
    ],
    smoothScroll: true
  }
};
