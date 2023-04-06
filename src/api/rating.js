import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getUserRating(name) {
    var url = baseUrl + 'rating/user' + '?name=' + name;
    return API({
        method: 'GET',
        url: url,
    })
}

export function getContestUser(id) {
    var url = baseUrl + 'rating/contest' + '?contestId=' + id;
    return API({
        method: 'GET',
        url: url,
    })
}

export function getEndContests() {
    var url = baseUrl + 'endContests';
    return API({
        method: 'GET',
        url: url,
    })
}