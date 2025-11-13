// Конфигурация для Expo (позволяет использовать переменные окружения)
module.exports = {
  expo: {
    name: "CRM Bakhodur",
    slug: "crm-bakhodur-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bakhodur.crm"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.bakhodur.crm",
      versionCode: 1,
      permissions: [],
      // Разрешаем HTTP трафик (для Android 9+)
      usesCleartextTraffic: true
    },
    web: {
      bundler: "metro"
    }
  }
};

