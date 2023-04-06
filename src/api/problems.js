import API from "../utils/axios"
const baseUrl = "http://localhost:8848/";

export function getProblemList(form, currentPage, sysUser, grade) {
    if(grade == '全部') grade = null;
    var problemUrl = baseUrl + "problemList?currentPage=" + currentPage;
    if(form.problemName != null) problemUrl = problemUrl + "&problemName=" + form.problemName;
    if(form.diff1 != null) problemUrl = problemUrl + "&diff1=" + form.diff1;
    if(form.diff2 != null) problemUrl = problemUrl + "&diff2=" + form.diff2;
    if(form.problemIds != null) problemUrl = problemUrl + "&problemIds=" + form.problemIds;
    if(form.problemType != null) problemUrl = problemUrl + "&problemType=" + encodeURI(form.problemType);
    if(sysUser != null && sysUser != '') problemUrl = problemUrl + "&sysUser=" + sysUser;
    if(grade != null && grade != '') problemUrl = problemUrl + "&grade=" + grade;

    problemUrl = problemUrl + "&submited=" + form.submited;

    problemUrl = problemUrl.replace(/ /g, "%20");
    console.log(problemUrl)

    return API({
        method: 'GET',
        url: problemUrl
    })
}