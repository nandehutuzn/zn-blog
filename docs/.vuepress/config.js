module.exports = {
  title: '张宁-个人博客',
  description: '前端、C#、算法、生活......',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    sidebar: 'auto',
    nav: [
      { text: '主页', link: '/' },
      { text: '前端', link: '/frontend/' },
      { text: '.NET', link: '/dotnet/' },
      { text: '算法', link: '/algorithm/' },
      { text: '生活', link: '/life/' },
      { text: 'GitHub', link: 'https://github.com/nandehutuzn/zn-blog' }
    ]
  },
  plugins: [
    // 你可以多次使用这个插件
    [
      'vuepress-plugin-container',
      {
        type: 'right',
        defaultTitle: '',
      },
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'theorem',
        before: info => `<div class="theorem"><p class="title">${info}</p>`,
        after: '</div>',
      },
    ],

    // 这是 VuePress 默认主题使用这个插件的方式
    [
      'vuepress-plugin-container',
      {
        type: 'tip',
        defaultTitle: {
          '/': '',
          '/zh/': '提示',
        },
      },
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'warning',
        defaultTitle: {
          '/': '',
          '/zh/': '警告',
        },
      },
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'danger',
        defaultTitle: {
          '/': '',
          '/zh/': '危险',
        },
      },
    ],
    'vuepress-plugin-nprogress'
  ],
}