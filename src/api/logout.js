import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function logout() {
    return API({
        method: 'GET',
        url: baseUrl + 'logout',
    })
}