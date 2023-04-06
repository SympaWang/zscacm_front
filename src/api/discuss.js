import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function addDiscuss(username, title, msg) {
    return API({
        method: 'POST',
        data: {
            'username': username, 
            'title': title,
            'context': msg,
        },
        url: baseUrl + 'addDiscuss',
    })
}

export function getDiscussList(page) {
    return API({
        method: 'GET',
        url: baseUrl + 'discussList?' +  "currentPage=" + (page - 1),
    })
}