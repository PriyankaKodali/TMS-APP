//import liraries
import React, { Component } from 'react';
import {
    View, Text, Image, StyleSheet, KeyboardAvoidingView,
    TextInput, TouchableOpacity, Button, StatusBar, AsyncStorage
} from 'react-native';
import { Toast,Spinner } from 'native-base';
import Loader from '../Loader';
import { ApiUrl } from '../Config';
import { isLoggedIn } from '../MyAjax';
import { SetVariables } from '../Globals';
import { NavigationActions, StackActions } from 'react-navigation';
import NotifService from './NotifService';

// create a component
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, isLoggedIn: true }
    }

    async componentDidMount() {

        this.setState({ isLoggedIn: await isLoggedIn() }, () => {
            if (this.state.isLoggedIn) {
                new NotifService(this.props.navigation);
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Drawer' })
                    ]
                }))
            }
            else {
                this.setState({ loading: false });
            }
        })
    }

    render() {
        return (
            <KeyboardAvoidingView behavior="height" style={styles.container}>
                {/* <Loader loading={this.state.loading} /> */}
                <View style={styles.loginContainer}>
                    <Image resizeMode="contain" style={styles.logo} source={require('../assets/images/logo.png')} />

                </View>
                {
                    this.state.loading ? <Spinner color='#03a9f4' /> :
                        <View>
                            <View style={styles.formContainer}>
                                <StatusBar barStyle="light-content" />
                                <TextInput style={styles.input}
                                    onSubmitEditing={() => { Toast.toastInstance._root.closeModal(); this.refs.password.focus() }}
                                    returnKeyType="next"
                                    placeholder='Username'
                                    placeholderTextColor='rgba(225,225,225,0.7)'
                                    ref="username"
                                    underlineColorAndroid='rgba(0,0,0,0)'
                                />

                                <TextInput style={styles.input}
                                    returnKeyType="go" ref="password"
                                    placeholder='Password'
                                    placeholderTextColor='rgba(225,225,225,0.7)'
                                    secureTextEntry
                                    onSubmitEditing={this.onButtonPress.bind(this)}
                                    underlineColorAndroid='rgba(0,0,0,0)'
                                />
                                <TouchableOpacity style={styles.buttonContainer} onPress={this.onButtonPress.bind(this)}>
                                    <Text style={styles.buttonText}>LOGIN</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                }
            </KeyboardAvoidingView>
        );
    }

    onButtonPress() {
        if (!this.validate()) {
            return;
        }
        else {
            this.setState({ loading: true });
            var data = {
                username: this.refs.username._lastNativeText,
                password: this.refs.password._lastNativeText,
                grant_type: "password"
            };

            var formBody = [];
            for (var property in data) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(data[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            var url = ApiUrl + "/Token";
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody
            }).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({ loading: false });
                    if (responseJson.error !== undefined) {
                        Toast.show({
                            text: responseJson.error_description,
                            buttonText: 'Okay',
                            position: "top",
                            duration: 10000,
                            type: "danger"
                        })
                    }
                    else {
                        this.onLoginSuccess(responseJson);
                    }
                })
                .catch((error) => {
                    this.setState({ loading: false });
                    Toast.show({
                        text: "An error occoured!",
                        buttonText: 'Okay',
                        position: "top",
                        duration: 10000,
                        type: "danger"
                    })
                });
        }


    }

    validate() {
        Toast.toastInstance._root.closeModal();
        var username = this.refs.username._lastNativeText;
        var password = this.refs.password._lastNativeText;

        if (!username) {
            this.refs.username.focus();
            Toast.show({
                text: 'Invalid Username!',
                buttonText: 'Okay',
                position: "top",
                duration: 10000,
                type: "danger"
            })
            return false;
        }
        else if (!password) {
            this.refs.password.focus()
            Toast.show({
                text: 'Invalid Password!',
                buttonText: 'Okay',
                position: "top",
                duration: 10000,
                type: "danger"
            })
            return false;
        }
        return true;
    }

    async onLoginSuccess(responseJson) {
        try {
            new NotifService(this.props.navigation);
            await AsyncStorage.setItem('@tms:user_data', JSON.stringify(responseJson))
            isLoggedIn()
            SetVariables(responseJson); //update global variable
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Drawer' })
                ]
            }))
        } catch (error) {
            Toast.show({
                text: "An error occoured!",
                buttonText: 'Okay',
                position: "top",
                duration: 10000,
                type: "danger"
            })
        }
    }


}


// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2c3e50',
    },
    loginContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center'
    },
    logo: {
        position: 'absolute',
        width: 300,
        height: 100
    },
    title: {
        color: "#FFF",
        marginTop: 120,
        width: 180,
        textAlign: 'center',
        opacity: 0.9
    },
    formContainer: {
        padding: 20
    },
    input: {
        height: 40,
        backgroundColor: 'rgba(225,225,225,0.2)',
        marginBottom: 10,
        padding: 10,
        color: '#fff'
    },
    buttonContainer: {
        backgroundColor: '#2980b6',
        paddingVertical: 15
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    },
    loginButton: {
        backgroundColor: '#2980b6',
        color: '#fff'
    }
});

//make this component available to the app
export default Login;
