module.exports = {
  title: "",
  description:
    "The documentation for the Escape command-line tools and applications",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  smoothScroll: true,
  patterns: ["**/*.md", "**/*.vue"],
  themeConfig: {
    logo: "/logo.png",
    displayAllHeaders: true,
    sidebar: [
      "",
      "get-started/",
      "examples/",
      "references/"
    ],
    smoothScroll: true
  }
};
