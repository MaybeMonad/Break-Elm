module.exports = {
  title: 'Elm 中文手册',
  description: 'Just playing around',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/guide/' },
      { text: '官方', link: 'https://elm-lang.org' },
    ],
    displayAllHeaders: true,
    repo: 'https://github.com/DezineLeo/elm-lang-docs-zh',
    repoLabel: 'GitHub Repo',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    sidebar: [
      {
        title: '关于本文档',
        path: '/guide/',
        collapsable: true,
      },
      {
        title: '简介',
        path: '/guide/introduction',
        collapsable: true,
      },
      {
        title: '安装',
        path: '/guide/install',
        collapsable: true,
      },
      {
        title: '语言核心',
        path: '/guide/core-language',
        collapsable: false,
      },
      {
        title: 'Elm 架构',
        path: '/guide/the-elm-architecture',
        collapsable: false,
      },
      {
        title: '类型',
        path: '/guide/types',
        collapsable: false,
      },
    ],
    sidebarDepth: 1,
  },
}