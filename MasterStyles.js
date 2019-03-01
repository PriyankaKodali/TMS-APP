import { StyleSheet } from "react-native";

var MasterStyles = StyleSheet.create({
    TextCenter: {
        textAlign: "center"
    },
    //Form Elements

    inputContainer: {
        marginBottom: 10,
        paddingLeft: 10,
        paddingRight: 10
    },
    label: {
        marginLeft: 5,
        marginBottom: 3,
        color: "#666"
    },
    textInput: {
        borderColor: "#ccc",
        borderWidth: 1,
        width: '100%',
        height: 45,
        borderRadius: 5,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16
    },
    multiLineTextInput: {
        borderColor: "#ccc",
        borderWidth: 1,
        width: '100%',
        minHeight: 100,
        borderRadius: 5,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16
    },
    picker: {
        borderColor: "#ccc",
        borderRadius: 5,
        borderWidth: 1,
        width: '100%'
    },
    errorText: {
        marginLeft: 5,
        marginRight: 5,
        color: "#e57373",
        fontSize: 13
    }, disabled: {
        backgroundColor: "#eee"
    },

    notification:{
      fontWeight: "bold",
      color: "green"    
    },

    // Colors
    White: {
        color: "#fff"
    },

    open: {
        backgroundColor: 'rgb(255, 230, 230)'
    },
    closed: {
        backgroundColor: "#fff"
    },
    pending: {
        backgroundColor: 'rgb(253, 243, 224)'
    },
    high: {
        color: 'red'
    },
    medium: {
        color: 'orange'
    },
    low: {
        color: 'green'
    }
});

export default MasterStyles;