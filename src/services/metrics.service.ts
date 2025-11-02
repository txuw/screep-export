import {register, type Registry} from 'prom-client';

/**
 * Prometheus 指标服务
 * 负责管理和更新应用指标
 */
export class MetricsService {
    private defaultRegistry: Registry;

    constructor(registry?: Registry) {
        this.defaultRegistry = registry || register;
    }

    /**
     * 获取 Prometheus 格式的指标数据
     * @param customRegistry 可选的自定义 Registry，如果提供则使用该 Registry，否则使用默认的
     * @returns Promise<string> Prometheus 指标字符串
     */
    async getMetrics(customRegistry?: Registry): Promise<string> {
        const targetRegistry = customRegistry || this.defaultRegistry;
        return await targetRegistry.metrics();
    }

    /**
     * 获取指标内容的 Content-Type
     */
    getContentType(): string {
        return register.contentType;
    }
}

