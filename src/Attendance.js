import React, { Component } from 'react';
import {
    Alert, AsyncStorage, StyleSheet,
    TouchableOpacity, View, NetInfo
} from "react-native";
import {
    Body, Button, Container, Content, Header, H3, Icon, Left,
    Right, Title, Text, Toast
} from "native-base";
import moment from 'moment';
import { empId, access_token } from "../Globals";
import { ApiUrl } from "../Config"
import BackgroundGeolocation from './BackgroundLocation';
import BackgroundFetch from "react-native-background-fetch";


class Attendance extends Component {

    constructor(props) {
        super(props);
        this.state = {
            seconds: null, time: "00:00:00", date: null, currentTime: null, IsClockedIn: false,
            clockInTime: null, clockOutTime: null, dayComplete: false, InternetAvailable: true,
            LocationAvailable: true, IsClockInReq: false, IsClockOutReq: false
        }

        this.timer = 0;
        this.currentTimer = 0;
        this.authorizeLocation();
        this.checkConnectivity();
    }

    async componentWillMount() {
        // AsyncStorage.removeItem("@tms:user_clock_data");
        var date = moment([]).format("dddd, MMMM Do YYYY");
        var clockInTime = null;
        var clockOutTime = null;
        var dayComplete = false;
        var seconds = 0;
        var time = "00:00:00"
        await AsyncStorage.getItem('@tms:user_clock_data', (err, result) => {
            if (result !== null) {
                clockInTime = JSON.parse(result)["clockInTime"];
                clockOutTime = JSON.parse(result)["clockOutTime"];
            }
        });
        var isClockedIn = false;
        if (moment([]).isSame(clockInTime, 'day')) {
            if (clockInTime !== null && clockOutTime === null) {
                isClockedIn = true;
                seconds = moment([]).diff(clockInTime, "seconds");
            }
            else if (clockInTime !== null && clockOutTime !== null) {
                dayComplete = true;
                seconds = moment(clockOutTime).diff(clockInTime, "seconds");
                time = this.secondsToTime(seconds);
            }
        }

        this.setState({
            seconds: seconds, time: time, date: date, IsClockedIn: isClockedIn,
            clockInTime: clockInTime, clockOutTime: clockOutTime, dayComplete: dayComplete
        }, () => {
            this.startTimer();
        });

        BackgroundGeolocation.sync();
        BackgroundGeolocation.onHeartbeat((event) => {
            BackgroundGeolocation.getCurrentPosition({
                samples: 1,
                persist: true
            })
        });

        // BackgroundGeolocation.onProviderChange((event) => {
        //     switch (event.status) {
        //         case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
        //             this.setState({ LocationAvailable: false });
        //             break;
        //         case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
        //             this.setState({ LocationAvailable: true });
        //             break;
        //     }
        // });

        BackgroundGeolocation.ready({
            // debug: true,
            reset: true,
            stopTimeout: 1,
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            foregroundService: true,
            // distanceFilter: 1000,
            disableElasticy: true,
            fastestLocationUpdateInterval: 60000,
            heartbeatInterval: 1800,
            autoSync: true,
            url: ApiUrl + '/api/EmployeeLocation/LogLocationData',
            stopOnTerminate: false,
            startOnBoot: true,
            maxDaysToPersist: 14,
            locationTemplate: '{"Latitude":<%= latitude %>,"Longitude":<%= longitude %>,"Time": "<%= timestamp %>"}',
            extras: {
                IsClockIn: false,
                IsClockOut: false,
                EmployeeId: empId
            },
            notificationChannelName: "Augadh TMS App",
            notificationPriority: BackgroundGeolocation.NOTIFICATION_PRIORITY_HIGH,
            notificationText: "Clocked into TMS",
            notificationTitle: "Augadh TMS App",
        });
    }

    configureBackgroundFetch() {
        // [Optional] Configure BackgroundFetch.
        BackgroundFetch.configure({
            minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
            stopOnTerminate: false, // <-- Android-only,
            startOnBoot: true, // <-- Android-only
            enableHeadless: true
        }, async () => {
            BackgroundGeolocation.getCurrentPosition({ persist: true, samples: 1 });
            BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
        }, (error) => {
        });
    }

