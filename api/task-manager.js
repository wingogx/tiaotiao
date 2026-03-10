/**
 * 任务管理 API
 * 基于飞书多维表格
 * 作者：程序员小昭
 * 日期：2026-03-10
 */

class TaskManager {
    constructor() {
        // 飞书多维表格配置
        this.appToken = 'JiMYbqFwraWsXssLVJEcLPnWncg';
        this.tableId = 'tblJ0PYmuc29430I';
        this.baseUrl = 'https://open.feishu.cn/open-apis/bitable/v1';
    }

    /**
     * 创建任务
     * @param {Object} task - 任务对象
     * @returns {Promise<Object>} 创建结果
     */
    async createTask(task) {
        const fields = {
            '任务ID': task.id || `task-${Date.now()}`,
            '任务标题': task.title,
            '任务描述': task.description || '',
            '负责人': task.assignee || '',
            '状态': task.status || 'pending',
            '优先级': task.priority || 'medium',
            '截止日期': task.dueDate ? new Date(task.dueDate).getTime() : null,
            '进度': task.progress || 0,
            '项目': task.project || '',
            '标签': task.tags || []
        };

        // 调用飞书 API
        return await this._callFeishuAPI('create', fields);
    }

    /**
     * 获取任务列表
     * @param {Object} filter - 筛选条件
     * @returns {Promise<Array>} 任务列表
     */
    async listTasks(filter = {}) {
        const conditions = [];
        
        if (filter.assignee) {
            conditions.push({
                field_name: '负责人',
                operator: 'is',
                value: [filter.assignee]
            });
        }
        
        if (filter.status) {
            conditions.push({
                field_name: '状态',
                operator: 'is',
                value: [filter.status]
            });
        }
        
        if (filter.project) {
            conditions.push({
                field_name: '项目',
                operator: 'is',
                value: [filter.project]
            });
        }

        const filterObj = conditions.length > 0 ? {
            conjunction: 'and',
            conditions: conditions
        } : null;

        return await this._callFeishuAPI('list', null, filterObj);
    }

    /**
     * 更新任务
     * @param {string} recordId - 记录ID
     * @param {Object} updates - 更新内容
     * @returns {Promise<Object>} 更新结果
     */
    async updateTask(recordId, updates) {
        const fields = {};
        
        if (updates.status) fields['状态'] = updates.status;
        if (updates.progress !== undefined) fields['进度'] = updates.progress;
        if (updates.assignee) fields['负责人'] = updates.assignee;
        if (updates.description) fields['任务描述'] = updates.description;
        if (updates.dueDate) fields['截止日期'] = new Date(updates.dueDate).getTime();

        return await this._callFeishuAPI('update', fields, null, recordId);
    }

    /**
     * 删除任务
     * @param {string} recordId - 记录ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteTask(recordId) {
        return await this._callFeishuAPI('delete', null, null, recordId);
    }

    /**
     * 获取我的任务
     * @param {string} assignee - 负责人
     * @returns {Promise<Array>} 任务列表
     */
    async getMyTasks(assignee) {
        return await this.listTasks({ assignee });
    }

    /**
     * 获取逾期任务
     * @returns {Promise<Array>} 逾期任务列表
     */
    async getOverdueTasks() {
        const allTasks = await this.listTasks();
        const now = Date.now();
        
        return allTasks.filter(task => {
            const dueDate = task.fields['截止日期'];
            const status = task.fields['状态'];
            return dueDate && dueDate < now && status !== 'completed';
        });
    }

    /**
     * 调用飞书 API（内部方法）
     * @private
     */
    async _callFeishuAPI(action, fields, filter, recordId) {
        // 这里是模拟实现，实际需要通过 OpenClaw 的 feishu_bitable 工具调用
        console.log(`调用飞书 API: ${action}`, { fields, filter, recordId });
        
        // 返回模拟数据
        if (action === 'list') {
            return [
                {
                    record_id: 'rec001',
                    fields: {
                        '任务ID': 'task-001',
                        '任务标题': '示例任务',
                        '负责人': '小昭',
                        '状态': 'in-progress',
                        '进度': 50
                    }
                }
            ];
        }
        
        return { success: true, record_id: recordId || 'rec_new' };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}
