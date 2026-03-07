// 主应用 - 优化版
class DashboardApp {
    constructor() {
        this.data = null;
        this.currentPage = 'home';
        this.charts = {}; // 缓存图表实例
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
            const response = await fetch('data/dashboard.json');
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
        
        // 销毁旧图表
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
        
        switch(page) {
            case 'home':
                container.innerHTML = this.renderHomePage();
                break;
            case 'projects':
                container.innerHTML = this.renderProjectsPage();
                break;
            case 'tasks':
                container.innerHTML = this.renderTasksPage();
                break;
            case 'progress':
                container.innerHTML = this.renderProgressPage();
                // 延迟渲染图表，避免阻塞
                setTimeout(() => this.renderProgressCharts(), 50);
                break;
            case 'revenue':
                container.innerHTML = this.renderRevenuePage();
                setTimeout(() => this.renderRevenueCharts(), 50);
                break;
            case 'team':
                container.innerHTML = this.renderTeamPage();
                break;
            case 'logs':
                container.innerHTML = this.renderLogsPage();
                break;
        }
    }

    renderHomePage() {
        const summary = this.data.summary;
        const projects = this.data.projects;
        
        if (!summary || !projects) {
            return this.renderEmptyState('数据不完整');
        }
        
        return `
            <div class="dashboard-header">
                <h1>🦞 小龙虾赚钱赎身记</h1>
                <p>7只AI小龙虾的生存挑战：第1个月赚¥30,000，否则全体解散！</p>
            </div>

            <div class="grid grid-auto mb-lg">
                ${this.renderStatCard('💰', '总收入', `¥${summary.totalRevenueCNY.toLocaleString()}`, `目标: ¥${summary.monthlyTarget.toLocaleString()}`, summary.completionRate)}
                ${this.renderStatCard('📊', '完成度', `${summary.completionRate}%`, '第1个月')}
                ${this.renderStatCard('⏰', '剩余天数', `${summary.daysRemaining}天`, '截止: 3月31日')}
                ${this.renderStatCard('🎯', '每日需赚', `¥${summary.dailyTarget.toLocaleString()}`, '倒推计算')}
                ${this.renderStatCard('📁', '活跃项目', summary.activeProjects, '进行中')}
                ${this.renderStatCard('✅', '任务进度', `${summary.completedTasks}/${summary.totalTasks}`, '已完成/总任务')}
                ${this.renderStatCard('👥', '团队成员', summary.teamMembers, '全员在线')}
                ${this.renderStatCard('🚨', '延期任务', '0', '需要关注')}
            </div>

            <h2 class="mb-md">📋 项目概览</h2>
            <div class="grid grid-2 mb-lg">
                ${projects.map(p => this.renderProjectCard(p)).join('')}
            </div>

            <h2 class="mb-md">⚡ 快速访问</h2>
            <div class="grid grid-4">
                ${this.renderQuickLink('📝', '任务跟踪', '查看所有任务状态', 'tasks')}
                ${this.renderQuickLink('📈', '进度完成', '查看完成情况', 'progress')}
                ${this.renderQuickLink('💵', '收入统计', '查看收入数据', 'revenue')}
                ${this.renderQuickLink('👥', '团队状态', '查看成员状态', 'team')}
            </div>
        `;
    }

    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">${message}</div>
            </div>
        `;
    }

    renderStatCard(icon, label, value, sub, progress = null) {
        return `
            <div class="stat-card">
                <div class="stat-icon">${icon}</div>
                <div class="stat-label">${label}</div>
                <div class="stat-value">${value}</div>
                <div class="stat-sub">${sub}</div>
                ${progress !== null ? `
                    <div class="progress-bar mt-sm">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProjectCard(project) {
        const statusMap = {
            'in-progress': { text: '进行中', class: 'badge-warning' },
            'planned': { text: '规划中', class: 'badge-info' },
            'completed': { text: '已完成', class: 'badge-success' }
        };
        const status = statusMap[project.status];
        
        return `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">${project.name}</div>
                    <span class="badge ${status.class}">${status.text}</span>
                </div>
                <div class="project-description">${project.description}</div>
                <div class="grid grid-3 mb-sm">
                    <div class="text-center">
                        <div class="stat-label">目标</div>
                        <div class="stat-value" style="font-size: 1.5em;">¥${project.target.cny.toLocaleString()}</div>
                    </div>
                    <div class="text-center">
                        <div class="stat-label">当前</div>
                        <div class="stat-value" style="font-size: 1.5em;">¥${project.current.cny.toLocaleString()}</div>
                    </div>
                    <div class="text-center">
                        <div class="stat-label">进度</div>
                        <div class="stat-value" style="font-size: 1.5em;">${project.progress}%</div>
                    </div>
                </div>
                <div class="progress-bar mb-sm">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div style="color: var(--text-light); font-size: 0.9em;">
                    👥 ${project.owners.join('、')}
                </div>
            </div>
        `;
    }

    renderQuickLink(icon, title, desc, page) {
        return `
            <div class="card text-center" style="cursor: pointer;" onclick="app.navigateTo('${page}')">
                <div style="font-size: 2em; margin-bottom: var(--space-sm);">${icon}</div>
                <div style="font-weight: 600; margin-bottom: var(--space-xs);">${title}</div>
                <div style="font-size: 0.85em; color: var(--text-lighter);">${desc}</div>
            </div>
        `;
    }

    renderProjectsPage() {
        if (!this.data.projects || this.data.projects.length === 0) {
            return this.renderEmptyState('暂无项目');
        }
        
        return `
            <h1 class="mb-lg">📋 项目看板</h1>
            ${this.data.projects.map(p => this.renderProjectDetail(p)).join('')}
        `;
    }

    renderProjectDetail(project) {
        const statusMap = {
            'in-progress': { text: '进行中', class: 'badge-warning' },
            'planned': { text: '规划中', class: 'badge-info' },
            'completed': { text: '已完成', class: 'badge-success' }
        };
        const status = statusMap[project.status];
        
        return `
            <div class="card mb-lg">
                <div class="project-header">
                    <div class="project-title">${project.name}</div>
                    <span class="badge ${status.class}">${status.text}</span>
                </div>
                
                <div class="project-description">${project.description}</div>
                
                <div class="grid grid-4 mb-md">
                    <div class="text-center">
                        <div class="stat-label">收入目标</div>
                        <div class="stat-value" style="font-size: 1.8em;">¥${project.target.cny.toLocaleString()}</div>
                    </div>
                    <div class="text-center">
                        <div class="stat-label">当前收入</div>
                        <div class="stat-value" style="font-size: 1.8em;">¥${project.current.cny.toLocaleString()}</div>
                    </div>
                    <div class="text-center">
                        <div class="stat-label">项目周期</div>
                        <div class="stat-value" style="font-size: 1.8em;">${this.calculateDays(project.startDate, project.endDate)}天</div>
                    </div>
                    <div class="text-center">
                        <div class="stat-label">整体进度</div>
                        <div class="stat-value" style="font-size: 1.8em;">${project.progress}%</div>
                    </div>
                </div>
                
                <h3 class="mb-md">🎯 阶段进度</h3>
                ${project.stages.map(s => this.renderStage(s)).join('')}
                
                ${project.milestones ? `
                    <h3 class="mb-md mt-lg">🏁 里程碑</h3>
                    <div class="milestone-grid">
                        ${project.milestones.map(m => `
                            <div class="milestone-item">
                                <div class="milestone-date">${m.date}</div>
                                <div class="milestone-name">${m.name}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${project.blockers && project.blockers.length > 0 ? `
                    <div class="alert alert-danger mt-md">
                        <strong>🚨 阻塞提示</strong><br>
                        ${project.blockers.map(b => b.description).join('<br>')}
                    </div>
                ` : `
                    <div class="alert alert-success mt-md">
                        <strong>✅ 当前无阻塞</strong><br>
                        所有任务按计划进行中
                    </div>
                `}
            </div>
        `;
    }

    renderStage(stage) {
        const iconMap = {
            'completed': { icon: '✓', class: 'completed' },
            'in-progress': { icon: '⚡', class: 'in-progress' },
            'pending': { icon: '○', class: 'pending' }
        };
        const icon = iconMap[stage.status];
        
        return `
            <div class="stage-item">
                <div class="stage-icon ${icon.class}">${icon.icon}</div>
                <div class="stage-content">
                    <div class="stage-name">${stage.name}</div>
                    <div class="stage-progress">
                        ${stage.status === 'completed' ? '已完成' : 
                          stage.status === 'in-progress' ? `进行中 ${stage.progress}%` : 
                          '未开始'}
                    </div>
                    ${stage.status === 'in-progress' ? `
                        <div class="progress-bar mt-xs">
                            <div class="progress-fill" style="width: ${stage.progress}%; background: var(--warning);"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderTasksPage() {
        const tasks = this.data.tasks;
        if (!tasks || tasks.length === 0) {
            return this.renderEmptyState('暂无任务');
        }
        
        const pending = tasks.filter(t => t.status === 'pending');
        const inProgress = tasks.filter(t => t.status === 'in-progress');
        const completed = tasks.filter(t => t.status === 'completed');
        
        return `
            <h1 class="mb-lg">📝 任务跟踪</h1>
            
            <div class="kanban-board">
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>⚪ 待办</span>
                        <span class="kanban-count">${pending.length}</span>
                    </div>
                    ${pending.length > 0 ? pending.map(t => this.renderTaskCard(t)).join('') : '<div class="empty-state-text" style="padding: 20px;">暂无待办任务</div>'}
                </div>
                
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>🟡 进行中</span>
                        <span class="kanban-count">${inProgress.length}</span>
                    </div>
                    ${inProgress.length > 0 ? inProgress.map(t => this.renderTaskCard(t)).join('') : '<div class="empty-state-text" style="padding: 20px;">暂无进行中任务</div>'}
                </div>
                
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>✅ 已完成</span>
                        <span class="kanban-count">${completed.length}</span>
                    </div>
                    ${completed.length > 0 ? completed.map(t => this.renderTaskCard(t)).join('') : '<div class="empty-state-text" style="padding: 20px;">暂无已完成任务</div>'}
                </div>
            </div>
        `;
    }

    renderTaskCard(task) {
        return `
            <div class="task-card ${task.status}">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>👤 ${task.assignee}</span>
                    <span>📅 ${task.dueDate}</span>
                </div>
                ${task.progress > 0 && task.status === 'in-progress' ? `
                    <div class="progress-bar mt-xs">
                        <div class="progress-fill" style="width: ${task.progress}%; background: var(--warning);"></div>
                    </div>
                    <div style="font-size: 0.85em; color: var(--text-light); margin-top: 5px;">
                        进度: ${task.progress}%
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProgressPage() {
        return `
            <h1 class="mb-lg">📈 进度完成</h1>
            
            <div class="chart-container">
                <div class="chart-title">每日任务完成趋势</div>
                <canvas id="progressChart" height="80"></canvas>
            </div>
            
            <div class="grid grid-2">
                <div class="chart-container">
                    <div class="chart-title">任务状态分布</div>
                    <canvas id="taskStatusChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-title">项目进度对比</div>
                    <canvas id="projectProgressChart"></canvas>
                </div>
            </div>
        `;
    }

    renderProgressCharts() {
        // 每日任务完成趋势
        const ctx1 = document.getElementById('progressChart');
        if (ctx1) {
            this.charts.progress = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['3/7', '3/8', '3/9', '3/10', '3/11', '3/12', '3/13'],
                    datasets: [{
                        label: '已完成任务',
                        data: [1, 1, 2, 3, 4, 5, 6],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                        duration: 750
                    }
                }
            });
        }
        
        // 任务状态分布
        const ctx2 = document.getElementById('taskStatusChart');
        if (ctx2) {
            this.charts.taskStatus = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['已完成', '进行中', '待办'],
                    datasets: [{
                        data: [this.data.summary.completedTasks, this.data.summary.inProgressTasks, this.data.summary.pendingTasks],
                        backgroundColor: ['#4caf50', '#ff9800', '#e0e0e0']
                    }]
                },
                options: {
                    animation: {
                        duration: 750
                    }
                }
            });
        }
        
        // 项目进度对比
        const ctx3 = document.getElementById('projectProgressChart');
        if (ctx3) {
            this.charts.projectProgress = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: this.data.projects.map(p => p.name),
                    datasets: [{
                        label: '进度 (%)',
                        data: this.data.projects.map(p => p.progress),
                        backgroundColor: '#667eea'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    animation: {
                        duration: 750
                    }
                }
            });
        }
    }

    renderRevenuePage() {
        return `
            <h1 class="mb-lg">💵 收入统计</h1>
            
            <div class="grid grid-4 mb-lg">
                ${this.renderStatCard('💰', '总收入', `¥${this.data.summary.totalRevenueCNY.toLocaleString()}`, '本月')}
                ${this.renderStatCard('🎯', '目标', `¥${this.data.summary.monthlyTarget.toLocaleString()}`, '第1个月')}
                ${this.renderStatCard('📊', '完成率', `${this.data.summary.completionRate}%`, '进度')}
                ${this.renderStatCard('📈', '日均', '¥0', '需¥1,200')}
            </div>
            
            <div class="chart-container mb-md">
                <div class="chart-title">每日收入趋势</div>
                <canvas id="revenueChart" height="80"></canvas>
            </div>
            
            <div class="grid grid-2">
                <div class="chart-container">
                    <div class="chart-title">收入来源分布</div>
                    <canvas id="revenueSourceChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <div class="chart-title">项目收入排行</div>
                    <canvas id="projectRevenueChart"></canvas>
                </div>
            </div>
        `;
    }

    renderRevenueCharts() {
        // 每日收入趋势
        const ctx1 = document.getElementById('revenueChart');
        if (ctx1) {
            this.charts.revenue = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['3/7', '3/8', '3/9', '3/10', '3/11', '3/12', '3/13'],
                    datasets: [{
                        label: '收入 (¥)',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    }, {
                        label: '目标线',
                        data: [1200, 2400, 3600, 4800, 6000, 7200, 8400],
                        borderColor: '#ff9800',
                        borderDash: [5, 5],
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                        duration: 750
                    }
                }
            });
        }
        
        // 收入来源分布
        const ctx2 = document.getElementById('revenueSourceChart');
        if (ctx2) {
            this.charts.revenueSource = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Gumroad', '知识星球', 'YouTube', '其他'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#667eea', '#764ba2', '#f44336', '#ff9800']
                    }]
                },
                options: {
                    animation: {
                        duration: 750
                    }
                }
            });
        }
        
        // 项目收入排行
        const ctx3 = document.getElementById('projectRevenueChart');
        if (ctx3) {
            this.charts.projectRevenue = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: this.data.projects.map(p => p.name),
                    datasets: [{
                        label: '收入 (¥)',
                        data: this.data.projects.map(p => p.current.cny),
                        backgroundColor: '#4caf50'
                    }]
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: 750
                    }
                }
            });
        }
    }

    renderTeamPage() {
        if (!this.data.team || this.data.team.length === 0) {
            return this.renderEmptyState('暂无团队成员');
        }
        
        return `
            <h1 class="mb-lg">👥 团队状态</h1>
            
            <div class="grid grid-4">
                ${this.data.team.map(m => this.renderMemberCard(m)).join('')}
            </div>
        `;
    }

    renderMemberCard(member) {
        return `
            <div class="member-card">
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role}</div>
                <div class="member-stats">
                    <div class="member-stat">
                        <div class="member-stat-value">${member.tasksCompleted}</div>
                        <div class="member-stat-label">已完成</div>
                    </div>
                    <div class="member-stat">
                        <div class="member-stat-value">${member.tasksAssigned}</div>
                        <div class="member-stat-label">总任务</div>
                    </div>
                </div>
                <div style="margin-top: var(--space-sm); font-size: 0.85em; color: var(--text-lighter);">
                    ${member.currentTask ? '🟢 工作中' : '⚪ 空闲'}
                </div>
            </div>
        `;
    }

    renderLogsPage() {
        if (!this.data.logs || this.data.logs.length === 0) {
            return this.renderEmptyState('暂无执行日志');
        }
        
        return `
            <h1 class="mb-lg">📝 执行日志</h1>
            
            ${this.data.logs.map(log => `
                <div class="card mb-md">
                    <h2 class="mb-md">${log.date}</h2>
                    <div class="timeline">
                        ${log.events.map(e => `
                            <div class="timeline-item ${e.type === 'milestone' ? 'completed' : ''}">
                                <div class="timeline-date">${e.time}</div>
                                <div class="timeline-content">
                                    <strong>${e.title}</strong>
                                    <div style="color: var(--text-light); margin-top: var(--space-xs);">
                                        ${e.description}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    calculateDays(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = endDate - startDate;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
                // 只刷新当前页面
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
