import React from "react";
import { ApiUrl } from "../Config";
import { MyFetch } from '../MyAjax';
import Loader from '../Loader';
import moment from 'moment';
import { View, ListView, ScrollView, KeyboardAvoidingView, Image } from "react-native";
import {
    Body, Button, Fab, Header, Icon, Left, List, ListItem, Right, Spinner, Text, Title, Thumbnail, Container
} from "native-base";
import { empId } from '../Globals.js';

class TopPerformers extends React.Component {

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            TopPerformers: [], MyPoints: '', IsDataAvailable: false,
        }
    }

    componentWillMount() {
        var url = ApiUrl + "/api/Reports/GetTopPerformances"
        MyFetch(url, "GET", null).then((data) => {
            this.setState({ TopPerformers: data["monthPerformance"], Total: data["topPerformances"], IsDataAvailable: true }, () => {
                if (this.state.Total.length > 0) {
                    var myPoints = this.state.MyPoints;
                    var totalEmployees = this.state.Total;
                    var employee = totalEmployees.findIndex((i) => i.EmpId == empId);
                    if (employee != -1) {
                        myPoints = totalEmployees[employee].MonthPoints
                    }
                    else {
                        myPoints = 0;
                    }
                    this.setState({ MyPoints: myPoints })
                }
            })
        })

    }

    render() {
        return (
            <Container>
                <Header hasTabs>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Top Performers </Title>
                    </Body>
                    <Right></Right>
                </Header>
                <ScrollView style={{ backgroundColor: "#fff" }}>
                    <KeyboardAvoidingView behavior="padding">
                        {this.state.IsDataAvailable ?
                            <View>
                                <List onEndReachedThreshold={0.7}
                                    dataArray={this.state.TopPerformers}
                                    renderRow={data => {
                                        var empuri = data["PhotoURL"] == null ? require('../assets/images/Default.png') : { uri: data["PhotoURL"] };
                                        if (data["MonthPoints"] > 0) {
                                            return (
                                                <ListItem style={{ marginLeft: 0 }}>
                                                    <Left>
                                                        {/* <Thumbnail square size={50} source={empuri} /> */}
                                                        <Image source={data["PhotoURL"] == null ? require('../assets/images/Default.png') : { uri: data["PhotoURL"] }} style={{ width: 42, height: 42 }} />
                                                        <Text> {data["Employee"]} </Text>
                                                    </Left>
                                                    <Body>
                                                    </Body>
                                                    <Right>
                                                        <Text> {data["MonthPoints"]}</Text>
                                                    </Right>
                                                </ListItem>
                                            )
                                        }
                                        else {
                                            return (
                                                <Text></Text>
                                            )
                                        }
                                    }}
                                >
                                </List>
                                <Text >
                                    <Text style={styles.employeePoints}> Your Points :</Text> {this.state.MyPoints}
                                </Text>
                            </View>

                            : <Spinner color='#03a9f4' />}

                    </KeyboardAvoidingView>
                </ScrollView>
            </Container>
        )
    }
}

export default TopPerformers;

const styles = {
    employeePoints: {
        fontWeight: 'bold',
        fontSize: 18
    },
    employeeImage: {
        width: '50px',
        height: '45px'
    }
}