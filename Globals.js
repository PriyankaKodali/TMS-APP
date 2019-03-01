var access_token = "";
var userName = "";
var roles = "";
var displayName = "";
var orgId = null;
var orgName = "";
var empId = "";

var SetVariables = function (responseJson) {
    access_token = responseJson.access_token;
    userName = responseJson.userName;
    roles = responseJson.roles;
    displayName = responseJson.displayName;
    orgId = parseInt(responseJson.orgId);
    orgName = responseJson.orgName;
    empId = responseJson.empId;
}

var ClearVariables = function () {
    access_token = "";
    userName = "";
    roles = "";
    displayName = "";
    orgId = null;
    orgName = "";
    empId = "";
}

export { SetVariables, ClearVariables, access_token, userName, roles, displayName, orgId, orgName, empId }