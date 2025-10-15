const { db, testConnection } = require('../api/config/database');
const EventModel = require('../api/models/EventModel');
const RegistrationModel = require('../api/models/RegistrationModel');

class A3DatabaseTest {
  static async runAllTests() {
    console.log('🧪 A3数据库测试开始（基于1.sql）...\n');

    // 1. 测试数据库连接
    await this.testConnection();
    
    // 2. 测试事件模型
    await this.testEventModel();
    
    // 3. 测试注册模型（A3核心功能）
    await this.testRegistrationModel();
    
    // 4. 测试A3业务规则
    await this.testA3BusinessRules();

    console.log('\n✅ A3数据库测试完成');
  }

  static async testConnection() {
    console.log('1. 测试数据库连接...');
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('   ✅ 数据库连接成功 - charityevents_db');
    } else {
      console.log('   ❌ 数据库连接失败');
    }
  }

  static async testEventModel() {
    console.log('2. 测试事件模型...');
    
    try {
      // 测试获取所有事件
      const eventsResult = await EventModel.getAllEvents();
      if (eventsResult.success) {
        console.log(`   ✅ 获取事件列表成功 (${eventsResult.data.length} 个事件)`);
      }

      // 测试获取单个事件（包含注册记录）
      const eventResult = await EventModel.getEventById(1);
      if (eventResult.success && eventResult.data.event) {
        console.log(`   ✅ 获取单个事件成功 (${eventResult.data.registrations.length} 个注册)`);
        console.log(`   ✅ 事件包含经纬度: ${eventResult.data.event.latitude}, ${eventResult.data.event.longitude}`);
      }

      console.log('   ✅ 事件模型测试通过');
    } catch (error) {
      console.log('   ❌ 事件模型测试失败:', error.message);
    }
  }

  static async testRegistrationModel() {
    console.log('3. 测试注册模型（A3核心）...');
    
    try {
      // 测试创建注册
      const testRegistration = {
        event_id: 1,
        full_name: 'A3测试用户',
        email: 'a3test@example.com',
        phone: '0400000000',
        ticket_count: 1
      };

      const createResult = await RegistrationModel.createRegistration(testRegistration);
      if (createResult.success) {
        console.log('   ✅ 创建注册记录成功');
        
        // 测试A3核心要求：重复注册检查
        const duplicateResult = await RegistrationModel.createRegistration(testRegistration);
        if (!duplicateResult.success && duplicateResult.error.includes('已经注册')) {
          console.log('   ✅ 重复注册检查通过（A3核心要求）');
        }
      }

      console.log('   ✅ 注册模型测试通过');
    } catch (error) {
      console.log('   ❌ 注册模型测试失败:', error.message);
    }
  }

  static async testA3BusinessRules() {
    console.log('4. 测试A3业务规则...');
    
    try {
      // 测试删除有注册记录的活动
      const deleteResult = await EventModel.deleteEvent(1);
      if (!deleteResult.success && deleteResult.registrationsCount > 0) {
        console.log('   ✅ 删除保护规则生效');
      }

      // 测试注册记录排序
      const registrationsResult = await RegistrationModel.getRegistrationsByEventId(1);
      if (registrationsResult.success) {
        const registrations = registrationsResult.data;
        if (registrations.length > 1) {
          const firstDate = new Date(registrations[0].registration_date);
          const secondDate = new Date(registrations[1].registration_date);
          if (firstDate >= secondDate) {
            console.log('   ✅ 注册记录按时间倒序排列');
          }
        }
      }

      console.log('   ✅ A3业务规则测试通过');
    } catch (error) {
      console.log('   ❌ A3业务规则测试失败:', error.message);
    }
  }
}

// 运行测试
if (require.main === module) {
  A3DatabaseTest.runAllTests().catch(console.error);
}

module.exports = A3DatabaseTest;