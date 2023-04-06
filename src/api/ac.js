import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getCfUserList(grade) {
    var url = baseUrl + 'ac/cf';
    if(grade != null) url = url + '?grade=' + grade;
    return API({
        method: 'GET',
        url: url,
    })
}

export function getLuoguUserList(grade) {
    var url = baseUrl + 'ac/luogu';
    if(grade != null) url = url + '?grade=' + grade;
    return API({
        method: 'GET',
        url: url,
    })
}

export function getVjUserList(grade) {
    var url = baseUrl + 'ac/vj';
    if(grade != null) url = url + '?grade=' + grade;
    return API({
        method: 'GET',
        url: url,
    })
}