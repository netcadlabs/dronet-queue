const axios = require('axios');

class WebODMManager {

    static token = null;
    static token_expiration = null;
    static nodes = null;
    // TODO : request url ler config den cekilecek

    ///////////////// webodm related

    static async login() {

        if (WebODMManager.token != null && (Date.now() < WebODMManager.token_expiration)) {
            //console.log('Auth. token exists: ' + this.token);
            return { status: true, data: WebODMManager.token };
        }

        try {
            // TO DO : exposed user details
            let response = await axios.post(new URL('/api/token-auth/', process.env.WEBODM_URL).href, {
                'username': 'admin',
                'password': '123456'
            });

            if (response.status == 200) {
                WebODMManager.token_expiration = new Date();
                // webodm tokes expiration comes from webodm settings file
                WebODMManager.token_expiration.setHours(WebODMManager.token_expiration.getHours() + 6);
                WebODMManager.token = response.data.token;

                return { status: true, data: WebODMManager.token };
            } else return { status: false, data: response };

            //console.log('Login to WebODM is successful : ' + this.token);
        } catch (error) {
            console.error(error);
            return { status: false, data: error };
        }

    }


    static async details_of_task(project_id, task_id) {

        try {
            let loginresponse = await WebODMManager.login();
            if (loginresponse.status == false) {
                return { status: false, data: loginresponse };
            }

            let response = await axios.get(new URL('/api/projects/' + project_id + '/tasks/' + task_id, process.env.WEBODM_URL).href, {
                headers: {
                    'Authorization': 'JWT ' + WebODMManager.token
                }
            });

            if (response.status == 200) {
                return { status: true, data: response.data };
            } else return { status: false, data: response };

        } catch (error) {
            //console.error(error);
            return { status: false, data: error };
        }
    }

    static async createEmptyTask(project_id, task_name, options) {
        try {
            let loginresponse = await WebODMManager.login();
            if (loginresponse.status == false) {
                return { status: false, data: loginresponse };
            }
            
            // create an empty task with options
            let create_task_config = {
                method: 'post',
                url: new URL('/api/projects/' + project_id + '/tasks/', process.env.WEBODM_URL).href,
                headers: {
                    'Authorization': 'JWT ' + WebODMManager.token
                },
                data: {
                    name: task_name,
                    options: options,
                    auto_processing_node: true,
                    partial: true // to upload images 1 by 1
                }
            };

            let create_task_response = await axios(create_task_config);
            if (create_task_response.status != 201) {
                return { status: false, data: create_task_response };
            }

            let task_id = create_task_response.data.id;
            return { status: true, data: task_id }
        } catch (error) {
            console.log(error);
            return { status: false, data: "" }
        }
    }

}

module.exports = WebODMManager;
