import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getFutureContests() {
    return API({
        method: 'GET',
        url: baseUrl + 'FutureContests'
    })
}

export function getUsers(grade) {
    if(grade=='全部') grade = null;
    var thisUrl = baseUrl + 'users';
    if(grade != null) thisUrl= thisUrl + "?grade=" + grade;

    return API({
        method: 'GET',
        url: thisUrl,
    })
}