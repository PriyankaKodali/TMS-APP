let ApiUrl = ""; 

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // ApiUrl = "https://maxmaster.azurewebsites.net/api/"
    ApiUrl= "http://192.168.1.18:45455/"
} else {
    ApiUrl = "https://maxmaster.azurewebsites.net/api/"
}

 
export { ApiUrl };
