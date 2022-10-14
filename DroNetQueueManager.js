const { connectQueue } = require('./queue/config');

class DroNetQueueManager {

    static jobOptions = {
        removeOnComplete: false, // remove job if complete
    };

    static init = async (data, name) => {
        return await connectQueue(name).add(data, DroNetQueueManager.jobOptions)
    }

    static async addToQueue(data) {
        try {
            /* 
            type: 
                - photogrammetry
            */
            let type = data.type;
            DroNetQueueManager.init(data, type).then(res => {
                console.info(res.data.user_id)
            });
            return { status: true, data: "addToQueue" }
        } catch (error) {
            return { status: false, data: "" }
        }
    }

    /* 
        type: "photogrammetry", data: {user_id, project_id, task_name, imgfolder, gcpmarkerfile, options, dronexttoken, output_epsg, initialProcess, taskId}
    */

    // get number of queue
    // get number of error jobs
    // get active jobs
    static async getQueueData(name) {
        try {
            const cases = connectQueue(name);
            /* let failedJobs = await cases.getJobs(['failed']);
            let activeJobs = await cases.getJobs(['active']);
            let completedJobs = await cases.getJobs(['completed']); */

            let failedJobs = [];
            let activeJobs = await cases.getJobs(['active']);
            let waitingJobs = await cases.getJobs(['waiting']);
            let completedJobs = [];
            let cancelJobs = [];
            let jobs = await cases.getJobs();
            let odmFailedJobs = await cases.getJobs(['failed']);

            for (let i = 0; i < jobs.length; i++) {
                if (jobs[i].returnvalue == 'done') {
                    completedJobs.push(jobs[i]);
                } else if (jobs[i].returnvalue == 'odmerror') {
                    failedJobs.push(jobs[i]);
                } else if (jobs[i].returnvalue == 'cancel') {
                    cancelJobs.push(jobs[i]);
                }
            }

            failedJobs = failedJobs.concat(odmFailedJobs);

            return {
                status: true, data: {
                    activeJobs: activeJobs,
                    activeJobsCount: activeJobs.length,
                    failedJobsCount: failedJobs.length,
                    failedJobs: failedJobs,
                    jobsCount: jobs.length,
                    completedJobs: completedJobs,
                    completedJobsCount: completedJobs.length,
                    cancelJobs: cancelJobs,
                    cancelJobsCount: cancelJobs.length,
                    waitingJobs: waitingJobs,
                    waitingJobsCount: waitingJobs.length
                }
            }
        } catch (error) {
            return { status: false, data: false }
        }
    }

    static async clearFailJobs(name) {
        try {
            const cases = connectQueue(name);
            let jobs = await cases.getJobs(['failed']);
            for (let i = 0; i < jobs.length; i++) {
                jobs[i].remove();
            }
            return {
                status: true, data: "clear Data"
            }
        } catch (error) {
            return { status: false, data: "clear data error" }
        }
    }

    static async pauseJobs(name) {
        try {
            const cases = connectQueue(name);
            await cases.pause(true, true); // isLocal?: boolean, doNotWaitActive?: boolean
            return {
                status: true, data: "pause Data"
            }
        } catch (error) {
            return { status: false, data: "pause data error" }
        }
    }

    static async resumeJobs(name) {
        try {
            const cases = connectQueue(name);
            await cases.resume(true, true); // isLocal?: boolean, doNotWaitActive?: boolean
            return {
                status: true, data: "resume Data"
            }
        } catch (error) {
            return { status: false, data: "resume data error" }
        }
    }

    static async removeJob(data) {
        try {
            const cases = connectQueue(data.name);
            let jobs = await cases.getJobs();
            for (let i = 0; i < jobs.length; i++) {
                if (jobs[i].data.notificationId == data.id) {
                    jobs[i].remove();
                    break
                }
            }

            return { status: true, data: "remove Data" }
        } catch (error) {
            return { status: false, data: "remove data error" }
        }
    }
}

module.exports = DroNetQueueManager;