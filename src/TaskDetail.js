import React from "react";
import {
    Keyboard, Linking, ScrollView, StyleSheet, TextInput, TouchableOpacity, View,
    KeyboardAvoidingView
} from "react-native";
import {
    Body, Button, Container, Header, H3, Icon, Left, List,
    ListItem, Right, Spinner, Title, Text, Toast
} from "native-base";
import { orgId, empId, roles } from '../Globals.js';
import MasterStyles from '../MasterStyles';
import Loader from '../Loader';
import { MyFetch } from '../MyAjax';
import { ApiUrl } from '../Config';
import moment from 'moment';
import Collapsible from 'react-native-collapsible';
import DateSelector from './UserDefined/DateSelector';
import MyPicker from './UserDefined/MyPicker';
import HTML from 'react-native-render-html';


class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        var assignees = [{ AssigneeId: null, AssigneeName: "", Quantity: null }]

        this.state = {
            TaskInfo: {}, TaskLog: [], TaskId: null, LogCollapsed: true, EmployeesForAssignment: [],
            StartDate: null, EndDate: null, TaskLogAvailable: false, TaskInfoAvailable: false,
            ActionType: null, ActionTypes: [], AssignedEmployee: null, MyStatsForTask: {}, loading: false,
            IsAcknowledged: false, TaskAssignees: assignees, Notifications: ''
        }
    }

    componentWillMount() {
        var taskId = this.props.navigation.state.params.TaskId;
        var url = ApiUrl + "/api/Activities/GetTaskDetail?TaskId=" + taskId + "&employeeId=" + empId;
        MyFetch(url, "GET", null).then((data) => {
            this.setState(
                {
                    TaskInfo: data["taskDetail"], Notifications: data["Notifications"],
                    TaskId: taskId, TaskInfoAvailable: true
                },
                () => {
                    MyFetch(ApiUrl + "/api/Activities/GetTaskHoursWorkedInfo?TaskId=" + taskId + "&userId=" + empId, "GET", null)
                        .then((hoursData) => {
                            this.setState({
                                MyStatsForTask: hoursData["activitylog"], StartDate: hoursData["activitylog"]["StartDate"],
                                EndDate: hoursData["activitylog"]["EndDate"]
                            }, () => {
                                var actionTypes = [];

                                if (this.state.TaskInfo["CreatedById"] === empId) {
                                    if (this.state.TaskInfo["Status"] === "Resolved") {
                                        actionTypes = [{ value: "AcceptToClose", label: "Accept To Close" }, { value: "Comments", label: "Comments/Remarks" }, { value: "Reopen", label: "Reopen" }]
                                    }
                                    else {
                                        // if (this.state.TaskInfo["Status"] === "Pending" || this.state.TaskInfo["Status"] === "Open" || this.state.TaskInfo["Status"] === "Reopened") {
                                        actionTypes = [{ value: "AcceptToClose", label: "Accept To Close" }, { value: "Comments", label: "Comments/Remarks" }]
                                    }
                                }
                                else if (this.state.TaskInfo["TaskOwnerId"] == empId && this.state.TaskInfo["Status"] !== "Closed") {
                                    if (this.state.StartDate === null) {
                                        actionTypes = [{ value: "Assign", label: "Assign" }, { value: "InProcess", label: "InProcess/Acknowledgement" }, { value: "Pending", label: "Pending" }]
                                    }
                                    else {
                                        this.setState({ IsAcknowledged: true })
                                        actionTypes = [{ value: "Assign", label: "Assign" }, { value: "Pending", label: "Pending" }, { value: "Resolved", label: "Resolved" }]

                                    }
                                }
                                this.setState({ ActionTypes: actionTypes })
                            })
                        }).catch((error) => {
                            Toast.show({
                                text: error,
                                buttonText: 'Okay',
                                position: "bottom",
                                duration: 10000,
                                type: "danger"
                            })
                        })
                })
        }).catch((error) => {
            Toast.show({
                text: error,
                buttonText: 'Okay',
                position: "bottom",
                duration: 10000,
                type: "danger"
            })
        });

        MyFetch(ApiUrl + "/api/Activities/GetTaskLog?TaskId=" + taskId, "GET", null)
            .then((data) => {
                this.setState({ TaskLog: data["taskLog"], TaskLogAvailable: true })
            }).catch((error) => {
                Toast.show({
                    text: error,
                    buttonText: 'Okay',
                    position: "bottom",
                    duration: 10000,
                    type: "danger"
                })
            });

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
                        <Title>{this.state.TaskId}</Title>
                    </Body>
                    {this.state.TaskInfo.Notifications > 0 ?
                        <Button iconRight transparent light onPress={this.MarkAsUnReadClick.bind(this)} >
                            <Text>Mark As Unread</Text>
                        </Button>
                        : <Right></Right>}
                </Header>
                <ScrollView>
                    <KeyboardAvoidingView behavior="padding">
                        <Loader loading={this.state.loading} />
                        {
                            this.state.TaskInfoAvailable ?
                                <ScrollView style={{ backgroundColor: "#fff" }}>
                                    <List>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>Created By</Text>
                                                <Text style={styles.lightText}>{this.state.TaskInfo["CreatedBy"]}</Text>
                                            </View>
                                        </ListItem>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>Created On</Text>
                                                <Text style={styles.lightText}>{moment(this.state.TaskInfo["TaskDate"]).format("DD-MMM-YYYY h:mm a")}</Text>
                                            </View>
                                        </ListItem>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>Assigned To</Text>
                                                <Text style={styles.lightText}>{this.state.TaskInfo["TaskOwner"]}</Text>
                                            </View>
                                        </ListItem>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>Category</Text>
                                                <Text style={styles.lightText}>{this.state.TaskInfo["Category"]}  </Text>
                                            </View>
                                        </ListItem>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>SubCategory</Text>
                                                <Text style={styles.lightText}>{this.state.TaskInfo["SubCategory"]}
                                                    {this.state.TaskInfo["Quantity"] ?
                                                        <Text> : {this.state.TaskInfo["Quantity"]} </Text> : ""}
                                                </Text>
                                            </View>
                                        </ListItem>
                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text style={this.state.TaskInfo["Priority"] === "High" ? MasterStyles.high : this.state.TaskInfo["Priority"] === "Medium" ? MasterStyles.medium : MasterStyles.low}>Priority : {this.state.TaskInfo["Priority"]}</Text>
                                                <Text style={this.state.TaskInfo["Status"] === "Open" || this.state.TaskInfo["Status"] === "Reopened" ? MasterStyles.high : this.state.TaskInfo["Status"] === "Pending" ? MasterStyles.medium : {}}>Status: {this.state.TaskInfo["Status"]}</Text>
                                            </View>
                                        </ListItem>

                                        <ListItem>
                                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text>Expected Date of closure</Text>
                                                <Text style={styles.lightText}>

                                                    {moment(this.state.TaskInfo["EDOC"]).format("DD-MMM-YYYY")}

                                                </Text>
                                            </View>
                                        </ListItem>
                                        {
                                            this.state.TaskInfo["TaskType"] === "Client" ?
                                                <ListItem>
                                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                        <Text> Client  </Text>
                                                        <Text style={styles.lightText}> {this.state.TaskInfo["Client"]} </Text>
                                                    </View>
                                                </ListItem>
                                                :
                                                <View></View>
                                        }

                                        {
                                            this.state.TaskInfo["TaskType"] === "Client" && this.state.TaskInfo["Location"] != null ?
                                                <ListItem>
                                                    <Body>
                                                        <Text>Location</Text>
                                                        <Text style={styles.lightText}>{this.state.TaskInfo["Location"]}</Text>
                                                    </Body>
                                                </ListItem>
                                                :
                                                <View></View>
                                        }

                                        <ListItem>
                                            <Body>
                                                <Text>Subject:</Text>
                                                <Text style={styles.lightText}>{this.state.TaskInfo["Subject"]}</Text>
                                            </Body>
                                        </ListItem>
                                        <ListItem>
                                            <Body>
                                                <Text>Description:</Text>
                                                <HTML containerStyle={{ paddingLeft: 12, paddingRight: 12 }} html={this.state.TaskInfo["Description"]} />
                                            </Body>
                                        </ListItem>
                                    </List>

                                    <View style={{ margin: 5, borderColor: "#cecece", borderWidth: 1 }}>
                                        <TouchableOpacity style={{ padding: 5, backgroundColor: "#81abbf", }} onPress={() => this.setState({ LogCollapsed: !this.state.LogCollapsed })}>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                <View>
                                                    <H3 style={{ textAlign: 'center', color: "#fff" }}>Action/Responses</H3>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        {
                                            this.state.TaskLogAvailable ?
                                                <Collapsible collapsed={false}>
                                                    {
                                                        this.state.TaskLog.length > 0 ?
                                                            <List
                                                                dataArray={this.state.TaskLog}
                                                                renderRow={data => {
                                                                    return (
                                                                        <ListItem button onPress={() => { }} style={{ marginLeft: 0 }}>
                                                                            <Body>
                                                                                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                                                    <Text style={{ fontSize: 16 }}>{data["AssignedBy"]}</Text>
                                                                                    <Text style={{ fontSize: 16 }}>({moment(data["TaskDate"]).format("DD-MMM-YYYY HH:mm A")})</Text>
                                                                                </View>

                                                                                <View>
                                                                                    {
                                                                                        data["AssignedTo"] !== null ?
                                                                                            <View>
                                                                                                <Text style={styles.lightText}>Assigned To: <Text note>{data["AssignedTo"]}</Text></Text>
                                                                                            </View>
                                                                                            : <View />
                                                                                    }
                                                                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                                                                                        <Text style={styles.lightText}>Status: <Text note> {data["Status"]}</Text></Text>
                                                                                        {
                                                                                            data["HoursWorked"] > 0 ?
                                                                                                <View>
                                                                                                    <Text style={styles.lightText}>Hours: <Text note>{data["HoursWorked"]}</Text></Text>
                                                                                                </View>
                                                                                                :
                                                                                                <View />
                                                                                        }
                                                                                        {
                                                                                            data["QuantityWorked"] > 0 ?
                                                                                                <View>
                                                                                                    <Text style={styles.lightText}>Quantity Worked: <Text note>{data["QuantityWorked"]}</Text></Text>
                                                                                                </View>
                                                                                                :
                                                                                                <View />
                                                                                        }
                                                                                    </View>
                                                                                    <HTML containerStyle={{ paddingLeft: 12, paddingRight: 12 }} html={data["Description"]} />
                                                                                    {
                                                                                        data["Attachments"].length > 0 ?
                                                                                            <Text style={[styles.lightText, { color: '#6ebfff' }]} onPress={() => this.downloadAttachments(data["Id"])}>Download Attachments</Text>
                                                                                            :
                                                                                            <View />
                                                                                    }

                                                                                </View>
                                                                            </Body>
                                                                        </ListItem>
                                                                    );
                                                                }}
                                                            />
                                                            :
                                                            <View>
                                                                <Text>No Actions/Responses</Text>
                                                            </View>
                                                    }

                                                </Collapsible>
                                                :
                                                <Spinner color='#03a9f4' />
                                        }

                                    </View>

                                    {
                                        this.state.TaskInfo.CreatedById === empId || this.state.TaskInfo.TaskOwnerId === empId ?
                                            <View style={{ margin: 5, borderColor: "#cecece", borderWidth: 1 }}>
                                                <TouchableOpacity style={{ padding: 5, backgroundColor: "#81abbf", }} onPress={() => this.setState({ LogCollapsed: !this.state.LogCollapsed })}>
                                                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                        <View>
                                                            <H3 style={{ textAlign: 'center', color: "#fff" }}>Update Task</H3>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <Collapsible collapsed={false} style={{ paddingTop: 5, paddingBottom: 5 }}>
                                                    <View style={MasterStyles.inputContainer}>
                                                        <Text style={MasterStyles.label}>Action Type</Text>
                                                        <MyPicker mode="dropdown"
                                                            placeholder="Select Action" iosHeader="Select Action"
                                                            selectedValue={this.state.ActionType}
                                                            onChange={this.actionTypeChanged.bind(this)}
                                                            options={this.state.ActionTypes}
                                                        />
                                                        <Text style={MasterStyles.errorText}>{this.state.ActionTypeError}</Text>
                                                    </View>

                                                    {
                                                        this.state.ActionType && this.state.ActionType !== "AcceptToClose" && this.state.ActionType !== "Reopen" ?
                                                            <View>
                                                                {
                                                                    this.state.ActionType === "Assign" ?
                                                                        <View>
                                                                            <View style={MasterStyles.inputContainer} ref="assignedEmployee">
                                                                                <Text style={MasterStyles.label}>Assign To</Text>
                                                                                <MyPicker mode="dropdown" placeholder="Assign To"
                                                                                    iosHeader="Assign To" selectedValue={this.state.AssignedEmployee}
                                                                                    onChange={(itemValue) => { this.setState({ AssignedEmployee: itemValue }) }}
                                                                                    options={this.state.EmployeesForAssignment} />
                                                                                <Text style={MasterStyles.errorText}>{this.state.AssignedEmployeeError}</Text>
                                                                            </View>
                                                                            {
                                                                                this.state.TaskInfo["Quantity"] !== null ?
                                                                                    <View style={MasterStyles.inputContainer}>
                                                                                        <Text style={MasterStyles.label} > Quantity </Text>
                                                                                        <TextInput style={MasterStyles.textInput} returnKeyType="next" ref="quantity"
                                                                                            placeholder="Quantity to be assigned" keyboardType="numeric"
                                                                                            enablesReturnKeyAutomatically={true} />
                                                                                        <Text style={MasterStyles.errorText}> {this.state.QuantityError}</Text>
                                                                                    </View>
                                                                                    :
                                                                                    <View />
                                                                            }
                                                                        </View>
                                                                        :
                                                                        <View />
                                                                }

                                                                {
                                                                    this.state.ActionType === "Pending" || this.state.ActionType === "InProcess" ?
                                                                        <View>
                                                                            {/* disabled={this.state.MyStatsForTask.StartDate !== null} */}
                                                                            <View style={MasterStyles.inputContainer} ref="startDate" accessible={true}>
                                                                                <Text style={MasterStyles.label}>Expected Start Date</Text>
                                                                                <DateSelector placeholder="Start Date" value={this.state.StartDate}
                                                                                    onChange={(date) => this.setState({ StartDate: date })}
                                                                                />
                                                                                <Text style={MasterStyles.errorText}>{this.state.StartDateError}</Text>
                                                                            </View>
                                                                            <View style={MasterStyles.inputContainer} ref="endDate">
                                                                                <Text style={MasterStyles.label}>Expected Date of Completion</Text>
                                                                                {/* disabled={this.state.MyStatsForTask.EndDate !== null} */}
                                                                                <DateSelector placeholder="Completion Date" value={this.state.EndDate}
                                                                                    onChange={(date) => this.setState({ EndDate: date })}
                                                                                />
                                                                                <Text style={MasterStyles.errorText}>{this.state.EndDateError}</Text>
                                                                            </View>

                                                                            <View style={MasterStyles.inputContainer}>
                                                                                <Text style={MasterStyles.label}>Planned Budgeted Hours</Text>
                                                                                {/* editable={this.state.MyStatsForTask.BudgetedHours === null} */}
                                                                                {/* {style : this.state.MyStatsForTask.BudgetedHours !== null ? MasterStyles.disabled : {}} */}
                                                                                <TextInput style={MasterStyles.textInput}
                                                                                    style={[MasterStyles.textInput]}
                                                                                    returnKeyType="next" ref="budgetHours" placeholder="Planned Budgeted Hours"
                                                                                    keyboardType="numeric"
                                                                                    defaultValue={this.state.MyStatsForTask.BudgetedHours === null ? "" : '' + this.state.MyStatsForTask.BudgetedHours}
                                                                                />
                                                                                <Text style={MasterStyles.errorText}>{this.state.BudgetHoursError}</Text>
                                                                            </View>

                                                                            {/* {
                                                      this.state.TaskInfo["Quantity"]!=null ?
                                                     <View style={MasterStyles.inputContainer}>
                                                       <Text style={MasterStyles.label}>Budgeted Quantity</Text>
                                                       <TextInput style={[MasterStyles.textInput, this.state.TaskInfo["Quantity"] !== null ? MasterStyles.disabled : {}]}
                                                           returnKeyType="next" ref="budgetedQuantity"
                                                           placeholder="Budgeted Quantity" keyboardType="numeric"
                                                           editable={this.state.TaskInfo.Quantity === null}
                                                           defaultValue={this.state.TaskInfo.Quantity === null ? "" : '' + this.state.TaskInfo.Quantity}
                                                        />
                                                     </View>
                                                      :
                                                      <View />
                                                    } */}
                                                                        </View>
                                                                        :
                                                                        <View />
                                                                }

                                                                {
                                                                    this.state.MyStatsForTask.TotalHoursWorked !== null && this.state.ActionType !== "Comments" ?
                                                                        <View style={MasterStyles.inputContainer}>
                                                                            <Text style={MasterStyles.label}>Previously worked hours</Text>
                                                                            <TextInput
                                                                                style={[MasterStyles.textInput, this.state.MyStatsForTask.TotalHoursWorked !== null ? MasterStyles.disabled : {}]}
                                                                                returnKeyType="next" ref="previousHours"
                                                                                placeholder="Previously worked hours"
                                                                                keyboardType="numeric"
                                                                                editable={this.state.MyStatsForTask.TotalHoursWorked === null}
                                                                                defaultValue={this.state.MyStatsForTask.TotalHoursWorked === null ? "" : '' + this.state.MyStatsForTask.TotalHoursWorked}
                                                                            />
                                                                            <Text style={MasterStyles.errorText}>{this.state.PreviousHoursError}</Text>
                                                                        </View>
                                                                        :
                                                                        <View />
                                                                }

                                                                {
                                                                    this.state.ActionType !== "Comments" ?
                                                                        <View style={MasterStyles.inputContainer}>
                                                                            <Text style={MasterStyles.label}>Number of Hours Worked</Text>
                                                                            <TextInput style={MasterStyles.textInput}
                                                                                returnKeyType="next" ref="hoursWorked"
                                                                                placeholder="No. of Hours Worked" keyboardType="numeric"
                                                                                enablesReturnKeyAutomatically={true}
                                                                            />
                                                                            <Text style={MasterStyles.errorText}>{this.state.HoursWorkedError}</Text>
                                                                        </View>
                                                                        : <View />
                                                                }

                                                                {this.state.TaskInfo["Quantity"] && this.state.ActionType !== "Comments" ?
                                                                    <View style={MasterStyles.inputContainer}>
                                                                        <Text style={MasterStyles.label}>Budgeted Quantity</Text>
                                                                        <TextInput
                                                                            style={[MasterStyles.textInput, this.state.MyStatsForTask.TotalHoursWorked !== null ? MasterStyles.disabled : {}]}
                                                                            returnKeyType="next" ref="previousHours"
                                                                            placeholder="Previously worked hours"
                                                                            keyboardType="numeric"
                                                                            editable={this.state.TaskInfo["Quantity"] === null}
                                                                            defaultValue={this.state.TaskInfo["Quantity"] === null ? "" : '' + this.state.TaskInfo["Quantity"]}
                                                                        />
                                                                    </View>
                                                                    : <View />
                                                                }
                                                                {
                                                                    this.state.TaskInfo["Quantity"] != null && this.state.MyStatsForTask.TotalQuantityWorked !== null && this.state.ActionType !== "Comments" ?
                                                                        <View style={MasterStyles.inputContainer}>
                                                                            <Text style={MasterStyles.label}>Previously Worked Quantity</Text>
                                                                            <TextInput
                                                                                style={[MasterStyles.textInput, this.state.MyStatsForTask.TotalQuantityWorked !== null ? MasterStyles.disabled : {}]}
                                                                                keyboardType="numeric"
                                                                                returnKeyType="next"
                                                                                editable={this.state.MyStatsForTask.TotalQuantityWorked === null}
                                                                                defaultValue={this.state.MyStatsForTask.TotalQuantityWorked === null ? "" : '' + this.state.MyStatsForTask.TotalQuantityWorked} />
                                                                        </View>
                                                                        :
                                                                        <View />
                                                                }

                                                                {
                                                                    this.state.TaskInfo["Quantity"] != null && this.state.ActionType !== "Comments" ?

                                                                        <View style={MasterStyles.inputContainer}>
                                                                            <Text style={MasterStyles.label}>Quantity Worked</Text>
                                                                            <TextInput style={MasterStyles.textInput}
                                                                                returnKeyType="next" ref="quantityWorked"
                                                                                placeholder="Quantity Worked"
                                                                                keyboardType="numeric"
                                                                                enablesReturnKeyAutomatically={true}
                                                                            />
                                                                            <Text style={MasterStyles.errorText}> {this.state.QuantityWorkedError}</Text>
                                                                        </View>
                                                                        : <View />
                                                                }
                                                            </View>
                                                            : <View />
                                                    }
                                                    {
                                                        this.state.ActionType ?
                                                            <View>
                                                                <View style={MasterStyles.inputContainer}>
                                                                    <Text style={MasterStyles.label}>Action</Text>
                                                                    <TextInput style={MasterStyles.multiLineTextInput}
                                                                        ref="action"
                                                                        placeholder="Action"
                                                                        multiline={true}
                                                                    />
                                                                    <Text style={MasterStyles.errorText}>{this.state.ActionError}</Text>
                                                                </View>

                                                                <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
                                                                    <Button primary onPress={this.updateTask.bind(this)}><Text> Submit </Text></Button>
                                                                </View>

                                                            </View>
                                                            :
                                                            <View />

                                                    }
                                                </Collapsible>
                                            </View>
                                            :
                                            <View />
                                    }

                                </ScrollView>
                                :
                                <Spinner color='#03a9f4' />
                        }
                    </KeyboardAvoidingView>
                </ScrollView>
            </Container>
        );
    }

    actionTypeChanged(itemValue) {
        this.setState({ ActionType: itemValue }, () => {
            if (itemValue === "Assign") {
                this.getEmployeesForAssignment();
            }
        })
    }

    getEmployeesForAssignment() {
        var OrgId = roles.indexOf("SuperAdmin") != -1 ? null : orgId;
        MyFetch(ApiUrl + "/api/MasterData/GetEmployeesForTaskAllocation?creatorId=" + this.state.TaskInfo.CreatedById + "&OrgId=" + OrgId, "GET", null)
            .then((data) => {
                this.setState({ EmployeesForAssignment: data["employees"] })
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

    downloadAttachments(commentId) {
        var comment = this.state.TaskLog.filter((item) => item["Id"] === commentId);
        if (comment.length > 0) {
            for (var i = 0; i < comment[0].Attachments.length; i++) {
                Linking.openURL(comment[0].Attachments[i])
            };
        }
    }

    MarkAsUnReadClick() {
        var formData = new FormData();
        formData.append("taskId", this.state.TaskId);

        MyFetch(ApiUrl + "/api/Activities/AddNotification?taskId=" + this.state.TaskId, "POST", formData)
            .then(() => {
                this.setState({ loading: false });
                Toast.show({
                    text: "Marked as unread",
                    buttonText: 'Okay',
                    position: "bottom",
                    duration: 10000,
                    type: "success"
                });
                this.props.navigation.navigate('TaskList');
            }).catch((error) => {
                this.setState({ loading: false });
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

    updateTask() {
        Keyboard.dismiss();
        if (!this.validate()) {
            return;
        }

        if (this.state.ActionType === "Assign") {
            var assignees = this.state.TaskAssignees;
            assignees[0]["AssigneeId"] = this.state.AssignedEmployee;
            if (this.state.TaskInfo["Quantity"] !== null) {
                assignees[0]["Quantity"] = this.refs.quantity._lastNativeText;
            }
            this.setState({ TaskAssignees: assignees })
        }

        this.setState({ loading: true });
        var data = new FormData();
        data.append("taskId", this.state.TaskId)
        data.append("actionType", this.state.ActionType);
        data.append("description", this.refs.action._lastNativeText.trim());
        data.append("OrgId", orgId);

        if (this.state.ActionType === "Assign") {
            //  data.append("assignee", this.state.AssignedEmployee);
            data.append("assigneeList", JSON.stringify(this.state.TaskAssignees));
            data.append("hoursWorked", parseInt(this.refs.hoursWorked._lastNativeText));
            data.append("ParentTaskDetails", JSON.stringify(this.state.TaskLog));
        }

        if (this.state.ActionType === "Pending" || this.state.ActionType === "InProcess") {
            // if (!this.state.MyStatsForTask.StartDate) {
            if (this.refs.budgetHours._lastNativeText !== undefined) {
                data.append("budgetedHours", parseInt(this.refs.budgetHours._lastNativeText));
            }
            else {
                data.append("budgetedHours", this.state.MyStatsForTask.BudgetedHours);
            }
            data.append("edos", moment(this.state.StartDate).format("YYYY-MM-DD"));
            data.append("edoc", moment(this.state.EndDate).format("YYYY-MM-DD"));
            // }
            // else {
            //     data.append("budgetedHours", this.state.MyStatsForTask.BudgetedHours);
            //     data.append("edos", moment(this.state.MyStatsForTask.StartDate).format("YYYY-MM-DD"));
            //     data.append("edoc", moment(this.state.MyStatsForTask.EndDate).format("YYYY-MM-DD"));
            // }
            data.append("hoursWorked", parseInt(this.refs.hoursWorked._lastNativeText));
        }

        if (this.state.ActionType === "Resolved") {
            data.append("hoursWorked", parseInt(this.refs.hoursWorked._lastNativeText));
        }

        if (this.state.ActionType !== "Reopen" && this.state.ActionType != "AcceptToClose" && this.state.ActionType != "Comments") {
            if (this.state.TaskInfo["Quantity"] !== null) {
                data.append("quantityWorked", parseInt(this.refs.quantityWorked._lastNativeText));
            }
        }


        MyFetch(ApiUrl + "/api/Activities/EditActivity", "POST", data)
            .then(() => {
                this.setState({ loading: false });
                Toast.show({
                    text: "Task updated successfully!",
                    buttonText: 'Okay',
                    position: "bottom",
                    duration: 10000,
                    type: "success"
                });
                this.props.navigation.navigate('TaskList');
            }).catch((error) => {
                this.setState({ loading: false });
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

    validate() {
        var success = true;
        var quantity = this.state.TaskInfo["Quantity"];

        var previouslyWorkedQty = this.state.MyStatsForTask.TotalQuantityWorked;
        var startDate = moment(this.state.StartDate).format('DD-MM-YYYY');
        var currentDay = moment().format('DD-MM-YYYY');

        if (this.state.ActionType === "Assign") {
            if (!this.state.AssignedEmployee) {
                this.setState({ AssignedEmployeeError: "Please select an employee" });
                if (success) {
                    success = false;
                }
            }
            else {
                this.setState({ AssignedEmployeeError: "" });
            }
            if (quantity != null) {
                var budgetedQuanity = parseInt(quantity);
                var assignedQty = this.refs.quantity._lastNativeText

                // if(previouslyWorkedQty!=null)
                // {
                //     quantity= parseInt(quantity)-parseInt(previouslyWorkedQty)
                // }
                if (assignedQty == "" || parseInt(assignedQty) <= 0 || assignedQty == undefined) {
                    if (success) {
                        success = false;
                        this.refs.quantity.focus();
                    }
                    this.setState({ QuantityError: "Enter quantity to be assigned" })
                }
                //  else if(previouslyWorkedQty!=null){
                //     var quantityAssigned= parseInt(previouslyWorkedQty)+ parseInt(assignedQty);
                //     if(quantityAssigned > budgetedQuanity)
                //     {
                //        if(success){
                //            success = false;
                //            this.refs.quantity.focus();
                //            }
                //        this.setState({QuantityError: "You have already worked " + parseInt(previouslyWorkedQty) + "Quantity" })
                //     }
                // }
                //   else if(parseInt(assignedQty)>parseInt(budgetedQuanity) ||  parseInt(assignedQty)< parseInt(budgetedQuanity))
                else if (parseInt(assignedQty) > parseInt(budgetedQuanity)) {
                    if (success) {
                        success = false;
                        this.refs.quantity.focus();
                    }
                    // this.setState({QuantityError: "Should be eual to quantity to be worked"});
                    this.setState({ QuantityError: "Should be less than or equal to budgeted quanitiy" });
                }
                else {
                    this.setState({ QuantityError: null })
                }
            }
        }

        //check if pending and already dates entered
        // if (this.state.ActionType === "Pending" && !this.state.MyStatsForTask.StartDate) {
        if (this.state.ActionType === "Pending" || this.state.ActionType === "InProcess") {
            if (!this.state.StartDate) {
                this.setState({ StartDateError: "Please select expected date of beginning" });
                if (success) {
                    success = false;
                }
            }
            else {
                if (this.state.ActionType === "InProcess") {
                    if (startDate != currentDay && !this.state.IsAcknowledged) {
                        this.setState({ StartDateError: "Should be current day" });
                        if (success) {
                            success = false;
                        }
                    }
                    else {
                        this.setState({ StartDateError: "" });
                    }
                }
                else {
                    if (startDate == currentDay && !this.state.IsAcknowledged) {
                        this.setState({ StartDateError: "Should be greater than current day" });
                        if (success) {
                            success = false;
                        }
                    }
                    else {
                        this.setState({ StartDateError: "" });
                    }
                }

            }

            if (!this.state.EndDate) {
                this.setState({ EndDateError: "Please select expected date of closure" });
                if (success) {
                    success = false;
                }
            }
            else if (moment(this.state.StartDate).isAfter(this.state.EndDate)) {
                this.setState({ EndDateError: "Date of closure should not be less that start date" });
                if (success) {
                    success = false;
                }
            }
            else {
                this.setState({ EndDateError: "" });
            }

            var diffHours = ((moment(this.state.EndDate).diff(moment(this.state.StartDate), 'days')) + 1) * 8;
            var budgetHours = this.refs.budgetHours._lastNativeText;
            if (this.state.MyStatsForTask.BudgetedHours !== null) {
                budgetHours = this.state.MyStatsForTask.BudgetedHours;
            }
            // var alreadybudgetedHours= this.state.MyStatsForTask.BudgetedHours;
            if (!budgetHours || budgetHours == 0) {
                this.setState({ BudgetHoursError: "Please enter number of budgeted hours" });
                if (success) {
                    this.refs.budgetHours.focus();
                    success = false;
                }
            }
            else if (parseInt(budgetHours) > diffHours && diffHours > 0) {
                this.setState({ BudgetHoursError: "Budgeted hours should be less than " + diffHours });
                if (success) {
                    this.refs.budgetHours.focus();
                    success = false;
                }
            }
            else {
                this.setState({ BudgetHoursError: "" });
            }
        }

        if (this.state.ActionType == "Resolved") {
            var quantityWorked = this.refs.quantityWorked._lastNativeText;

            if (this.state.TaskInfo["Quantity"] !== null) {
                if (parseInt(quantityWorked) < 0) {
                    this.setState({ QuantityWorkedError: "Please enter valid quantity " });
                    if (success) {
                        this.refs.quantityWorked.focus();
                        success = false;
                    }
                }
                else if (quantityWorked !== undefined && quantityWorked !== "" || parseInt(quantityWorked) > 0) {

                    if (quantityWorked > this.state.TaskInfo["Quantity"]) {
                        this.setState({ QuantityWorkedError: "Quantity is greater than budgeted quantity" });
                        if (success) {
                            this.refs.quantityWorked.focus();
                            success = false;
                        }
                    }
                }
                else {
                    if (previouslyWorkedQty != null) {
                        if (quantityWorked == "" || !quantityWorked) {
                            quantityWorked = 0
                        }
                        var totalquantity = previouslyWorkedQty + parseInt(quantityWorked);
                        if (totalquantity < this.state.TaskInfo["Quantity"]) {
                            this.setState({ QuantityWorkedError: "You haven't completed the budgeted quantity" });
                            if (success) {
                                this.refs.quantityWorked.focus();
                                success = false;
                            }
                        }
                    //     else if(previouslyWorkedQty<  this.state.TaskInfo["Quantity"]){
                    //    // else if (totalquantity > this.state.TaskInfo["Quantity"]) {
                    //         this.setState({ QuantityWorkedError: "Budgeted quantity is " + this.state.TaskInfo["Quantity"] });
                    //         if (success) {
                    //             this.refs.quantityWorked.focus();
                    //             success = false;
                    //         }
                    //     }
                        else {
                            this.setState({ QuantityWorkedError: "" });
                        }
                    }
                    else {
                        if (quantityWorked == "" || !quantityWorked) {
                            quantityWorked = 0
                        }
                        if (quantityWorked > this.state.TaskInfo["Quantity"]) {
                            this.setState({ QuantityWorkedError: "Your budgeted quantity is " + this.state.TaskInfo["Quantity"] });
                            if (success) {
                                this.refs.quantityWorked.focus();
                                success = false;
                            }
                        }
                    }
                }

            }
        }

        if (this.state.ActionType !== "AcceptToClose" && this.state.ActionType !== "Reopen" && this.state.ActionType !== "Comments") {
            var numberOfHoursWorked = this.refs.hoursWorked._lastNativeText;
            var budgetedQuantity = this.state.TaskInfo["Quantity"];

            if (this.state.IsAcknowledged) {
                if (this.state.ActionType !== "Assign" || this.state.ActionType !== "Resolved") {
                    if (!numberOfHoursWorked || numberOfHoursWorked === "0") {
                        this.setState({ HoursWorkedError: "Please enter number of hours worked" });
                        if (success) {
                            this.refs.hoursWorked.focus();
                            success = false;
                        }
                    }
                    else if (parseInt(numberOfHoursWorked) > 10) {
                        this.setState({ HoursWorkedError: "Hours worked should not be greater than 10" });
                        if (success) {
                            this.refs.hoursWorked.focus();
                            success = false;
                        }
                    }
                    else {
                        this.setState({ HoursWorkedError: "" });
                    }
                }
                else {
                    if (parseInt(numberOfHoursWorked) > 10) {
                        this.setState({ HoursWorkedError: "Hours worked should not be greater than 10" });
                        if (success) {
                            this.refs.hoursWorked.focus();
                            success = false;
                        }
                    }
                    else if (parseInt(numberOfHoursWorked) < 0) {
                        this.setState({ HoursWorkedError: "Enter valid hours worked" });
                        if (success) {
                            this.refs.hoursWorked.focus();
                            success = false;
                        }
                    }
                    else {
                        this.setState({ HoursWorkedError: "" });
                    }
                }

                if (this.state.TaskInfo["Quantity"] !== null) {
                    var budgetedQuantity = this.state.TaskInfo["Quantity"];
                    var quantityWorked = this.refs.quantityWorked._lastNativeText;

                    if (this.state.ActionType !== "Resolved" && this.state.ActionType !== "Assign") {
                        if (!quantityWorked || quantityWorked == "" || parseInt(quantityWorked) <= 0) {
                            this.setState({ QuantityWorkedError: "Please enter quantity you have worked" });
                            if (success) {
                                this.refs.quantityWorked.focus();
                                success = false;
                            }
                        }

                        else if (parseInt(quantityWorked) > parseInt(budgetedQuantity)) {
                            this.setState({ QuantityWorkedError: "Should not be greater than budgeted quantity" });
                            if (success) {
                                this.refs.quantityWorked.focus();
                                success = false;
                            }
                        }
                        else {
                            this.setState({ QuantityWorkedError: "" });
                        }
                    }
                }
                // else if(previouslyWorkedQty!=null)
                // {
                //     var totalWorkedQuantity = parseInt(previouslyWorkedQty) + parseInt(quantityWorked);
                //     if(parseInt(totalWorkedQuantity) >parseInt(budgetedQuantity)) {
                //         if(success){
                //             this.refs.quantityWorked.focus();
                //             success= false;
                //            }
                //         this.setState({QuantityWorkedError:"You have already worked " +  previouslyWorkedQty + " quantity "});
                //     }
                // }
            }
            else {
                if (this.state.ActionType !== "Assign") {
                    if (numberOfHoursWorked && parseInt(numberOfHoursWorked) > 10) {
                        this.setState({ HoursWorkedError: "Hours worked should not be greater than 10" });
                        if (success) {
                            this.refs.hoursWorked.focus();
                            success = false;
                        }
                    }
                    else {
                        this.setState({ HoursWorkedError: "" });
                    }
                    if (this.state.TaskInfo["Quantity"] !== null) {
                        var quantityWorked = this.refs.quantityWorked._lastNativeText;
                        //      if(quantityWorked !== undefined|| quantityWorked!="" ){
                        if (parseInt(quantityWorked) > parseInt(this.state.TaskInfo["Quantity"])) {
                            this.setState({ QuantityWorkedError: "Should not be greater than budgeted quantity" });
                            if (success) {
                                this.refs.quantityWorked.focus();
                                success = false;
                            }
                        }
                        //      }
                    }
                }

            }

        }

        var action = this.refs.action._lastNativeText;
        if (!action || action.trim().length === 0) {
            this.setState({ ActionError: "Please enter action" });
            if (success) {
                this.refs.action.focus();
                success = false;
            }
        }
        else {
            this.setState({ ActionError: "" });
        }

        return success;
    }
}



export default Dashboard;


const styles = StyleSheet.create({
    element: {
        padding: 5,
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    lightText: {
        color: "#737373"
    },

    datePickerBox: {
        // borderColor: "#ccc",
        // borderWidth: 1,
        // width: '100%',
        // height: 45,
        // borderRadius: 5,
        // padding: 6,
    },

});

