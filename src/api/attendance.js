import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getAttendance(date, grade) {
    if(grade=='全部') grade = null;
    date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours()
    + ':' + date.getMinutes() + ':' + date.getSeconds();
    var thisUrl = baseUrl + 'getAttendance?' + "date=" + date;
    if(grade != null) thisUrl= thisUrl + "&grade=" + grade;

    return API({
        method: 'GET',
        url: thisUrl
    })
}