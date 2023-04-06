import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function login(user) {
    return API({
        method: 'POST',
        data: user,
        url: baseUrl + 'login',
    })
}