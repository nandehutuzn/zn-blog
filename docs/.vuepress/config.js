module.exports = {
  title: '张宁-个人博客',
  description: '前端、C#、算法、生活......',
  markdown: {
    lineNumbers: true
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
          '/': 'TIP',
          '/zh/': '提示',
        },
      },
    ],
  ],
}