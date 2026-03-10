// 主应用 - v2.0 监控看板版本
class DashboardApp {
    constructor() {
        this.data = null;
        this.currentPage = 'home';
        this.loading = false;
        this.init();
    }

    async init() {
        this.showLoading();
        try {
            await this.loadData();
            this.setupNavigation();
            this.renderPage(this.currentPage);
            this.startAutoRefresh();
        } catch (error) {
            this.showError('初始化失败，请刷新页面重试');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loading = true;
        const container = document.getElementById('app');
        container.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <div class="loading"></div>
                <p style="margin-top: 20px; color: var(--text-lighter);">加载中...</p>
            </div>
        `;
    }

    hideLoading() {
        this.loading = false;
    }

    showError(message) {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="alert alert-danger" style="margin: 40px auto; max-width: 600px;">
                <strong>❌ 错误</strong><br>
                ${message}
            </div>
        `;
    }

    async loadData() {
        try {
            const response = await fetch('dashboard-v2.json');
            if (!response.ok) {
                throw new Error('数据加载失败');
            }
            this.data = await response.json();
            this.updateLastUpdate();
        } catch (error) {
            console.error('加载数据失败:', error);
            throw error;
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    navigateTo(page) {
        if (this.loading) return;
        
        this.currentPage = page;
        
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
        
        // 添加淡出动画
        const container = document.getElementById('app');
        container.style.opacity = '0';
        
        setTimeout(() => {
            this.renderPage(page);
            container.style.opacity = '1';
        }, 150);
    }

    renderPage(page) {
        if (!this.data) {
            this.showError('数据未加载');
            return;
        }

        const container = document.getElementById('app');
        
        switch (page) {
            case 'home':
                container.innerHTML = this.renderMonitoringDashboard();
                break;
            case 'projects':
                container.innerHTML = this.renderProjectsPage();
                break;
            case 'project-detail':
                container.innerHTML = this.renderProjectDetailPage();
                break;
            default:
                container.innerHTML = this.renderEmptyState('页面开发中...');
        }
    }

    // ========== 新版监控看板（P0 核心功能）==========
    
    renderMonitoringDashboard() {
        const todayTasks = this.getTodayTasks();
        const overdueTasks = this.getOverdueTasks();
        const blockedTasks = this.getBlockedTasks();
        const completedToday = this.getCompletedTodayTasks();
        
        return `
            <!-- 1. 今日概览（顶部，大字体醒目）-->
            <div class="monitoring-header">
                <h1>📊 监控看板</h1>
                <p style="color: var(--text-light);">实时监控项目进度与团队状态</p>
            </div>

            <div class="alert-cards">
                ${this.renderAlertCard('🔥', '今日到期', todayTasks.length, 'danger', todayTasks)}
                ${this.renderAlertCard('⚠️', '延期任务', overdueTasks.length, 'warning', overdueTasks)}
                ${this.renderAlertCard('🚫', '阻塞任务', blockedTasks.length, 'danger', blockedTasks)}
                ${this.renderAlertCard('✅', '今日完成', completedToday.length, 'success', completedToday)}
            </div>

            <!-- 2. 项目进度（横向滚动）-->
            <div class="section-header">
                <h2>📋 项目进度</h2>
                <button class="btn btn-sm btn-secondary" onclick="app.navigateTo('projects')">查看全部</button>
            </div>
            
            <div class="project-scroll-container">
                ${this.data.projects.map(p => this.renderProjectProgressCard(p)).join('')}
            </div>

            <!-- 3. 团队状态（网格布局）-->
            <div class="section-header">
                <h2>👥 团队状态</h2>
            </div>
            
            <div class="team-grid">
                ${this.renderTeamStatusCards()}
            </div>
        `;
    }

    // 渲染告警卡片（可点击展开）
    renderAlertCard(icon, label, count, type, tasks) {
        const colorMap = {
            'danger': '#d23838',
            'warning': '#f59e0b',
            'success': '#188f55'
        };
        const color = colorMap[type] || '#666';
        
        return `
            <div class="alert-card alert-${type}" onclick="app.showTaskList('${label}', ${JSON.stringify(tasks).replace(/"/g, '&quot;')})">
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <div class="alert-label">${label}</div>
                    <div class="alert-count" style="color: ${color}">${count}</div>
                </div>
                <div class="alert-arrow">›</div>
            </div>
        `;
    }

    // 渲染项目进度卡片（横向滚动）
    renderProjectProgressCard(project) {
        const statusMap = {
            'in-progress': { text: '进行中', color: '#f59e0b' },
            'planned': { text: '规划中', color: '#2e63d9' },
            'completed': { text: '已完成', color: '#188f55' }
        };
        const status = statusMap[project.status] || statusMap['planned'];
        
        // 计算下一个里程碑
        const nextMilestone = project.stages?.find(s => s.status !== 'completed');
        const milestoneText = nextMilestone ? nextMilestone.name : '无待办里程碑';
        
        return `
            <div class="project-progress-card" onclick="app.showProjectDetail('${project.id}')">
                <div class="project-card-header">
                    <div class="project-card-title">${project.name}</div>
                    <span class="badge" style="background: ${status.color}">${status.text}</span>
                </div>
                
                <div class="progress-bar-large">
                    <div class="progress-fill" style="width: ${project.progress}%; background: ${status.color}"></div>
                    <div class="progress-text">${project.progress}%</div>
                </div>
                
                <div class="project-card-meta">
                    <div class="meta-item">
                        <span class="meta-label">负责人</span>
                        <div class="avatar-group">
                            ${project.owners.map(o => `<div class="avatar" title="${o}">${o[0]}</div>`).join('')}
                        </div>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">下一里程碑</span>
                        <span class="meta-value">${milestoneText}</span>
                    </div>
                </div>
                
                <div class="project-card-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); app.showProjectDetail('${project.id}')" title="查看详情">👁️</button>
                    <button class="btn-icon" onclick="event.stopPropagation(); app.urgeTasks('${project.id}')" title="催办">📢</button>
                    <button class="btn-icon" onclick="event.stopPropagation(); app.updateProgress('${project.id}')" title="更新进度">📝</button>
                </div>
            </div>
        `;
    }

    // 渲染团队状态卡片
    renderTeamStatusCards() {
        const members = this.data.members || [];
        
        if (members.length === 0) {
            return '<div class="empty-state">暂无团队成员数据</div>';
        }
        
        return members.map(member => {
            const tasks = this.getTasksByMember(member.id);
            const statusColor = this.getMemberStatusColor(member.status);
            const lastActive = this.formatLastActive(member.lastActive);
            
            return `
                <div class="team-card">
                    <div class="team-card-header">
                        <div class="avatar-large">${member.name[0]}</div>
                        <div class="status-indicator" style="background: ${statusColor}" title="${member.status}"></div>
                    </div>
                    <div class="team-card-name">${member.name}</div>
                    <div class="team-card-role">${member.role || '成员'}</div>
                    <div class="team-card-stats">
                        <div class="stat-item">
                            <span class="stat-number">${tasks.length}</span>
                            <span class="stat-label">任务</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${tasks.filter(t => t.status === 'completed').length}</span>
                            <span class="stat-label">完成</span>
                        </div>
                    </div>
                    <div class="team-card-active">${lastActive}</div>
                    <button class="btn btn-sm btn-primary btn-block" onclick="app.urgeMember('${member.id}')">📢 催办</button>
                </div>
            `;
        }).join('');
    }

    // ========== 辅助方法 ==========
    
    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.tasks?.filter(t => t.dueDate === today && t.status !== 'completed') || [];
    }

    getOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.tasks?.filter(t => t.dueDate < today && t.status !== 'completed') || [];
    }

    getBlockedTasks() {
        return this.data.tasks?.filter(t => t.status === 'blocked') || [];
    }

    getCompletedTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.tasks?.filter(t => t.completedAt?.startsWith(today)) || [];
    }

