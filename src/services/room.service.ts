import {Gauge, Registry} from 'prom-client';

/**
 * Prometheus 指标服务
 * 负责管理和更新应用指标
 */
export class RoomService {
    private readonly usersEnergyGauge: Gauge<string>;
    private readonly usersStructCountGauge: Gauge<string>;
    private readonly usersCreepCountGauge: Gauge<string>;
    private readonly usersCreepCostCountGauge: Gauge<string>;
    private readonly usersMineralCountGauge: Gauge<string>;
    private readonly screepTypes: Set<string>;
    private readonly screepAllTypes: Set<string>;
    private readonly screepCostMap: Map<string, number>;
    private readonly registry: Registry;
    
    constructor() {
        this.registry = new Registry();
        this.screepTypes = new Set(['creep']);
        this.screepAllTypes = new Set(['creep','tombstone']);
        // Screep 身体部件成本映射
        this.screepCostMap = new Map<string, number>([
            ['move', 50],
            ['work', 100],
            ['carry', 50],
            ['attack', 80],
            ['ranged_attack', 150],
            ['heal', 250],
            ['claim', 600],
            ['tough', 10],
        ]);
        this.usersEnergyGauge = new Gauge({
            name: 'screep_users_energy',
            help: 'Total number of active users energy',
            labelNames: ['userName','room'],
            registers: [this.registry],
        });
        this.usersStructCountGauge = new Gauge({
            name: 'screep_users_struct_count',
            help: 'Total number of active users by StructCount',
            labelNames: ['userName','room','type'],
            registers: [this.registry],
        });
        this.usersCreepCountGauge = new Gauge({
            name: 'screep_users_creep_count',
            help: 'Total number of active users by StructCount',
            labelNames: ['userName','room'],
            registers: [this.registry],
        });
        this.usersCreepCostCountGauge = new Gauge({
            name: 'screep_users_creep_cost_count',
            help: 'Total number of active users by StructCount',
            labelNames: ['userName','room'],
            registers: [this.registry],
        });
        this.usersMineralCountGauge = new Gauge({
            name: 'screep_users_mineral_type_count',
            help: 'Total number of active users by StructCount',
            labelNames: ['userName','room','type'],
            registers: [this.registry],
        });

    }

    /**
     * 获取房间指标专用的 Registry
     */
    getRegistry(): Registry {
        return this.registry;
    }

    /**
     * 更新活跃房间指标
     * @param roomObjs
     */
    updateActiveRooms( roomObjs:Array<any>  ): void {
        this.usersEnergyGauge.reset();
        this.usersStructCountGauge.reset();

        let energyObjs = roomObjs.filter(obj => 'store' in obj && 'energy' in obj.store)
        let mineralsObjs = roomObjs.filter(obj => {
            if('store' in obj && obj.store && typeof obj.store === 'object'){
                // 获取 store 对象的所有键，排除 energy，检查是否还有其他属性
                return Object.keys(obj.store).some(key => key !== 'energy');
            }
            return false;
        })
        let structObjs = roomObjs.filter(obj => !this.screepTypes.has(obj.type));
        let creepObjs = roomObjs.filter(obj => this.screepTypes.has(obj.type));

        for (let energyCount of this.getEnergyCount(energyObjs)) {
            this.usersEnergyGauge
                .labels(energyCount.userName,energyCount.room)
                .set(energyCount.totalEnergy)
        }
        for (let structObj of this.getStructInfo(structObjs)) {
            this.usersStructCountGauge
                .labels(structObj.userName,structObj.room,structObj.structType)
                .set(structObj.totalCount)
        }
        for (let mineralObj of this.getMineralsCount(mineralsObjs)) {
            this.usersMineralCountGauge
                .labels(mineralObj.userName,mineralObj.room,mineralObj.mineralType)
                .set(mineralObj.totalMineral)
        }
        for (let creep of this.getCreepInfo(creepObjs)) {
            this.usersCreepCountGauge
                .labels(creep.userName,creep.room)
                .set(creep.totalCount)
            this.usersCreepCostCountGauge
                .labels(creep.userName,creep.room)
                .set(creep.costCount)
        }
    }

    getMineralsCount( mineralsObjs :any[]){
        // 使用对象作为临时存储
        const grouped: Record<string, {
            room: string;
            userName: string ;
            mineralType: string ;
            totalMineral: number;
        }> = {};

        for (let mineral of mineralsObjs) {
            for (let type of Object.keys(mineral.store)) {
                // 跳过 energy，只统计矿物
                if (type === 'energy') continue;
                
                const mineralType = type || '' ;
                const username = mineral.user?.toString() || '';
                const roomName = mineral.room || '';
                const key = `${username}_${roomName}_${mineralType}`;
                const mineralValue = mineral.store[type] as number || 0;

                if (!grouped[key]) {
                    grouped[key] = {
                        room: roomName,
                        userName: username,
                        mineralType: mineralType,
                        totalMineral: 0
                    };
                }

                grouped[key].totalMineral += mineralValue;
            }
        }

        return Object.values(grouped)
    }

    getEnergyCount( energyObjs :any[]){
        // 使用对象作为临时存储
        const grouped: Record<string, {
            room: string;
            userName: string ;
            totalEnergy: number;
        }> = {};

        for (let energyObj of energyObjs) {
            const energy = energyObj.store?.energy as number || 0;
            const username = energyObj.user?.toString() || '';
            const roomName = energyObj.room || '';
            const key = `${username}_${roomName}`;

            if (!grouped[key]) {
                grouped[key] = {
                    room: roomName,
                    userName: username,
                    totalEnergy: 0
                };
            }

            grouped[key].totalEnergy += energy;
        }

        return Object.values(grouped)
    }


    getStructInfo( structObjs :any[]){
        // 使用对象作为临时存储
        const grouped: Record<string, {
            room: string;
            userName: string ;
            structType: string;
            totalCount: number;
        }> = {};

        for (let struct of structObjs) {
            const type = struct.type as string || '';
            const username = struct.user?.toString() || '';
            const roomName = struct.room || '';
            const key = `${username}_${roomName}_${type}`;

            if (!grouped[key]) {
                grouped[key] = {
                    room: roomName,
                    userName: username,
                    totalCount: 0,
                    structType: type
                };
            }

            grouped[key].totalCount++;
        }

        return Object.values(grouped)
    }

    getCreepInfo( creepObjs :any[]){
        // 使用对象作为临时存储
        const grouped: Record<string, {
            room: string;
            userName: string ;
            totalCount: number;
            costCount: number;
        }> = {};

        for (let creep of creepObjs) {
            const username = creep.user?.toString() || '';
            const roomName = creep.room || '';
            const key = `${username}_${roomName}`;

            // 计算 creep 的总成本
            let creepCost = 0;
            if (creep.body && Array.isArray(creep.body)) {
                for (const bodyPart of creep.body) {
                    const partType = bodyPart.type || '';
                    const cost = this.screepCostMap.get(partType) || 0;
                    creepCost += cost;
                }
            }

            if (!grouped[key]) {
                grouped[key] = {
                    room: roomName,
                    userName: username,
                    totalCount: 0,
                    costCount: 0
                };
            }

            grouped[key].totalCount++;
            grouped[key].costCount += creepCost;
        }

        return Object.values(grouped)
    }
}

