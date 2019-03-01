import React from 'react';
import { Modal,  ScrollView, TextInput, TouchableOpacity, View, ListView} from "react-native";
import {
        Body, Button, Fab, Header, Icon, Left, List, ListItem,
        Right, Spinner, Text, Title, Toast
    } from "native-base";
import { orgId, roles } from '../Globals';
import { MyFetch } from '../MyAjax';
import moment from 'moment';
import { ApiUrl } from '../Config';
import MasterStyles from '../MasterStyles';
import DateSelector from './UserDefined/DateSelector';
import MyPicker from './UserDefined/MyPicker';


class MyReport extends React.Component{

    constructor(props){
        super(props);
        var Priorities = [{ value: "", label: "All" }, { value: 0, label: "High" }, { value: 1, label: "Medium" }, { value: 2, label: "Low" }]
        var Statuses = [ {value:'ALL', label:'All'}, { value: 'Closed', label: 'Closed' },{value: 'Open', label: 'Open' },
                         { value: 'Pending', label: 'Pending' },{value:'InProcess', label:'InProcess'}, {value:'NotResolved', label:'Not Resolved'},
                         {value:'NotClosed', label:'Not Closed'}, {value:'Resolved', label:'Resolved' },
                         { value: 'Reopened', label: 'Reopened' }]
          this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            this.state={
            MyReport:[], Status:null, active:false, FromDate:moment().startOf('week').format("YYYY-MM-DD"), 
            ToDate: moment().format("YYYY-MM-DD"), TaskId: '', Priority:null, currentPage: 1, sizePerPage: 10, 
            dataTotalSize: 0, IsDataAvailable: false, Priorities: Priorities, Statuses: Statuses, Status:'ALL',
            Priority:null,ToDateError: '', FromDateError: '', Client:'',FilterModal: false,TaskIdError:'',
            Clients:[],
        }
    }

