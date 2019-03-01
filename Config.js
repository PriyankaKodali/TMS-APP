let ApiUrl = "";
// let ApiUrl = "http://localhost:63069/";
// let ApiUrl = "https://stagingmaxtransliteapi.azurewebsites.net/"

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // ApiUrl = "https://maxmaster.azurewebsites.net/api/"
    ApiUrl= "http://192.168.0.145:45455/"
} else {
    ApiUrl = "https://maxmaster.azurewebsites.net/api/"
}

 
export { ApiUrl };
