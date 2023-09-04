const fs = require('fs');

const START_PERF_LOGS = parseInt(process.env.START_PERF_LOGS || '1000');
const DELAY_OF_PERF_LOGS = parseInt(process.env.DELAY_OF_PERF_LOGS || '10000');
const CPU_LIMIT = parseInt(process.env.CPU_LIMIT || '1');

// Path to the CPU usage file
const cpuUsageFile = '/sys/fs/cgroup/cpu.stat';

// Store the initial CPU usage
var previousUsage = 0;

var cpuUsages = [];
var memoryUsages = [];

export async function logPerformance() {
    console.log("Performance will be logged");

    await sleep(START_PERF_LOGS);
    
    logMeanValues();
    
    previousUsage = readCpuUsage();

    while (true) {
        await sleep(1000);
        const cpuUsage = getCpuUsage();
        const memoryUsage = getMemoryUsage();

        cpuUsages.push(cpuUsage);
        memoryUsages.push(memoryUsage);
    }
}

async function logMeanValues() {
    while (true) {
        await sleep(DELAY_OF_PERF_LOGS);

        const cpuUsagesCopy = [...cpuUsages];
        const averageCpuUsage = cpuUsagesCopy.reduce((partialSum, a) => partialSum + a, 0) / cpuUsagesCopy.length;

        const memoryUsagesCopy = [...memoryUsages];
        const averageMemoryUsage = memoryUsagesCopy.reduce((partialSum, a) => partialSum + a, 0) / memoryUsagesCopy.length;

        console.log("CPU Usage: " + averageCpuUsage);
        console.log("RAM Usage: " + averageMemoryUsage);

    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getCpuUsage() {
    const currentUsage = readCpuUsage();
    if (currentUsage !== null) {
        const cpuUsagePercentage = calculateCpuUsagePercentage(previousUsage, currentUsage);
        previousUsage = currentUsage;
        return cpuUsagePercentage;
    }
}

// Calculate CPU usage percentage for the last second
function calculateCpuUsagePercentage(previousUsage, currentUsage) {
    const usageDelta = currentUsage - previousUsage;
    const cpuPeriodMicroSeconds = 1000000;

    return (usageDelta / (cpuPeriodMicroSeconds * CPU_LIMIT)) * 100;
}

// Function to read CPU usage from the file
function readCpuUsage() {
    try {
        const usage = parseInt(fs.readFileSync(cpuUsageFile).toString().split('\n')[0].split(' ')[1], 10);
        return usage;
    } catch (error) {
        console.error('Error reading CPU usage:', error);
        return null;
    }
}

function getMemoryUsage() {
    const memStatFile = '/sys/fs/cgroup/memory.current';
    const totalMemoryFile = '/sys/fs/cgroup/memory.max';

    const memUsage = parseInt(fs.readFileSync(memStatFile, 'utf-8').trim());
    const totalMemory = parseInt(fs.readFileSync(totalMemoryFile, 'utf-8').trim());
    const memoryPercentage = (memUsage / totalMemory) * 100;

    return memoryPercentage;
}
