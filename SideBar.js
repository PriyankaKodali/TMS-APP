import React from "react";
import { Image, StatusBar, Divider } from "react-native";
import { displayName } from "./Globals.js"
import { View } from "react-native";
import {
    Button,
    Text,
    Container,
    List,
    ListItem,
    Content,
    Thumbnail
} from "native-base";

const routes = [   
    { Name: "Attendance", Route: "Attendance" },
    { Name: "Dashboard", Route: "Dashboard" },
    { Name: "Task List", Route: "TaskList" },
    { Name: "My Report", Route: "MyReport"},
    { Name: "Logout", Route: "Logout" }
];

export default class SideBar extends React.Component {
    render() {
        return (
            <Container>
                <Content style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{
                        paddingTop: 30, paddingLeft: 20, paddingRight: 20, paddingBottom: 5,
                        flex: 1, alignItems: 'center', flexDirection: 'row'
                    }}>
                        {
                            displayName.indexOf("Mamilla") !== -1 ?
                                <Thumbnail source={require('./assets/images/profile_pham.png')} />
                                :
                                <Thumbnail source={require('./assets/images/profile.png')} />
                        }
                        <Text style={{ paddingLeft: 10 }}>{"Hi " + displayName + ","}</Text>
                    </View>
                    <View style={{ borderBottomColor: "#ddd", borderBottomWidth: 1 }}></View>
                    <View style={{ flexGrow: 1 }}>
                        <List
                            dataArray={routes}
                            renderRow={data => {
                                return (
                                    <ListItem
                                        button
                                        onPress={() => this.props.navigation.navigate(data["Route"])}
                                    >
                                        <Text>{data["Name"]}</Text>
                                    </ListItem>
                                );
                            }}
                        />
                    </View>
                </Content>
            </Container>
        );
    }
}