import React from "react";
import { Modal, View, ScrollView, ListView } from "react-native";
import {
    Body, Button, Fab, Header, Icon, Left, List, ListItem,
    Right, Spinner, Text, Title, Toast
} from "native-base";
import { empId } from '../../Globals.js';
import { MyFetch } from '../../MyAjax';
import moment from 'moment';
import { ApiUrl } from '../../Config';
import MasterStyles from '../../MasterStyles';
import MyPicker from '../UserDefined/MyPicker';

const sortProps = [
    { label: "Created Date", value: "CreatedDate" },
    { label: "Priority", value: "Priority" },
    { label: "Task Id", value: "TaskId" },
    { label: "Status", value: "Status" },
];

class ToDosInHold extends React.Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        var TaskFromMaster = [{ value: "", label: "All" }, { value: "Client", label: "Client" }, { value: "Office", label: "Office" }]
        var Priorities = [{ value: "", label: "All" }, { value: 0, label: "High" }, { value: 1, label: "Medium" }, { value: 2, label: "Low" }]
        var Statuses = [{ value: "", label: "All" }, { value: "Open", label: "Open" }, { value: "Pending", label: "Pending" }, { value: "Resolved", label: "Resolved" }, { value: "Reopened", label: "Reopened" }]
        this.state = {
            IsDataAvailable: false, Client: "", Department: "",
            sortCol: "CreatedDate", sortDir: "desc", currentPage: 1, sizePerPage: 10, dataTotalSize: 0,
            ToDosInHold: [], active: false, SortModal: false, SortProps: sortProps, FilterModal: false,
            TaskFrom: "", TaskFromMaster: TaskFromMaster,
            Priority: "", Priorities: Priorities,
            Status: "", Statuses: Statuses
        }
    }

    componentWillMount() {
        this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage);
    }

    refreshTasks() {
        this.setState({ currentPage: 1, sizePerPage: 10, IsDataAvailable: false, ToDosInHold: [] }, () => {
            this.GetToDosInHold(1, this.state.sizePerPage);
        })
    }

    GetToDosInHold(page, count) {
        var url = ApiUrl + "/api/Activities/GetToDosInHold?EmpId=" + empId +
            "&clientId=" + this.state.Client +
            "&departmentId=" + this.state.Department +
            "&taskType=" + this.state.TaskFrom +
            "&priority=" + this.state.Priority +
            "&status=" + this.state.Status +
            "&page=" + page + "&count=" + count +
            "&sortCol=" + this.state.sortCol +
            "&sortDir=" + this.state.sortDir
        MyFetch(url, "GET", null).then((data) => {
            var  toDosInHold = this.state.ToDosInHold;
            toDosInHold = toDosInHold.concat(data["ToDosInHold"]);
            this.setState({
                ToDosInHold: toDosInHold, currentPage: page, sizePerPage: count, IsDataAvailable: true
            })
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

    onEndReached = async () => {
        if (this.state.ToDosInHold.length !== this.state.currentPage * this.state.sizePerPage) {
            return;
        }
        this.setState({ IsDataAvailable: false });
        this.GetToDosInHold(this.state.currentPage + 1, this.state.sizePerPage);
    }

    render() {
        return (
            <View style={{ flexGrow: 1 }}>
                <List
                    onEndReachedThreshold={0.7}
                    onEndReached={() => this.onEndReached()}
                    dataArray={this.state.ToDosInHold}
                    renderRow={data => {
                        return (
                            <ListItem button onPress={() => this.props.navigation.navigate('TaskDetail', { TaskId: data.TaskId })}
                                style={[{ marginLeft: 0 }, data["Status"] === "Open" || data["Status"] === "Reopened" ? MasterStyles.open : (data["Status"] === "Pending"|| data["Status"] === "InProcess") ? MasterStyles.pending : MasterStyles.closed]}>
                                <Body >
                                    <Text style={data["Notifications"] > 0 ? MasterStyles.notification : {}}>
                                        <Text style={{ fontSize: 18 }}>
                                            {data["TaskId"]} <Text>({moment(data["CreatedDate"]).format("MM-DD-YYYY h:mm A")})</Text>
                                            {this.renderStars(data["Priority"])}
                                        </Text>
                                    </Text>

                                    <Text note style={[]}>{data["Subject"]}</Text>
                                </Body>
                            </ListItem>
                        );
                    }}
                />
                {
                    this.state.IsDataAvailable ?
                        <View />
                        :
                        <Spinner color='#03a9f4' />
                }
                <Fab
                    active={this.state.active}
                    direction="up"
                    containerStyle={{}}
                    style={{ backgroundColor: '#3B5998' }}
                    position="bottomRight"
                    onPress={() => this.setState({ active: !this.state.active })}>
                    <Icon name="options" />
                    <Button style={{ backgroundColor: '#34A34F' }} onPress={() => this.setState({ FilterModal: true })}>
                        <Icon name="funnel" />
                    </Button>
                    <Button style={{ backgroundColor: '#5067FF' }} onPress={() => this.setState({ SortModal: true })}>
                        <Icon name="sort" type="FontAwesome" />
                    </Button>
                    <Button disabled style={{ backgroundColor: '#DD5144' }}>
                        <Icon name="search" />
                    </Button>
                </Fab>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.SortModal}
                    onRequestClose={() => { }}>
                    <View style={{ flex: 1, flexDirection: "column" }}>
                        <Header hasTabs >
                            <Left />
                            <Body>
                                <Title>Sort Tasks</Title>
                            </Body>
                            <Right>
                                <Button transparent
                                    onPress={() => this.setState({ SortModal: false })}>
                                    <Icon name='close-circle' />
                                </Button>
                            </Right>
                        </Header>
                        <View style={{ flexGrow: 1 }}>
                            <List
                                dataSource={this.ds.cloneWithRows(this.state.SortProps)}
                                renderRow={(data) =>
                                    <ListItem style={{ paddingLeft: 10 }}>
                                        <Text> {data["label"]} </Text>
                                    </ListItem>}
                                renderLeftHiddenRow={(data) =>
                                    <Button full primary onPress={() => this.sortAsc(data["value"])}>
                                        <Icon active name="arrow-round-up" />
                                    </Button>}
                                renderRightHiddenRow={(data) =>
                                    <Button full warning onPress={() => this.sortDesc(data["value"])}>
                                        <Icon active name="arrow-round-down" />
                                    </Button>}
                                leftOpenValue={75}
                                rightOpenValue={-75}
                            />
                        </View>
                        <Button full danger onPress={() => this.setState({ SortModal: false })}>
                            <Text>Cancel</Text>
                        </Button>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.FilterModal}
                    onRequestClose={() => { }}>
                    <ScrollView style={{ flex: 1, flexDirection: "column" }}>
                        <Header hasTabs >
                            <Left />
                            <Body>
                                <Title>Filter Tasks</Title>
                            </Body>
                            <Right>
                                <Button transparent
                                    onPress={() => this.setState({ FilterModal: false })}>
                                    <Icon name='close-circle' />
                                </Button>
                            </Right>
                        </Header>
                        <View style={{ flexGrow: 1 }}>
                            <View style={MasterStyles.inputContainer}>
                                <Text style={MasterStyles.label}>Task From</Text>
                                <MyPicker
                                    mode="dropdown"
                                    placeholder="Select Task From"
                                    iosHeader="Select Task From"
                                    value={this.state.TaskFrom}
                                    onChange={this.taskFromChanged.bind(this)}
                                    options={this.state.TaskFromMaster}
                                />
                            </View>
                            <View style={MasterStyles.inputContainer}>
                                <Text style={MasterStyles.label}>Priority</Text>
                                <MyPicker
                                    mode="dropdown"
                                    placeholder="Select Priority"
                                    iosHeader="Select Priority"
                                    value={this.state.Priority}
                                    onChange={this.priorityChanged.bind(this)}
                                    options={this.state.Priorities}
                                />
                            </View>
                            <View style={MasterStyles.inputContainer}>
                                <Text style={MasterStyles.label}>Status</Text>
                                <MyPicker
                                    mode="dropdown"
                                    placeholder="Select Status"
                                    iosHeader="Select Status"
                                    value={this.state.Status}
                                    onChange={this.statusChanged.bind(this)}
                                    options={this.state.Statuses}
                                />
                            </View>
                        </View>
                    </ScrollView>
                    <Button full info onPress={() => { this.setState({ FilterModal: false, IsDataAvailable: false, ToDosInHold: [] }); this.GetToDosInHold(1, this.state.sizePerPage) }}>
                        <Text>Ok</Text>
                    </Button>
                </Modal>
            </View>
        );
    }

    renderStars(number) {
        var stars = [];
        for (var i = 0; i < 3 - number; i++) {
            stars.push(<Icon key={i} name="star" active={true} style={[{ fontSize: 19, lineHeight: 20 }, number === 0 ? MasterStyles.high : number === 1 ? MasterStyles.medium : MasterStyles.low]} />);
        }
        return stars;
    }

    sortDesc(column) {
        this.setState({ ToDosInHold: [], sortDir: "desc", sortCol: column, IsDataAvailable: false, currentPage: 1, SortModal: false }, () => {
            this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage);
        })
    }

    sortAsc(column) {
        this.setState({ ToDosInHold: [], sortDir: "asc", sortCol: column, IsDataAvailable: false, currentPage: 1, SortModal: false }, () => {
            this.GetToDosInHold(this.state.currentPage, this.state.sizePerPage);
        })
    }

    taskFromChanged(itemValue) {
        if (itemValue === null) {
            itemValue === "";
        }
        this.setState({ TaskFrom: itemValue });
    }

    priorityChanged(itemValue) {
        if (itemValue === null) {
            itemValue === "";
        }
        this.setState({ Priority: itemValue });
    }

    statusChanged() {
        if (itemValue === null) {
            itemValue === "";
        }
        this.setState({ Status: itemValue });
    }
}

export default ToDosInHold;