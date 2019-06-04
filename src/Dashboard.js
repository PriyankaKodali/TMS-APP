import React from "react";
import { StatusBar, Image, View, StyleSheet } from "react-native";
import {
    Body, Button, Card, CardItem, Container, Content, Header, H1, Icon, Left, Right,
    ScrollableTab, Spinner, Title, Text, Tab, Tabs, Toast
} from "native-base";
import { ApiUrl } from '../Config'
import { MyFetch } from '../MyAjax';
import MasterStyles from '../MasterStyles'

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
       // this.state = { activitiesSummary: null, IsDataAvailable: false }
        this.state = { activitiesSummary: [], IsDataAvailable: false }
    }

    componentWillMount() {
        var url = ApiUrl + "/api/Activities/GetActivitiesSummary";
        MyFetch(url, "GET", null).then((responseJson) => {
            this.setState({ activitiesSummary: responseJson["activitiesSummary"], IsDataAvailable: true })
        }).catch((error) => {
            error.text().then(errorMessage => {
                Toast.show({
                    text: errorMessage,
                    buttonText: 'Okay',
                    position: "bottom",
                    duration: 10000,
                    type: "danger"
                })
            })
        });
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
                        <Title>Dashboard</Title>
                    </Body>
                    <Right />
                </Header>
                <View style={{ flex: 1 }} >
                    {
                        this.state.IsDataAvailable ?
                            <Tabs renderTabBar={() => <ScrollableTab />}>
                             
                                <Tab heading="To Do List">
                                    <Content padder>
                                        <Card>
                                            <CardItem style={styles.total}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, { flexGrow: 1 }]}>Total Tasks</H1>
                                                    <H1 style={[MasterStyles.TextCenter]}>{this.state.activitiesSummary["TotalToDo"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.high}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>High Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["HighToDo"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.medium}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Medium Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["MediumToDo"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.low}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Low Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["LowToDo"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </Content>
                                </Tab>
                            
                                <Tab heading="To Do's In Hold ">
                                   <Content padder>
                                     <Card>
                                       <CardItem style={styles.total}>
                                        <Body style={styles.cardBody}>
                                        <H1 style={[MasterStyles.TextCenter, {flexGrow:1}]}> Total Tasks</H1>
                                        <H1 style={[MasterStyles.TextCenter]}> {this.state.activitiesSummary["TotalToDoInHold"]} </H1>
                                      </Body>
                                   </CardItem>
                               </Card>
                             <Card>
                             <CardItem style={styles.high}>
                                  <Body style={styles.cardBody}>
                                  <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>High Priority</H1>
                                  <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["HighToDoInHold"]}</H1>
                                    </Body>
                                </CardItem>
                             </Card>
                             <Card>
                                 <CardItem style={styles.medium}>
                                     <Body style={styles.cardBody}>
                                            <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Medium Priority</H1>
                                            <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["MediumToDoInHold"]}</H1>
                                      </Body>
                                  </CardItem>
                             </Card>
                              <Card>
                                  <CardItem style={styles.low}>
                                     <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Low Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["LowToDoInHold"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>

                             </Content>

                            </Tab>
                            
                                <Tab heading="Created By Me">
                                    <Content padder>
                                        <Card>
                                            <CardItem style={styles.total}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, { flexGrow: 1 }]}>Total Tasks</H1>
                                                    <H1 style={[MasterStyles.TextCenter]}>{this.state.activitiesSummary["TotalByMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.high}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>High Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["HighByMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.medium}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Medium Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["MediumByMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.low}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Low Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["LowByMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </Content>
                                </Tab>
                               
                                <Tab heading="Through Me">
                                    <Content padder>
                                        <Card>
                                            <CardItem style={styles.total}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, { flexGrow: 1 }]}>Total Tasks</H1>
                                                    <H1 style={[MasterStyles.TextCenter]}>{this.state.activitiesSummary["TotalThroughMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.high}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>High Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["HighThroughMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.medium}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Medium Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["MediumThroughMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                        <Card>
                                            <CardItem style={styles.low}>
                                                <Body style={styles.cardBody}>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White, { flexGrow: 1 }]}>Low Priority</H1>
                                                    <H1 style={[MasterStyles.TextCenter, MasterStyles.White]}>{this.state.activitiesSummary["LowThroughMe"]}</H1>
                                                </Body>
                                            </CardItem>
                                        </Card>
                                    </Content>
                                </Tab>
                           
                            </Tabs>
                            :

                            <Spinner color='#03a9f4' />
                    }
                </View>
            </Container>
        );
    }
}


export default Dashboard;


const styles = StyleSheet.create({
    priorityIcon: {
        height: 64,
        width: 64
    },
    high: {
        backgroundColor: '#F44336'
    },
    medium: {
        backgroundColor: '#FFEA00',
    },
    low: {
        backgroundColor: '#00E676',
    },
    cardBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    cardStats: {
        flex: 1,
        flexDirection: 'column'
    }
});