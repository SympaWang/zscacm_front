import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function submitReply(reply) {
    return API({
        method: 'POST',
        data: reply,
        url: baseUrl + 'submitReply',
    })
}

export function getReplyList(discussId) {
    return API({
        method: 'GET',
        url: baseUrl + 'getReplyList?' + 'discussId=' + discussId,
    })
}