/* eslint-disable no-console */
const { handlerFailure, handlerCompleted, handlerStalled } = require('./handler')
const { connectQueue } = require('./config')

const nameQueue = 'photogrammetry'
const cases = connectQueue(nameQueue)

const initJob = async () => {
    //await cases.removeJobs('*');
    let jobs = await cases.getJobs();
    //await cases.removeJobs('*');
    //jobs[0].retry();
    console.log(jobs);
}

initJob()
