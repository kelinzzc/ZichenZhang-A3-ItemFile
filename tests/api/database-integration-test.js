const mysql = require('mysql2/promise');

class DatabaseIntegrationTest {
    constructor() {
        this.config = {
            host: 'localhost',
            user: 'root',
            password: 'your_password', // 替换为实际密码
            database: 'charityevents_db'
        };
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('✅ 数据库连接成功');
            return true;
        } catch (error) {
            console.error('❌ 数据库连接失败:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ 数据库连接已关闭');
        }
    }

    async runAllTests() {
        console.log('🚀 开始A3数据库集成测试...\n');

        if (!await this.connect()) {
            return;
        }

        try {
            await this.testDatabaseStructure();
            await this.testA3BusinessRules();
            await this.testDataIntegrity();
            await this.testViews();
            await this.performanceTest();
            
            console.log('\n🎉 所有测试完成！');
        } catch (error) {
            console.error('❌ 测试过程中出现错误:', error);
        } finally {
            await this.disconnect();
        }
    }

    async testDatabaseStructure() {
        console.log('1. 测试数据库结构...');

        const tests = [
            { name: '组织表', query: 'SELECT COUNT(*) as count FROM organizations', expected: 2 },
            { name: '类别表', query: 'SELECT COUNT(*) as count FROM categories', expected: 6 },
            { name: '活动表', query: 'SELECT COUNT(*) as count FROM events', expected: 10 },
            { name: '注册表', query: 'SELECT COUNT(*) as count FROM registrations', min: 10 }
        ];

        for (const test of tests) {
            try {
                const [rows] = await this.connection.execute(test.query);
                const count = rows[0].count;
                
                if (test.min) {
                    if (count >= test.min) {
                        console.log(`   ✅ ${test.name}: ${count} 条记录 (满足至少${test.min}条要求)`);
                    } else {
                        console.log(`   ❌ ${test.name}: ${count} 条记录 (需要至少${test.min}条)`);
                    }
                } else {
                    if (count === test.expected) {
                        console.log(`   ✅ ${test.name}: ${count} 条记录`);
                    } else {
                        console.log(`   ❌ ${test.name}: ${count} 条记录 (期望: ${test.expected})`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ ${test.name}: 查询失败 - ${error.message}`);
            }
        }
    }

    async testA3BusinessRules() {
        console.log('\n2. 测试A3核心业务规则...');

        // 测试唯一约束
        try {
            const [duplicates] = await this.connection.execute(`
                SELECT event_id, email, COUNT(*) as count 
                FROM registrations 
                GROUP BY event_id, email 
                HAVING count > 1
            `);
            
            if (duplicates.length === 0) {
                console.log('   ✅ 唯一约束: 没有重复的邮箱注册同一活动');
            } else {
                console.log(`   ❌ 唯一约束: 发现 ${duplicates.length} 个重复注册`);
            }
        } catch (error) {
            console.log('   ❌ 唯一约束测试失败:', error.message);
        }

        // 测试注册时间排序
        try {
            const [registrations] = await this.connection.execute(`
                SELECT registration_date 
                FROM registrations 
                WHERE event_id = 1 
                ORDER BY registration_date DESC 
                LIMIT 2
            `);
            
            if (registrations.length >= 2) {
                const first = new Date(registrations[0].registration_date);
                const second = new Date(registrations[1].registration_date);
                
                if (first >= second) {
                    console.log('   ✅ 注册时间排序: 按最新时间倒序排列');
                } else {
                    console.log('   ❌ 注册时间排序: 排序不正确');
                }
            } else {
                console.log('   ⚠️ 注册时间排序: 数据不足，无法测试排序');
            }
        } catch (error) {
            console.log('   ❌ 注册时间排序测试失败:', error.message);
        }

        // 测试经纬度数据
        try {
            const [geoData] = await this.connection.execute(`
                SELECT COUNT(*) as total, 
                       COUNT(latitude) as with_lat, 
                       COUNT(longitude) as with_lng 
                FROM events
            `);
            
            const data = geoData[0];
            if (data.with_lat === data.total && data.with_lng === data.total) {
                console.log('   ✅ 经纬度数据: 所有活动都有完整的坐标数据');
            } else {
                console.log(`   ❌ 经纬度数据: ${data.with_lat}/${data.total} 有纬度, ${data.with_lng}/${data.total} 有经度`);
            }
        } catch (error) {
            console.log('   ❌ 经纬度数据测试失败:', error.message);
        }
    }

    async testDataIntegrity() {
        console.log('\n3. 测试数据完整性...');

        const integrityTests = [
            {
                name: '外键约束 - 注册关联活动',
                query: `SELECT COUNT(*) as invalid FROM registrations r 
                       LEFT JOIN events e ON r.event_id = e.id 
                       WHERE e.id IS NULL`,
                expected: 0
            },
            {
                name: '外键约束 - 活动关联组织',
                query: `SELECT COUNT(*) as invalid FROM events e 
                       LEFT JOIN organizations o ON e.organization_id = o.id 
                       WHERE o.id IS NULL`,
                expected: 0
            },
            {
                name: '外键约束 - 活动关联类别',
                query: `SELECT COUNT(*) as invalid FROM events e 
                       LEFT JOIN categories c ON e.category_id = c.id 
                       WHERE c.id IS NULL`,
                expected: 0
            }
        ];

        for (const test of integrityTests) {
            try {
                const [rows] = await this.connection.execute(test.query);
                const invalidCount = rows[0].invalid;
                
                if (invalidCount === test.expected) {
                    console.log(`   ✅ ${test.name}: 数据完整`);
                } else {
                    console.log(`   ❌ ${test.name}: 发现 ${invalidCount} 个无效关联`);
                }
            } catch (error) {
                console.log(`   ❌ ${test.name}: 测试失败 - ${error.message}`);
            }
        }
    }

    async testViews() {
        console.log('\n4. 测试数据库视图...');

        const views = [
            'event_details_view',
            'registration_details', 
            'event_statistics'
        ];

        for (const view of views) {
            try {
                const [rows] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${view}`);
                console.log(`   ✅ ${view}: 视图可用 (${rows[0].count} 行)`);
            } catch (error) {
                console.log(`   ❌ ${view}: 视图查询失败 - ${error.message}`);
            }
        }
    }

    async performanceTest() {
        console.log('\n5. 性能测试...');

        const performanceTests = [
            { name: '活动列表查询', query: 'SELECT * FROM event_details_view LIMIT 10' },
            { name: '注册记录查询', query: 'SELECT * FROM registration_details LIMIT 10' },
            { name: '活动搜索查询', query: 'SELECT * FROM events WHERE location LIKE "%Sydney%"' }
        ];

        for (const test of performanceTests) {
            try {
                const startTime = Date.now();
                await this.connection.execute(test.query);
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                if (duration < 1000) {
                    console.log(`   ✅ ${test.name}: ${duration}ms (良好)`);
                } else {
                    console.log(`   ⚠️ ${test.name}: ${duration}ms (较慢)`);
                }
            } catch (error) {
                console.log(`   ❌ ${test.name}: 查询失败 - ${error.message}`);
            }
        }
    }
}

// 运行测试
if (require.main === module) {
    const test = new DatabaseIntegrationTest();
    test.runAllTests().catch(console.error);
}

module.exports = DatabaseIntegrationTest;