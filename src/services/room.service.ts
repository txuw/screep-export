import {Gauge, Registry} from 'prom-client';

/**
 * Prometheus 指标服务
 * 负责管理和更新应用指标
 */
export class RoomService {
    private readonly usersEnergyGauge: Gauge<string>;
    private readonly resourceTypes: Set<string>;
    private readonly registry: Registry;
    
    constructor() {
        this.registry = new Registry();
        this.resourceTypes = new Set(['spawn','extension','storage']);
        this.usersEnergyGauge = new Gauge({
            name: 'screep_users_energy',
            help: 'Total number of active users by country',
            labelNames: ['userName','room'],
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
    updateActiveRooms( roomObjs : { objs:Array<any>,users:Map<string,string>  }  ): void {
        this.usersEnergyGauge.reset();

        const objs = roomObjs.objs
        const userMap = roomObjs.users

        let energyObjs = objs.filter(obj => 'store' in obj && 'energy' in obj.store)
        for (let energyCount of this.getEnergyCount(energyObjs,userMap)) {
            this.usersEnergyGauge
                .labels(energyCount.userName,energyCount.room)
                .set(energyCount.totalEnergy)
        }
    }


    getEnergyCount( energyObjs :any[],users:Map<string,string>){
        // 使用对象作为临时存储
        const grouped: Record<string, {
            room: string;
            userName: string ;
            totalEnergy: number;
        }> = {};

        for (let energyObj of energyObjs) {
            const energy = energyObj.store?.energy as number || 0;
            const userId = energyObj.user?.toString() || '';
            const roomName = energyObj.room || '';
            const key = `${userId}_${roomName}`;

            if (!grouped[key]) {
                grouped[key] = {
                    room: roomName,
                    userName: users.get(userId) || '',
                    totalEnergy: 0
                };
            }

            grouped[key].totalEnergy += energy;
        }

        return Object.values(grouped)
    }
}

