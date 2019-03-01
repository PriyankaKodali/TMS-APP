import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import Loader from '../Loader';
import { ClearVariables } from '../Globals';
import { NavigationActions, StackActions } from 'react-navigation';
import { Toast } from "native-base";


class Logout extends Component {
    constructor(props) {
        super(props);
        this.state = { loading: false }
    }

    componentWillMount() {
        this.checkIfClockedIn();
    }

    async checkIfClockedIn() {
        var clockInTime = null;
        var clockOutTime = null;
        await AsyncStorage.getItem('@tms:user_clock_data', (err, result) => {
            if (result !== null) {
                clockInTime = JSON.parse(result)["clockInTime"];
                clockOutTime = JSON.parse(result)["clockOutTime"];
            }
        });
        if (clockInTime !== null && clockOutTime === null) {
            Toast.show({
                text: "Please clock out before logging out",
                buttonText: 'Okay',
                position: "bottom",
                duration: 10000,
                type: "warning"
            });
            this.props.navigation.navigate("Attendance");
            return;
        }
        else {
            AsyncStorage.removeItem('@tms:user_data', () => {
                ClearVariables();
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Login' })
                    ]
                }))
            });
        }
    }

    render() {
        return (
            <Loader loading={this.state.loading} />
        );
    }

}
export default Logout;
