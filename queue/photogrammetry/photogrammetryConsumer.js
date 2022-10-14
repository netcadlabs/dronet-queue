/* eslint-disable no-console */
const { handlerFailure, handlerCompleted, handlerStalled } = require('./photogrammetryHandler')
const { connectQueue } = require('../config')

const nameQueue = 'photogrammetry';
const cases = connectQueue(nameQueue)
const numberOfNodes = 1;
const check_interval_time = 20000; // 20 saniye

const DroNetPhotogrammetryQueueManager = require('./DroNetPhotogrammetryQueueManager');
const WebODMManager = require('./DroNetWebODMManager');
/*
  @description initial all job queue for photogrammetry
*/

const processJob = async (job, done) => {
    try {
        /* 
            1 - Kullanıcı görev tanımlar queue'ya eklenir. +
            2 - ProcessJob fonksiyonu ile webodm'e aktarılır. (dronet-api / create_task)
            3 - prepare_task_assets fonk benzeri mantıkla işlem takip edilmelidir. (HERE)
            3 - Process bittikten sonra çıktılar kayıt edilmesi için fonksiyon çağırılır. (dronet-api / prepare_task_assets) - ayrı bir kuyruk tasarımı
            4 - çıktılar beklenmeden yeni process başlatılır.
        */
        console.info(`running job! with id ${job.id}`);

        // send to webODM
        let emptyTaskResult = await DroNetPhotogrammetryQueueManager.create_empty_task(job.data);
        if (emptyTaskResult.status == false) {
            //job.remove();
            done(new Error('Error create_empty_task'));
        }

        job.data.task_id = emptyTaskResult.data;
        // create task 
        let createTaskResult = await DroNetPhotogrammetryQueueManager.create_task(job.data, emptyTaskResult.data);

        let check_interval = setInterval(async () => {
            let odm_task_detail_response = await WebODMManager.details_of_task(job.data.project_id, emptyTaskResult.data);
            if (odm_task_detail_response.status) {
                let task_detail = odm_task_detail_response.data;
                job.data.task_detail = task_detail;

                if (task_detail.status == 40) { // 40 = completed
                    console.log("completed");
                    clearInterval(check_interval);

                    // prepare task asset
                    DroNetPhotogrammetryQueueManager.prepareTaskAssets(job.data, emptyTaskResult.data);
                    /* if (result.status == false) {
                        clearInterval(check_interval);
                        done(new Error('Error prepareTaskAssets'));
                    } */
                    done(null, 'done');
                } else if (task_detail.status == 30 || task_detail.status == 50) {
                    console.log("error");
                    clearInterval(check_interval);

                    // prepare task asset
                    let result = await DroNetPhotogrammetryQueueManager.prepareTaskAssets(job.data, emptyTaskResult.data);
                    if (result.status == false) {
                        clearInterval(check_interval);
                        done(new Error('Error prepareTaskAssets'));
                    }
                    done(null, 'odmerror');
                } else {
                    console.log("devam ediyor");
                    let result = await DroNetPhotogrammetryQueueManager.prepareTaskAssets(job.data, emptyTaskResult.data);
                    if (result.status == false) {
                        clearInterval(check_interval);
                        done(new Error('Error prepareTaskAssets'));
                    }
                }
            } else {
                console.log("error type 2");
                clearInterval(check_interval);
                //job.remove();
                done(null, 'cancel');
            }
            //done(null, 'succes')
        }, check_interval_time);
    } catch (error) {
        console.log(error);
        done(null, error)
        /* job.remove();
        done(null, error) */
        // send error message
    }
}

const initJob = () => {
    console.info('job is working!');
    cases.process('__default__', numberOfNodes, processJob);
    cases.on('failed', handlerFailure);
    cases.on('completed', handlerCompleted);
    cases.on('stalled', handlerStalled);
}

initJob()
