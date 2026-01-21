export default {
  pages: [
    'pages/home/index',
    'pages/walking/index',
    'pages/walkSummary/index',
    'pages/walkHistory/index',
    'pages/walkDetail/index',
    'pages/pets/index',
    'pages/addPet/index',
    'pages/addGrowthPhoto/index',
    'pages/growthTimeline/index',
    'pages/growthGallery/index',
    'pages/menu/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/profile/edit/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#25aff4',
    navigationBarTitleText: '遛狗助手',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#64748b',
    selectedColor: '#25aff4',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/pets/index',
        text: '我的爱宠',
        iconPath: 'assets/icons/pets.png',
        selectedIconPath: 'assets/icons/pets-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
      },
    ],
  },
  requiredBackgroundModes: ['location'],
  requiredPrivateInfos: ['getLocation', 'onLocationChange'],
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于记录遛狗轨迹',
    },
  },
}
