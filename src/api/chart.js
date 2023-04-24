import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getUserRating() {
    var url = baseUrl + 'userRating';
    return API({
        method: 'GET',
        url: url,
    })
}