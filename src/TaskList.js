import React from "react";
import { View } from "react-native";
import {
    Body, Button, Container, Content, Header, Icon, Left, Right,
    ScrollableTab, Title, Tab, Tabs
} from "native-base";
import ToDoList from './Tasks/ToDoList';
import CreatedByMe from './Tasks/CreatedByMe';
import ThroughMe from './Tasks/ThroughMe';
import ToDoPendingList from './Tasks/ToDoPendingList';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
    }

    render() {
        return (
            <Container>
                <Header hasTabs >
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Tasks</Title>
                    </Body>
                    <Right>
                        <Button transparent
                            onPress={() => this.refreshTasks()}>
                            <Icon name='refresh' />
                        </Button>
                    </Right>
                </Header>
                <View style={{ flex: 1 }} >
                    <Tabs renderTabBar={() => <ScrollableTab />}>

                        <Tab heading="To Do List">
                            <Content contentContainerStyle={{ flex: 1 }}>
                                <ToDoList navigation={this.props.navigation} ref="toDo" style={{ flexGrow: 1 }} />
                            </Content>
                        </Tab>

                        <Tab heading="To Do Pending">
                            <Content contentContainerStyle={{ flex: 1 }}>
                                <ToDoPendingList navigation={this.props.navigation} ref="toDoPending" style={{ flexGrow: 1 }} />
                            </Content>
                        </Tab>

                        <Tab heading="Created By Me">
                            <Content contentContainerStyle={{ flex: 1 }}>
                                <CreatedByMe navigation={this.props.navigation} ref="byMe" />
                            </Content>
                        </Tab>

                        <Tab heading="Through Me">
                            <Content contentContainerStyle={{ flex: 1 }}>
                                <ThroughMe navigation={this.props.navigation} ref="throughMe" />
                            </Content>
                        </Tab>
                    </Tabs>
                </View>
            </Container>
        );
    }

    refreshTasks() {
        if (this.refs.toDo) {
            this.refs.toDo.refreshTasks();
        }
        if (this.refs.byMe) {
            this.refs.byMe.refreshTasks();
        }
        if (this.refs.throughMe) {
            this.refs.throughMe.refreshTasks();
        }
        if (this.refs.todoPending) {
            this.refs.todoPending.refreshTasks();
        }
    }

}


export default Dashboard;