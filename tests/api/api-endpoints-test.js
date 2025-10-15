const mysql = require('mysql2/promise');
const EventModel = require('../api/models/EventModel');
const RegistrationModel = require('../api/models/RegistrationModel');

class ApiEndpointsTest {
    constructor() {
        this.eventModel = EventModel;
        this.registrationModel = RegistrationModel;
    }

    async runAllTests() {
        console.log('🧪 开始API端点业务逻辑测试...\n');

        try {
            await this.testEventModel();
            await this.testRegistrationModel();
            await this.testBusinessLogic();
            
            console.log('\n✅ API端点测试完成');
        } catch (error) {
            console.error('❌ API端点测试失败:', error);
        }
    }

    async testEventModel() {
        console.log('1. 测试事件模型...');

        // 测试获取所有事件
        const allEvents = await this.eventModel.getAllEvents();
        if (allEvents.success && allEvents.data.length > 0) {
            console.log(`   ✅ 获取所有事件: 成功 (${allEvents.data.length} 个事件)`);
        } else {
            console.log('   ❌ 获取所有事件: 失败');
        }

        // 测试获取单个事件详情
        const eventDetail = await this.eventModel.getEventById(1);
        if (eventDetail.success && eventDetail.data.event) {
            console.log(`   ✅ 获取事件详情: 成功 (${eventDetail.data.registrations.length} 个注册)`);
        } else {
            console.log('   ❌ 获取事件详情: 失败');
        }

        // 测试删除保护
        const deleteAttempt = await this.eventModel.deleteEvent(1);
        if (!deleteAttempt.success && deleteAttempt.registrationsCount > 0) {
            console.log('   ✅ 删除保护: 有注册记录时阻止删除');
        } else {
            console.log('   ❌ 删除保护: 测试失败');
        }
    }

    async testRegistrationModel() {
        console.log('\n2. 测试注册模型...');

        // 测试创建注册
        const testRegistration = {
            event_id: 2,
            full_name: 'API测试用户',
            email: 'api.test@example.com',
            phone: '0400000000',
            ticket_count: 1
        };

        const createResult = await this.registrationModel.createRegistration(testRegistration);
        if (createResult.success) {
            console.log('   ✅ 创建注册: 成功');
        } else {
            console.log('   ❌ 创建注册: 失败 -', createResult.error);
        }

        // 测试重复注册约束
        const duplicateResult = await this.registrationModel.createRegistration(testRegistration);
        if (!duplicateResult.success && duplicateResult.error.includes('已经注册')) {
            console.log('   ✅ 重复注册约束: 阻止重复注册');
        } else {
            console.log('   ❌ 重复注册约束: 测试失败');
        }

        // 测试获取注册记录
        const registrations = await this.registrationModel.getRegistrationsByEventId(1);
        if (registrations.success) {
            console.log(`   ✅ 获取活动注册: 成功 (${registrations.data.length} 个注册)`);
        } else {
            console.log('   ❌ 获取活动注册: 失败');
        }
    }

    async testBusinessLogic() {
        console.log('\n3. 测试业务逻辑...');

        // 测试票数限制
        const oversellRegistration = {
            event_id: 5, // Children Coding Education - 只有30个位置
            full_name: '压力测试用户',
            email: 'stress.test@example.com',
            ticket_count: 1000 // 远超最大容量
        };

        const oversellResult = await this.registrationModel.createRegistration(oversellRegistration);
        if (!oversellResult.success && oversellResult.error.includes('票数不足')) {
            console.log('   ✅ 票数限制: 阻止超额注册');
        } else {
            console.log('   ❌ 票数限制: 测试失败');
        }

        // 测试活动状态检查
        const inactiveEventRegistration = {
            event_id: 1, // 假设这个活动是活跃的，我们需要先测试一个不存在的活动
            full_name: '状态测试用户',
            email: 'status.test@example.com',
            ticket_count: 1
        };

        // 注意：这里需要先有一个非活跃的活动来测试，这里只是演示逻辑
        console.log('   ⚠️ 活动状态检查: 需要非活跃活动数据来测试');
    }
}

// 运行测试
if (require.main === module) {
    const test = new ApiEndpointsTest();
    test.runAllTests().catch(console.error);
}

module.exports = ApiEndpointsTest;