    componentWillMount(){
        var OrgId = roles.indexOf("SuperAdmin") !== -1 ? null : orgId;
        MyFetch(ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + OrgId, "GET", null)
            .then((data) => {
                this.setState({ Clients: data["clients"] })
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

         this.getMyReport(this.state.currentPage, this.state.sizePerPage)
    }

    getMyReport(page,count){
        var url= ApiUrl + "/api/Activities/GetMyReport?fromDate=" + moment(this.state.FromDate).format("YYYY-MM-DD") + 
        "&toDate=" + moment(this.state.ToDate).format("YYYY-MM-DD") + "&client=" + this.state.Client +
        "&status=" + this.state.Status+ "&priority=" + this.state.Priority +
        "&taskId="+ this.state.TaskId

        MyFetch(url, "GET" , null).then((data)=>{
            var myReport= this.state.MyReport;
            myReport= myReport.concat(data["myActivityReport"]);
            this.setState({MyReport: myReport, IsDataAvailable: true})
        }).catch((error)=>{
            error.text().then(errorMessage => {
                Toast.show({
                    text: errorMessage,
                    buttonText: 'Okay',
                    position: "bottom",
                    duration: 10000,
                    type: "danger"
                })
            })
        })
    }

    onEndReached = async () => {
        if (this.state.MyReport.length !== this.state.currentPage * this.state.sizePerPage) {
            return;
        }
        this.setState({ IsDataAvailable: false });
        this.getMyReport(this.state.currentPage + 1, this.state.sizePerPage);
    }

    render(){
        return(
            <View style={{ flexGrow: 1 }}> 
              <Header hasTabs>
                    <Left>
                        <Button  transparent onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                      </Left>
                          <Body>
                            <Title>My Report</Title>
                          </Body> 
                     <Right></Right>
                </Header>
                <List  
                  onEndReachedThreshold={0.7}
                  onEndReached={() => this.onEndReached()}
                  dataArray={this.state.MyReport}
                   renderRow={data => {
                       return(
                          <ListItem button onPress={()=>this.props.navigation.navigate('TaskDetail', { data })}
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
                    <Button disabled style={{ backgroundColor: '#DD5144' }}>
                        <Icon name="search" />
                    </Button>
                </Fab>

              <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.FilterModal}
                onRequestClose={() => { }}>
                    <ScrollView style={{ flex: 1, flexDirection: "column" }}>
                        <Header hasTabs >
                            <Left />
                            <Body>
                                <Title>Filter Report</Title>
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
                                <Text style={MasterStyles.label}>From Date</Text>
                                <DateSelector placeholder="From Date" value={this.state.FromDate}
                                      onChange={(date) => this.setState({ FromDate:date },()=>{
                                        if(date==null)
                                        {
                                            this.setState({ FromDateError: "From date is required" });
                                        }
                                        else {
                                            if(moment(date).isAfter(this.state.ToDate)){
                                                this.setState({ FromDateError: "From date is greater than to date " });
                                            }
                                            else{
                                                this.setState({ FromDateError: "" });
                                            }
                                        }
                                      })}
                                    />
                                <Text style={MasterStyles.errorText}>{this.state.FromDateError}</Text>
                            </View>
                            <View style={MasterStyles.inputContainer}>
                                <Text style={MasterStyles.label}>To Date</Text>
                                <DateSelector placeholder="To Date" value={this.state.ToDate}
                                        onChange={(date) => this.setState({ ToDate: date },()=>{
                                            if(date==null)
                                            {
                                                this.setState({ ToDateError: "To date required" });
                                            }
                                            else{
                                                this.setState({ ToDateError: "" });
                                            }
                                        })}
                                     />
                                 <Text style={MasterStyles.errorText}>{this.state.ToDateError}</Text>
                            </View>
                            <View style={MasterStyles.inputContainer}>
                                <Text style={MasterStyles.label}>Client</Text>
                                <MyPicker
                                    mode="dropdown"
                                    placeholder="Select Client"
                                    iosHeader="Select Client"
                                    value={this.state.Client}
                                    onChange={(itemValue) => { 
                                        if(!itemValue){
                                            this.setState({ Client: '' })
                                        }
                                        else{
                                            this.setState({ Client: itemValue })
                                        }
                                    }}
                                    options={this.state.Clients}
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
                                    onChange={(itemValue) => { 
                                        if(!itemValue){
                                            this.setState({ Status: 'ALL' })
                                        }
                                        else{
                                            this.setState({ Status: itemValue })
                                        }
                                    }}
                                    options={this.state.Statuses}
                                />
                            </View>
                            <View style={MasterStyles.inputContainer}>
                                    <Text style={MasterStyles.label}>Task Id</Text>
                                    <TextInput style={MasterStyles.textInput}
                                         returnKeyType="next" ref="taskId"  placeholder="Task Id"
                                          defaultValue={this.state.TaskId } onChangeText={(text)=>{
                                              if(text.length>=9){
                                                  this.setState({TaskIdError: "Enter a valid TaskId"})
                                              }
                                              else{
                                                this.setState({TaskIdError: ""})
                                              }
                                          }}
                                     />
                                      <Text style={MasterStyles.errorText}>{this.state.TaskIdError}</Text>
                             </View>
                          
                        </View>
                    </ScrollView>
                    <Button full info onPress={() => { 
                        this.setState({ IsDataAvailable: false, MyReport: [] },()=>{ 
                            if(this.state.FromDateError!=="" || this.state.ToDateError!=="" || this.state.TaskIdError!=="" ){
                               this.setState({FilterModal: true})
                            }
                            else{
                                this.setState({FilterModal: false},()=>{
                                        this.getMyReport(1, this.state.sizePerPage)
                                     })
                            }
                               }); 
                         }}
                        >
                        <Text>Ok</Text>
                    </Button>
             </Modal>
        
            </View>
        )
    }

   
    renderStars(priority){
        var number= 0;
        if(priority=="HIGH"){
             number=0;
        }
        else if(priority=="MEDIUM"){
            number=1;
        }
        else{
            number=2;
        }
       var stars=[];
       for(var i=0; i<3-number; i++){
        stars.push(<Icon key={i} name="star" active={true} style={[{ fontSize: 19, lineHeight: 20 }, number === 0 ? MasterStyles.high : number === 1 ? MasterStyles.medium : MasterStyles.low]} />);
       }
       return stars;
    }

    priorityChanged(itemValue) {
        if (itemValue === null) {
            itemValue === "";
        }
        this.setState({ Priority: itemValue });
    }

    statusChanged(itemValue) {
        if (itemValue === null || !itemValue) {
            itemValue === "ALL";
        }
        this.setState({ Status: itemValue });
    }
}

export default MyReport;