    getTasksByMember(memberId) {
        return this.data.tasks?.filter(t => t.assignee === memberId) || [];
    }

    getMemberStatusColor(status) {
        const colorMap = {
            'online': '#188f55',
            'busy': '#f59e0b',
            'offline': '#d23838'
        };
        return colorMap[status] || '#999';
    }

    formatLastActive(timestamp) {
        if (!timestamp) return '未知';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60); // 分钟
        
        if (diff < 5) return '刚刚活跃';
        if (diff < 60) return `${diff}分钟前`;
        if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
        return `${Math.floor(diff / 1440)}天前`;
    }

    // ========== 交互方法 ==========
    
    showTaskList(title, tasks) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${tasks.length === 0 ? '<p>暂无任务</p>' : `
                        <div class="task-list">
                            ${tasks.map(t => `
                                <div class="task-item">
                                    <div class="task-name">${t.name}</div>
                                    <div class="task-meta">
                                        <span>负责人: ${t.assignee}</span>
                                        <span>截止: ${t.dueDate}</span>
                                    </div>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-primary" onclick="app.urgeTasks('${t.projectId}')">催办</button>
                                        <button class="btn btn-sm btn-secondary" onclick="app.showProjectDetail('${t.projectId}')">查看</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showProjectDetail(projectId) {
        this.currentProjectId = projectId;
        this.navigateTo('project-detail');
    }

    urgeTasks(projectId) {
        alert(`催办功能：已向项目 ${projectId} 的负责人发送催办消息`);
        // TODO: 实际实现需要调用后端 API
    }

    urgeMember(memberId) {
        alert(`催办功能：已向成员 ${memberId} 发送催办消息`);
        // TODO: 实际实现需要调用后端 API
    }

    updateProgress(projectId) {
        alert(`更新进度功能：项目 ${projectId}`);
        // TODO: 实际实现需要弹出表单
    }

    // ========== 其他页面（简化版）==========
    
    renderProjectsPage() {
        return `
            <h1>📋 项目列表</h1>
            <p>开发中...</p>
        `;
    }

    renderProjectDetailPage() {
        const project = this.data.projects.find(p => p.id === this.currentProjectId);
        if (!project) {
            return this.renderEmptyState('项目不存在');
        }
        
        const projectTasks = this.data.tasks?.filter(t => t.projectId === project.id) || [];
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const overdueTasks = projectTasks.filter(t => {
            const today = new Date().toISOString().split('T')[0];
            return t.dueDate < today && t.status !== 'completed';
        }).length;
        
        const statusMap = {
            'in-progress': { text: '进行中', color: '#f59e0b' },
            'planned': { text: '规划中', color: '#2e63d9' },
            'completed': { text: '已完成', color: '#188f55' }
        };
        const status = statusMap[project.status] || statusMap['planned'];
        
        return `
            <!-- 返回按钮 -->
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" onclick="app.navigateTo('home')">← 返回监控看板</button>
            </div>
            
            <!-- 项目概览 -->
            <div class="project-detail-header">
                <div class="project-detail-title">
                    <h1>${project.name}</h1>
                    <span class="badge" style="background: ${status.color}">${status.text}</span>
                </div>
                <p class="project-detail-desc">${project.description}</p>
                
                <div class="project-detail-progress">
                    <div class="progress-bar-large">
                        <div class="progress-fill" style="width: ${project.progress}%; background: ${status.color}"></div>
                        <div class="progress-text">${project.progress}%</div>
                    </div>
                </div>
                
                <div class="project-detail-stats">
                    <div class="stat-card">
                        <div class="stat-label">任务完成率</div>
                        <div class="stat-value">${projectTasks.length > 0 ? Math.round(completedTasks / projectTasks.length * 100) : 0}%</div>
                        <div class="stat-sub">${completedTasks}/${projectTasks.length} 已完成</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">延期任务</div>
                        <div class="stat-value" style="color: ${overdueTasks > 0 ? '#d23838' : '#188f55'}">${overdueTasks}</div>
                        <div class="stat-sub">${overdueTasks > 0 ? '需要催办' : '无延期'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">预计完成</div>
                        <div class="stat-value" style="font-size: 1.2em;">${project.endDate}</div>
                        <div class="stat-sub">${this.getDaysRemaining(project.endDate)} 天</div>
                    </div>
                </div>
                
                <div class="project-detail-actions">
                    <button class="btn btn-primary" onclick="app.addTask('${project.id}')">➕ 添加任务</button>
                    <button class="btn btn-secondary" onclick="app.updateProgress('${project.id}')">📝 更新进度</button>
                    <button class="btn btn-secondary" onclick="app.markComplete('${project.id}')">✅ 标记完成</button>
                </div>
            </div>
            
            <!-- 任务列表 -->
            <div class="section-header" style="margin-top: 40px;">
                <h2>📋 任务列表</h2>
                <div class="task-filter">
                    <button class="filter-btn active" onclick="app.filterTasks('all')">全部 (${projectTasks.length})</button>
                    <button class="filter-btn" onclick="app.filterTasks('in-progress')">进行中 (${projectTasks.filter(t => t.status === 'in-progress').length})</button>
                    <button class="filter-btn" onclick="app.filterTasks('pending')">待开始 (${projectTasks.filter(t => t.status === 'pending').length})</button>
                    <button class="filter-btn" onclick="app.filterTasks('completed')">已完成 (${completedTasks})</button>
                </div>
            </div>
            
            <div class="task-list-detail">
                ${projectTasks.length === 0 ? '<div class="empty-state">暂无任务</div>' : 
                    projectTasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
            
            <!-- 里程碑时间轴 -->
            ${project.stages && project.stages.length > 0 ? `
                <div class="section-header" style="margin-top: 40px;">
                    <h2>🎯 里程碑</h2>
                </div>
                
                <div class="milestone-timeline">
                    ${project.stages.map((stage, index) => this.renderMilestone(stage, index === project.stages.length - 1)).join('')}
                </div>
            ` : ''}
        `;
    }
    
    renderTaskCard(task) {
        const statusMap = {
            'completed': { text: '已完成', color: '#188f55', icon: '✅' },
            'in-progress': { text: '进行中', color: '#f59e0b', icon: '🔄' },
            'pending': { text: '待开始', color: '#999', icon: '⏸️' },
            'blocked': { text: '阻塞', color: '#d23838', icon: '🚫' }
        };
        const status = statusMap[task.status] || statusMap['pending'];
        
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = task.dueDate < today && task.status !== 'completed';
        
        return `
            <div class="task-card-detail ${task.status}">
                <div class="task-card-header">
                    <div class="task-status-badge" style="background: ${status.color}">
                        ${status.icon} ${status.text}
                    </div>
                    ${isOverdue ? '<span class="overdue-badge">⚠️ 延期</span>' : ''}
                </div>
                
                <div class="task-card-title">${task.name}</div>
                
                <div class="task-card-meta">
                    <div class="meta-row">
                        <span class="meta-label">负责人</span>
                        <span class="meta-value">${task.assignee}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">截止时间</span>
                        <span class="meta-value ${isOverdue ? 'text-danger' : ''}">${task.dueDate}</span>
                    </div>
                </div>
                
                <div class="task-card-actions">
                    ${task.status !== 'completed' ? `
                        <button class="btn-icon" onclick="app.urgeTasks('${task.projectId}')" title="催办">📢</button>
                        <button class="btn-icon" onclick="app.completeTask('${task.id}')" title="标记完成">✅</button>
                    ` : ''}
                    <button class="btn-icon" onclick="app.editTask('${task.id}')" title="编辑">✏️</button>
                    <button class="btn-icon" onclick="app.deleteTask('${task.id}')" title="删除">🗑️</button>
                </div>
            </div>
        `;
    }
    
    renderMilestone(stage, isLast) {
        const statusMap = {
            'completed': { color: '#188f55', icon: '✅' },
            'in-progress': { color: '#f59e0b', icon: '🔄' },
            'pending': { color: '#ccc', icon: '⏸️' }
        };
        const status = statusMap[stage.status] || statusMap['pending'];
        
        return `
            <div class="milestone-item ${stage.status}">
                <div class="milestone-icon" style="background: ${status.color}">
                    ${status.icon}
                </div>
                <div class="milestone-content">
                    <div class="milestone-name">${stage.name}</div>
                    <div class="milestone-progress">进度: ${stage.progress}%</div>
                </div>
                ${!isLast ? '<div class="milestone-line"></div>' : ''}
            </div>
        `;
    }
    
    getDaysRemaining(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }
    
    // 任务操作方法
    addTask(projectId) {
        alert(`添加任务功能：项目 ${projectId}`);
        // TODO: 实际实现需要弹出表单
    }
    
    markComplete(projectId) {
        alert(`标记完成功能：项目 ${projectId}`);
        // TODO: 实际实现需要确认对话框
    }
    
    filterTasks(filter) {
        alert(`筛选任务：${filter}`);
        // TODO: 实际实现需要更新任务列表显示
    }
    
    completeTask(taskId) {
        alert(`完成任务：${taskId}`);
        // TODO: 实际实现需要调用后端 API
    }
    
    editTask(taskId) {
        alert(`编辑任务：${taskId}`);
        // TODO: 实际实现需要弹出编辑表单
    }
    
    deleteTask(taskId) {
        if (confirm('确定要删除这个任务吗？')) {
            alert(`删除任务：${taskId}`);
            // TODO: 实际实现需要调用后端 API
        }
    }

    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">${message}</div>
            </div>
        `;
    }

    updateLastUpdate() {
        const el = document.getElementById('lastUpdate');
        if (el) {
            el.textContent = new Date().toLocaleString('zh-CN');
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadData().then(() => {
                if (!this.loading) {
                    this.renderPage(this.currentPage);
                }
            }).catch(err => {
                console.error('自动刷新失败:', err);
            });
        }, 30000); // 每30秒刷新
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DashboardApp();
});
