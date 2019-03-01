import { AsyncStorage } from 'react-native';
import { SetVariables, empId } from './Globals';

var access_token = "";

var isLoggedIn = async () => {
    var res = false;
    await AsyncStorage.getItem('@tms:user_data', (err, result) => {
        if (result !== null) {
            access_token = JSON.parse(result)["access_token"];
            if (access_token !== null) {
                if (!empId) {
                    SetVariables(JSON.parse(result));
                }
                res = true;
            }
            else {
                res = false;
            }
        } else {
            res = false;
        }
    });
    return res;
}

var MyFetch = (url, type, data) => {

    if (!isLoggedIn) {
        this.props.navigation.navigate("Login");
        return;
    }

    return fetch(url, {
        method: type,
        body: data,
        headers: { "Authorization": "Bearer " + access_token }
    }).then(handleErrors)
};


var handleErrors = async function (response) {
    if (!response.ok) {
        throw response;
    }
    
    var contentType = response.headers.get('content-type')
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
    } else {
        //if response is not json and mostly empty
        return ({})
    }
}



export { MyFetch, isLoggedIn }