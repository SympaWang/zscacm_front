import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getUserDetailList(grade) {
    if(grade=='全部') grade = null;
    var thisUrl = baseUrl + 'getUserDetailList';
    if(grade != null) thisUrl= thisUrl + "?grade=" + grade;

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