    checkConnectivity() {
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this.handleFirstConnectivityChange.bind(this)
        );
    }

    handleFirstConnectivityChange(isConnected) {
        this.setState({ InternetAvailable: isConnected })
    }

    authorizeLocation() {
        navigator.geolocation.getCurrentPosition(() => { }, () => { }, { enableHighAccuracy: true });
    }

    startTimer() {
        if (this.state.IsClockedIn) {
            this.timer = setInterval(this.incrementSecond.bind(this), 1000);
        }
        else {
            this.currentTimer = setInterval(() => this.setState({ currentTime: moment([]).format("hh:mm A") }), 1000);
        }
    }

    incrementSecond() {
        var second = this.state.seconds + 1;
        this.setState({ seconds: second, time: this.secondsToTime(second) });
    }

    secondsToTime(secs) {
        let hours = ("0" + Math.floor(secs / (60 * 60))).slice(-2);

        let divisor_for_minutes = secs % (60 * 60);
        let minutes = ("0" + Math.floor(divisor_for_minutes / 60)).slice(-2);

        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = ("0" + Math.ceil(divisor_for_seconds)).slice(-2);

        return hours + ":" + minutes + ":" + seconds;
    }

    render() {
        return (
            <Container>
                <Header hasTabs>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Attendance</Title>
                    </Body>
                    <Right />
                </Header>
                {
                    this.state.InternetAvailable ?
                        <View />
                        :
                        <View style={{ height: 25, backgroundColor: "#ef5350" }}><Text style={{ color: "#fff", lineHeight: 25, textAlign: "center" }}>No Internet Connection</Text></View>
                }
                {
                    this.state.LocationAvailable ?
                        <View />
                        :
                        <TouchableOpacity style={{ height: 25, backgroundColor: "#ef5350" }} onPress={() => this.authorizeLocation()}><Text style={{ color: "#fff", lineHeight: 25, textAlign: "center" }}>Location Service Disabled</Text></TouchableOpacity>
                }
                <Content padder style={{ backgroundColor: "#fff" }}>
                    <H3 style={{ textAlign: "center", marginBottom: 10, marginTop: 20, color: "#737373" }}>{this.state.date}</H3>
                    {
                        this.state.dayComplete ?
                            <View style={{ marginBottom: 20, marginTop: 10, flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ textAlign: "center", marginBottom: 20, fontSize: 40, color: "#737373" }}>{this.state.time}</Text>
                                <Text style={{ textAlign: "center", marginBottom: 10, color: "#737373" }}>Clock In Time : {moment(this.state.clockInTime).format("hh:mm A")}</Text>
                                <Text style={{ textAlign: "center", marginBottom: 10, color: "#737373" }}>Clock Out Time : {moment(this.state.clockOutTime).format("hh:mm A")}</Text>
                            </View>
                            :
                            this.state.IsClockedIn ?
                                <View style={{ marginBottom: 20, marginTop: 10, flex: 1, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ textAlign: "center", marginBottom: 20, fontSize: 40, color: "#737373" }}>{this.state.time}</Text>
                                    <Text style={{ textAlign: "center", marginBottom: 10, color: "#737373" }}>Clock In Time : {moment(this.state.clockInTime).format("hh:mm A")}</Text>
                                    <TouchableOpacity style={styles.myButton} onPress={() => this.clockOut()}><Text style={{ color: "#fff", fontSize: 30 }}>Clock Out</Text></TouchableOpacity>
                                </View>
                                :
                                this.state.LocationAvailable ?
                                    <View style={{ marginBottom: 20, marginTop: 10, flex: 1, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ textAlign: "center", marginBottom: 20, fontSize: 40, color: "#737373" }}>{this.state.currentTime}</Text>
                                        <TouchableOpacity style={styles.myButton} onPress={() => this.clockIn()}><Text style={{ color: "#fff", fontSize: 30 }}>Clock In</Text></TouchableOpacity>
                                    </View>
                                    :
                                    <View></View>
                    }
                </Content>
            </Container>
        );
    }

    clockIn() {
        if (this.state.IsClockedIn) {
            Alert.alert(
                'Clock In',
                'You have already clocked in!',
                [
                    { text: 'Ok' },
                ],
                { cancelable: false }
            )
        }
        else {
            Alert.alert(
                'Clock In',
                'Do you wish to clock in?',
                [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: () => this.confirmClockIn() },
                ],
                { cancelable: false }
            )
        }
    }

    confirmClockIn() {
        var clockInTime = moment([]);
        this.setState({ clockInTime: clockInTime, IsClockedIn: true, seconds: 0, IsClockInReq: true }, () => {
            this.startTimer();
            Toast.show({
                text: "Successfully clocked in at " + clockInTime.format("hh:mm A"),
                buttonText: 'Okay',
                position: "bottom",
                duration: 10000,
                type: "success"
            })
            var clockDetails = { clockInTime, clockOutTime: null }
            AsyncStorage.removeItem("@tms:user_clock_data"); //remove previous clock data
            AsyncStorage.setItem('@tms:user_clock_data', JSON.stringify(clockDetails), (error) => { });

            BackgroundGeolocation.setConfig({
                extras: {
                    IsClockIn: true,
                    IsClockOut: false,
                    EmployeeId: empId
                }
            }).then((state) => {
                BackgroundGeolocation.start();
                BackgroundGeolocation.getCurrentPosition({
                    samples: 1,
                    persist: true
                }).then((state) => {
                    // this.configureBackgroundFetch();
                    BackgroundGeolocation.setConfig({
                        extras: {
                            IsClockIn: false,
                            IsClockOut: false,
                            EmployeeId: empId
                        }
                    })
                });
            });
        })
    }

    clockOut() {
        Alert.alert(
            'Clock Out',
            'Do you wish to clock out?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => { this.confirmClockOut().then() } },
            ],
            { cancelable: false }
        )
    }

    async confirmClockOut() {
        var clockOutTime = moment([]);
        var seconds = clockOutTime.diff(this.state.clockInTime, "seconds");
        var time = this.secondsToTime(seconds);
        this.setState({
            clockOutTime: clockOutTime, IsClockedIn: false, seconds: seconds,
            time: time, dayComplete: true, IsClockOutReq: true
        }, async () => {
            clearInterval(this.timer);
            Toast.show({
                text: "Successfully clocked out at " + clockOutTime.format("hh:mm A"),
                buttonText: 'Okay',
                position: "bottom",
                duration: 10000,
                type: "success"
            })

            var clockDetails = {}
            await AsyncStorage.getItem('@tms:user_clock_data', (err, result) => {
                if (result !== null) {
                    clockDetails = JSON.parse(result);
                }
            });
            clockDetails.clockOutTime = clockOutTime;
            AsyncStorage.setItem('@tms:user_clock_data', JSON.stringify(clockDetails), (error) => { });

            BackgroundGeolocation.setConfig({
                extras: {
                    IsClockIn: false,
                    IsClockOut: true,
                    EmployeeId: empId
                }
            }).then((state) => {
                BackgroundGeolocation.getCurrentPosition({
                    samples: 1,
                    persist: true
                }).then((state) => {
                    BackgroundGeolocation.setConfig({
                        extras: {
                            IsClockIn: false,
                            IsClockOut: false,
                            EmployeeId: empId
                        }
                    }).then((state) => {
                        BackgroundGeolocation.stop();
                        BackgroundFetch.stop();
                        BackgroundGeolocation.sync();
                    })
                });
            });
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        clearInterval(this.currentTimer);
    }
}

export default Attendance;


const styles = StyleSheet.create({
    myButton: {
        backgroundColor: "#2196f3",
        borderRadius: 5,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 15,
        paddingLeft: 15,
    }
});