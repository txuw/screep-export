import {Gauge, register} from 'prom-client';

/**
 * Prometheus 指标服务
 * 负责管理和更新应用指标
 */
export class MetricsService {
    private readonly usersUsedCpuGauge: Gauge<string>;
    private readonly usersTotalCpuGauge: Gauge<string>;
    private readonly usersTotalGCLGauge: Gauge<string>;
    private readonly usersTotalRoomCountGauge: Gauge<string>;
    private readonly usersTotalMoneyGauge: Gauge<string>;

    constructor() {
        this.usersUsedCpuGauge = new Gauge({
            name: 'screep_users_used_cpu',
            help: 'Total number of active users by country',
            labelNames: ['userName'],
        });
        this.usersTotalCpuGauge = new Gauge({
            name: 'screep_users_total_cpu',
            help: 'Total number of active users by country',
            labelNames: ['userName'],
        });
        this.usersTotalGCLGauge = new Gauge({
            name: 'screep_users_GCL',
            help: 'Total number of active users by country',
            labelNames: ['userName'],
        });
        this.usersTotalRoomCountGauge = new Gauge({
            name: 'screep_users_total_room_count',
            help: 'Total number of active users by country',
            labelNames: ['userName'],
        });
        this.usersTotalMoneyGauge = new Gauge({
            name: 'screep_users_total_money',
            help: 'Total number of active users by country',
            labelNames: ['userName'],
        });

    }

    /**
     * 更新活跃用户指标
     * @param users 用户数据数组
     */
    updateActiveUsers(users: Array<{ username?: string; lastUsedCpu?: number; cpu?: number ; gcl?:number; rooms?:Array<String>; money?:number }>): void {
        this.usersUsedCpuGauge.reset();
        this.usersTotalCpuGauge.reset();
        this.usersTotalGCLGauge.reset();
        this.usersTotalRoomCountGauge.reset();
        this.usersTotalMoneyGauge.reset();
        users.forEach((item) => {
            this.usersUsedCpuGauge
                .labels(item.username || 'Unknown')
                .set(item.lastUsedCpu || 0);
            this.usersTotalCpuGauge
                .labels(item.username || 'Unknown')
                .set(item.cpu || 0);
            this.usersTotalGCLGauge
                .labels(item.username || 'Unknown')
                .set(item.gcl || 0); // TODO: Add GCL data to user object
            this.usersTotalRoomCountGauge
                .labels(item.username || 'Unknown')
                .set(item.rooms?.length|| 0);
            this.usersTotalMoneyGauge
                .labels(item.username || 'Unknown')
                .set(item.money || 0); // TODO: Add money data to user object
        });
    }

    /**
     * 获取 Prometheus 格式的指标数据
     * @returns Promise<string> Prometheus 指标字符串
     */
    async getMetrics(): Promise<string> {
        return await register.metrics();
    }

    /**
     * 获取指标内容的 Content-Type
     */
    getContentType(): string {
        return register.contentType;
    }
}

