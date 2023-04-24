import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function changePassword(uid, oldPassword, newPassword) {
    return API({
        method: 'POST',
        data: {
            'uid': uid, 
            'oldPassword': oldPassword,
            'newPassword': newPassword,
        },
        url: baseUrl + 'changePassword',
    })
}