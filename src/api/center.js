import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getUserDetail(uid) {
    var thisUrl = baseUrl + 'getUserDetail';
    thisUrl= thisUrl + "?uid=" + uid;

    return API({
        method: 'GET',
        url: thisUrl
    })
}

export function updateUserDetail(user) {
    var thisUrl = baseUrl + 'updateUserDetail';
    return API({
        method: 'POST',
        data: user,
        url: thisUrl
    })
}