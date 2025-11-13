const { Database } = require("lucide-react");
const ping = require('ping')

const db = new Database();

async function cctvCameraPing (){
    const [camera] = await db.pool.query(`select * from cameras`);
    for(const cam of camera){
        const cameraPing = await ping.promise.probe(cam.ip_address,{timeout:3})

        if(cameraPing.alive){
            console.log(`Camera ${cam.id} (${cam.ip_address}) is not reachable`);
            if(cam.is_working == 'active'){
                await db.pool.query(`UPDATE cameras SET is_working='inactive', updated_at=CURRENT_TIMESTAMP WHERE id=?`,[cam.id]);
                console.log(`Camera ${cam.id} marked as inactive`);
            }else{
                console.log(`Camera ${cam.id} (${cam.ip_address}) is online`);
                if(cam.is_working=='incative'){
                    await db.pool.query(`UPDATE cameras SET is_working='active',updated_at=CURRENT_TIMESTAMP WHERE id=?`,[cam.id]);
                    console.log(`Camera ${cam.id} marked as active`);
                }

            }
        }
    }
         
}

async function nvrsPing (){
    const [nvrs] = await db.pool.query(`select * from nvrs`);
    for(const nvr of nvrs){
        const nvrsPing = await ping.promise.probe(nvr.ip_address,{timeout:3})

        if(nvrsPing.alive){
            console.log(`nvr ${nvr.id} (${nvr.ip_address}) is not reachable`);
            if(nvr.is_working == 'active'){
                await db.pool.query(`UPDATE nvrs SET is_working='inactive', updated_at=CURRENT_TIMESTAMP WHERE id=?`,[nvr.id]);
                console.log(`nvr ${nvr.id} marked as inactive`);
            }else{
                console.log(`Camera ${nvr.id} (${nvr.ip_address}) is online`);
                if(nvr.is_working=='incative'){
                    await db.pool.query(`UPDATE nvrs SET is_working='active',updated_at=CURRENT_TIMESTAMP WHERE id=?`,[nvr.id]);
                    console.log(`nvr ${nvr.id} marked as active`);
                }

            }
        }
    }
         
}

cctvCameraPing();
nvrsPing();

// Schedule to run every 5 minutes
setInterval(cctvCameraPing, 5 * 60 * 1000);
setInterval(nvrsPing, 5 * 60 * 1000);
