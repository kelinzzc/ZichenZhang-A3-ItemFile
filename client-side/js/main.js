/**
 * 客户端初始化脚本
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 慈善活动平台客户端初始化完成');
    
    // 移动端菜单功能
    const mobileMenu = {
        isOpen: false,
        
        toggle: function() {
            this.isOpen = !this.isOpen;
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
            
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active', this.isOpen);
            }
        },
        
        close: function() {
            this.isOpen = false;
            document.body.style.overflow = '';
            
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        }
    };
    
    // 全局暴露移动端菜单功能
    window.toggleMobileMenu = function() {
        mobileMenu.toggle();
    };
    
    // 点击移动端菜单外部关闭菜单
    document.addEventListener('click', function(event) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navbarToggle = document.querySelector('.navbar-toggle');
        
        if (mobileMenu && navbarToggle && 
            !mobileMenu.contains(event.target) && 
            !navbarToggle.contains(event.target) &&
            mobileMenu.classList.contains('active')) {
            window.toggleMobileMenu();
        }
    });
    
    // 阻止移动端菜单内部点击事件冒泡
    const mobileMenuElement = document.querySelector('.mobile-menu');
    if (mobileMenuElement) {
        mobileMenuElement.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // 处理导航链接点击
    document.addEventListener('click', function(event) {
        const target = event.target.closest('a');
        if (target && target.getAttribute('href') && 
            target.getAttribute('href').startsWith('/') &&
            !target.getAttribute('href').startsWith('//')) {
            
            // 如果是移动端菜单中的链接，关闭菜单
            if (target.closest('.mobile-menu')) {
                mobileMenu.close();
            }
        }
    });
    
    // 添加页面加载动画
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        // 页面加载完成后隐藏加载指示器
        window.addEventListener('load', function() {
            setTimeout(function() {
                loadingIndicator.style.opacity = '0';
                setTimeout(function() {
                    loadingIndicator.style.display = 'none';
                }, 300);
            }, 500);
        });
    }
    
    // 错误处理
    window.addEventListener('error', function(event) {
        console.error('JavaScript 错误:', event.error);
    });
    
    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的 Promise 拒绝:', event.reason);
    });
});