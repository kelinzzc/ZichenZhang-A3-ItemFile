import { setPageTitle } from '../utils/helpers.js';

class Header {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.nav = document.querySelector('.nav');
        
        this.initialize();
    }

    initialize() {
        // 移动端菜单切换
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.nav.classList.toggle('active');
            });
        }

        // 点击导航链接关闭移动端菜单
        const navLinks = this.nav?.querySelectorAll('.nav-link');
        navLinks?.forEach(link => {
            link.addEventListener('click', () => {
                this.nav.classList.remove('active');
            });
        });

        // 设置活动页面高亮
        this.setActiveNavItem();
    }

    setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = this.nav?.querySelectorAll('.nav-link');
        
        navLinks?.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) || 
                (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html')))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 更新导航栏
    updateNavigation(isAuthenticated = false) {
    }
}

// 初始化头部组件
document.addEventListener('DOMContentLoaded', () => {
    new Header();
});

export { Header };