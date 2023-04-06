import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getMessageList(userId, currentPage) {
    return API({
        method: 'GET',
        url: baseUrl + 'getMessage?' + 'userId=' + userId + '&currentPage=' + (currentPage - 1),
    })
}