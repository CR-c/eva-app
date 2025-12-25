export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/menu/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/profile/edit/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a1a1a',
    navigationBarTitleText: 'Eva App',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#CCCCCC',
    selectedColor: '#39FF14',
    backgroundColor: '#1a1a1a',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/menu/index',
        text: '菜单',
        iconPath: 'assets/icons/menu.png',
        selectedIconPath: 'assets/icons/menu-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
      },
    ],
  },
})
