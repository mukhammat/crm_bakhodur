<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo/Brand -->
      <div class="header-brand">
        <h1 class="brand-title">{{ msg }}</h1>
      </div>

      <!-- Navigation Menu -->
      <nav class="header-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a href="#" class="nav-link">Главная</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">О нас</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">Услуги</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">Контакты</a>
          </li>
        </ul>
      </nav>

      <!-- User Actions -->
      <div class="header-actions">
        <button class="btn btn-outline">Войти</button>
        <button class="btn btn-primary">Регистрация</button>
      </div>

      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <nav class="mobile-nav" :class="{ 'mobile-nav--open': isMobileMenuOpen }">
      <ul class="mobile-nav-list">
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">Главная</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">О нас</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">Услуги</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">Контакты</a>
        </li>
        <li class="mobile-nav-item">
          <button class="btn btn-outline mobile-btn">Войти</button>
        </li>
        <li class="mobile-nav-item">
          <button class="btn btn-primary mobile-btn">Регистрация</button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

defineProps<{
  msg: string,
  isMobileMenuOpen: boolean,
  toggleMobileMenu: () => void
}>()


// Экспортируем для использования в template
defineExpose({
  toggleMobileMenu
})
</script>

<style scoped>
.app-header {
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  height: 70px;
}

.header-brand {
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.header-nav {
  display: flex;
  flex: 1;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #3498db;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  border: 2px solid transparent;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border-color: #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

.btn-primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  gap: 4px;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #333;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-nav {
  display: none;
  background: white;
  border-top: 1px solid #eee;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-nav--open {
  max-height: 400px;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 1rem 2rem;
}

.mobile-nav-item {
  margin-bottom: 1rem;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 0;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.mobile-btn {
  width: 100%;
  margin-top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }
  
  .header-nav,
  .header-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-nav {
    display: block;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 1.25rem;
  }
  
  .header-container {
    height: 60px;
  }
}
</style>