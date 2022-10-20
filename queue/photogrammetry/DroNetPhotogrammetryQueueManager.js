const axios = require('axios');
const https = require('https');
const WebODMManager = require('./DroNetWebODMManager');

class DroNetPhotogrammetryQueueManager {
    static nameQueue = 'photogrammetry';

    /* 
        type: "photogrammetry", data: {user_id, project_id, task_name, imgfolder, gcpmarkerfile, options, dronexttoken, output_epsg, initialProcess, taskId}
    */
    static async create_empty_task(data) {
        try {
            let result = await WebODMManager.createEmptyTask(data.project_id, data.task_name, data.options);
            if (result.status == false) {
                return { status: false, data: "" }
            }

            return { status: true, data: result.data }
        } catch (error) {
            console.log(error);
            return { status: false, data: "" }
        }
    }

    static async create_task(data, task_id) {
        try {
            const instance = axios.create({
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            });

            let obj = {
                user_id: data.user_id,
                project_id: data.project_id,
                task_name: data.task_name,
                raster_folder: data.raster_folder,
                gcpmarker_file: data.gcpmarker_file,
                initialProcess: data.initialProcess,
                dronexttoken: data.dronexttoken,
                task_id: task_id,
                notificationId: data.notificationId
            };
            let url = process.env.DRONET_API + "/createTask";
            let config = {
                method: 'POST',
                url: url,
                data: obj
            };

            instance.post(config.url, config.data);
            return { status: true, data: "created task" };
        } catch (error) {
            console.log(error);
            return { status: false, data: "" }
        }
    }

    static async prepareTaskAssets(data, task_id) {
        try {
            const instance = axios.create({
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            });

            let obj = {
                dronexttoken: data.dronexttoken,
                drojwttoken: data.drojwttoken,
                user_id: data.user_id,
                project_id: data.project_id,
                task_id: task_id,
                output_epsg: data.output_epsg,
                initialProcess: data.initialProcess,
                imgfolder: data.raster_folder,
                taskId: data.taskId,
                task_detail: data.task_detail,
                notificationId: data.notificationId
            };
            let url = process.env.DRONET_API + "/prepareTaskAssets";
            let config = {
                method: 'POST',
                url: url,
                data: obj
            };

            let result = await instance.post(config.url, config.data);
            return { status: true, data: "prepareTaskAssets" };
        } catch (error) {
            console.log(error);
            return { status: false, data: "" }
        }
    }
}

module.exports = DroNetPhotogrammetryQueueManager;