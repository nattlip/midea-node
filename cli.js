const { ArgumentParser } = require('argparse');
const { unhexlify } = require('binascii');
const { appliance_state, connect_to_cloud, find_appliances } = require('midea_beautiful');
const { AirConditionerAppliance, DehumidifierAppliance } = require('midea_beautiful.appliance');
const { AirConditionerResponse, DehumidifierResponse } = require('midea_beautiful.command');
const { MideaCloud } = require('midea_beautiful.cloud');
const { LanDevice } = require('midea_beautiful.lan');
const { Redacted, veryVerbose } = require('midea_beautiful.util');
const log = require('logging-library'); // Replace 'logging-library' with your logging library

const _COMMON_ARGUMENTS = [
    'account',
    'apiurl',
    'app',
    'appid',
    'appkey',
    'cloud',
    'command',
    'credentials',
    'hmackey',
    'id',
    'iotkey',
    'ip',
    'key',
    'loglevel',
    'no_redact',
    'signkey',
    'verbose',
    'password',
    'proxied',
    'token',
];

const _EXCLUDED_PROPERTIES = ['name'];

let _LOGGER;

function _logsInstall(level, kw = {}) {
    try {
        const module = require(kw.logmodule || 'coloredlogs');
        module.install({ level, ...kw });
    } catch (error) {
        log.basicConfig({ level, ...kw });
    }
}

function _output(appliance, showCredentials = false) {
    console.log(`id ${appliance.serial_number}/${appliance.appliance_id}`);
    console.log(`  id      = ${appliance.appliance_id}`);
    console.log(`  addr    = ${appliance.address || 'Unknown'}`);
    console.log(`  s/n     = ${appliance.serial_number}`);
    console.log(`  model   = ${appliance.model}`);
    console.log(`  ssid    = ${appliance.ssid}`);
    console.log(`  online  = ${appliance.online}`);
    console.log(`  name    = ${appliance.name}`);

    if (DehumidifierAppliance.supported(appliance.type)) {
        const state = appliance.state;
        console.log(`  running = ${state.running}`);
        console.log(`  humid%  = ${state.current_humidity}`);
        console.log(`  target% = ${state.target_humidity}`);
        console.log(`  temp    = ${state.current_temperature}`);
        console.log(`  fan     = ${state.fan_speed}`);
        console.log(`  tank    = ${state.tank_full}`);
        console.log(`  mode    = ${state.mode}`);
        console.log(`  ion     = ${state.ion_mode}`);
        console.log(`  filter  = ${state.filter_indicator}`);
        console.log(`  pump    = ${state.pump}`);
        console.log(`  defrost = ${state.defrosting}`);
        console.log(`  sleep   = ${state.sleep_mode}`);
    } else if (AirConditionerAppliance.supported(appliance.type)) {
        const state = appliance.state;
        console.log(`  running = ${state.running}`);
        console.log(`  target  = ${state.target_temperature}`);
        console.log(`  indoor  = ${state.indoor_temperature}`);
        console.log(`  outdoor = ${state.outdoor_temperature}`);
        console.log(`  fan     = ${state.fan_speed}`);
        console.log(`  mode    = ${state.mode}`);
        console.log(`  purify  = ${state.purifier}`);
        console.log(`  eco     = ${state.eco_mode}`);
        console.log(`  sleep   = ${state.comfort_sleep}`);
        console.log(`  F       = ${state.fahrenheit}`);
    }

    console.log(`  error   = ${appliance.state.error_code}`);
    console.log(`  supports= ${appliance.state.capabilities}`);
    console.log(`  version = ${appliance.version}`);

    if (showCredentials) {
        console.log(`  token   = ${appliance.token}`);
        console.log(`  key     = ${appliance.key}`);
    }
}

function _runDiscoverCommand(args) {
    const appliances = find_appliances({
        appkey: args.appkey,
        account: args.account,
        password: args.password,
        appname: args.app,
        appid: args.appid,
        addresses: args.address,
        hmackey: args.hmackey,
        iotkey: args.iotkey,
        api_url: args.apiurl,
        proxied: args.proxied ? 'v5' : null,
    });

    for (const appliance of appliances) {
        _output(appliance, args.credentials);
    }

    return 0;
}

function _checkIpId(args) {
    if (args.ip && args.id) {
        _LOGGER.error('Both ip address and id provided. Please provide only one');
        return false;
    }
    if (!args.ip && !args.id) {
        _LOGGER.error('Missing ip address or appliance id');
        return false;
    }
    return true;
}

function _runDumpCommand(args) {
    const data = unhexlify(args.payload);
    let appliance;

    if (args.dehumidifier) {
        appliance = new DehumidifierResponse(data);
    } else if (args.airconditioner) {
        appliance = new AirConditionerResponse(data);
    } else {
        return 21;
    }

    for (let i = 0; i < data.length; i++) {
        console.log(`${i}
