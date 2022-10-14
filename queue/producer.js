const { connectQueue } = require('./config')

const jobOptions = {
    // jobId, uncoment this line if your want unique jobid
    removeOnComplete: true, // remove job if complete
    delay: 1000, // 1 = 60000 min in ms
    attempts: 3 // attempt if job is error retry 3 times
};

const nameQueue = 'photogrammetry';

const init = async (data) => {
    return await connectQueue(nameQueue).add(data, jobOptions)
}
const countryCode = ['ID', 'RU', 'TR', 'IT']
for (let i = 0; i < countryCode.length; i++) {
    const data = {
        message: `hello from producer i am request to consumer file json country with code ${countryCode[i]}`,
        param: countryCode[i]
    }
    init(data).then(res => {
        console.info(res.data.message)
    })
}

const data2 = {
    message: `hello from producer i am request to consumer file json country with code 1`,
    param: 10
}
init(data2).then(res => {
    console.info(res.data.message)
})