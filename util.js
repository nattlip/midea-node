const dgram = require('dgram');
const { isVeryVerbose } = require('./util'); // Assuming util.js contains the isVeryVerbose function

const DISCOVERY_MSG = Buffer.from([0x0a, 0x9f, 0xed, 0x23]); // Example message, replace with actual discovery message

const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 3;
const DISCOVERY_PORT = 6445;

const _BROADCAST_RETRIES = DEFAULT_RETRIES;
const _BROADCAST_TIMEOUT = DEFAULT_TIMEOUT;

class MideaDiscovery {
    constructor(cloud = null, maxRetries = _BROADCAST_RETRIES, timeout = _BROADCAST_TIMEOUT) {
        this.cloud = cloud;
        this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.socket.bind(DISCOVERY_PORT);
        this.socket.on('error', (err) => {
            console.error(`Socket error: ${err}`);
            this.socket.close();
        });
        this.knownIps = new Set();
        this.maxRetries = maxRetries;
        this.timeout = timeout;
    }

    collectAppliances(addresses = []) {
        addresses = addresses || [];

        addresses.forEach((addr) => {
            console.debug(`Broadcasting to ${addr}`);
            try {
                if (isVeryVerbose()) {
                    console.debug(`UDP broadcast ${addr}:${DISCOVERY_PORT} ${DISCOVERY_MSG.toString('hex')}`);
                }
                this.socket.send(DISCOVERY_MSG, DISCOVERY_PORT, addr);
            } catch (ex) {
                console.debug(`Unable to send broadcast to: ${addr} cause ${ex}`);
            }
        });

        const scannedAppliances = new Set();
        try {
            this.socket.on('message', (data, rinfo) => {
                const ipAddress = rinfo.address;
                if (!this.knownIps.has(ipAddress)) {
                    console.debug(`Reply from address=${ipAddress} payload=${data.toString('hex')}`);
                    this.knownIps.add(ipAddress);
                    const appliance = new LanDevice(data);
                    if (Appliance.supported(appliance.type)) {
                        scannedAppliances.add(appliance);
                    } else {
                        console.debug(`Not supported appliance ${appliance}`);
                    }
                }
            });
        } catch (err) {
            console.error(`Error while scanning for appliances: ${err}`);
        }

        return [...scannedAppliances];
    }

    broadcast(count, addresses, appliances, cloudAppliances, knownCloudAppliances, discoverAll) {
        console.debug(`Broadcast attempt ${count + 1} of max ${this.maxRetries}`);

        const scannedAppliances = this.collectAppliances(addresses);

        scannedAppliances.sort((a, b) => a.applianceId - b.applianceId);
        scannedAppliances.forEach((scanned) => {
            appliances.forEach((appliance) => {
                if (appliance.applianceId === scanned.applianceId) {
                    if (appliance.address !== scanned.address) {
                        console.debug(`Known appliance ${appliance}, data changed ${scanned}`);
                        appliance.update(scanned);
                    }
                }
            });
        });

        if (!discoverAll) {
            this.matchWithCloud(appliances, cloudAppliances, knownCloudAppliances, scanned);
        } else {
            appliances.push(...scannedAppliances);
        }
    }

    matchWithCloud(appliances, cloudAppliances, knownCloudAppliances, scanned) {
        cloudAppliances.forEach((details) => {
            if (matchesLanCloud(scanned, details)) {
                scanned.name = details.name;
                appliances.push(scanned);
                console.debug(`Found appliance ${scanned}`);
                if (knownCloudAppliances.has(details.id)) {
                    knownCloudAppliances.delete(details.id);
                }
            }
        });
    }
}

function addMissingAppliances(cloudAppliances, appliances, count) {
    console.warn(
        `Some appliance(s) where not discovered on local network: ${appliances.length} discovered out of ${count}`
    );
    cloudAppliances.forEach((known) => {
        if (Appliance.supported(known.type)) {
            let found = false;
            appliances.forEach((local) => {
                if (matchesLanCloud(local, known)) {
                    found = true;
                }
            });
            if (!found) {
                const local = new LanDevice({
                    applianceId: known.id,
                    applianceType: known.type,
                    serialNumber: known.sn
                });
                appliances.push(local);
                console.warn(`Unable to discover registered appliance ${JSON.stringify(known)}`);
            }
        }
    });
}

function findAppliances(
    cloud,
    addresses,
    appliances = null,
    maxRetries = DEFAULT_RETRIES,
    timeout = DEFAULT_TIMEOUT
) {
    const discovery = new MideaDiscovery(cloud, maxRetries, timeout);
    appliances = appliances || [];
    console.debug('Starting LAN discovery');
    let cloudAppliances = [];
    let cloudCount = 0;
    let knownCloudAppliances = new Set();
    if (cloud) {
        const discoverAll = false;
        cloudAppliances = cloud.listAppliances();
        cloudCount = cloudAppliances.filter((a) => Appliance.supported(a.type)).length;
        knownCloudAppliances = new Set(cloudAppliances.map((a) => a.id));
    } else {
        const discoverAll = true;
    }
    for (let i = 0; i < maxRetries; i++) {
        discovery.broadcast(
            i,
            addresses,
            appliances,
            cloudAppliances,
            knownCloudAppliances,
            discoverAll
        );
        if (cloud && knownCloudAppliances.size === 0) {
            break;
        }
    }
    if (cloud) {
        console.debug(`Found ${appliances.length} of ${cloudCount} appliance(s)`);
    } else {
        console.debug(`Found ${appliances.length} appliance(s)`);
    }

    if (cloud && appliances.length < cloudCount) {
        addMissingAppliances(cloudAppliances, appliances, cloudCount);
    }
    return appliances;
}
