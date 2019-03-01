import React from "react";
import { MyFetch } from "../../MyAjax";
import { ApiUrl } from "../../Config";
import moment from "moment";
import { Body, Text, Toast, Right, Fab, Icon, Button, Header, Left, Title, Container, Spinner } from "native-base";
import { StyleSheet, Modal, ScrollView, View, TouchableOpacity, ListView, FlatList, TouchableHighlight } from "react-native";
import MyPicker from "../UserDefined/MyPicker";
import DateSelector from '../UserDefined/DateSelector';
import { orgId, roles } from "../../Globals.js";
import MasterStyles from '../../MasterStyles';
import Loader from '../../Loader';

const sortProps = [
  { label: "From Date", value: "FromDate" },
  { label: "Client", value: "Client" },
  { label: "Project", value: "Project" },
  { label: "Status", value: "Status" }
];

class StockRequests extends React.Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    var Statuses = [{ value: "Under Review", label: "Under Review" },
    { value: "Dispatched", label: "Dispatched" }, { value: "Approved", label: "Approved" },
    { value: "Declined", label: "Declined" }
    ];
    this.state = {
      StockRequestsList: [], Client: "", Clients: [], Project: null, Projects: [], currentPage: 1, sizePerPage: 10,
      isDataAvailable: false, Status: "", active: false, FilterModal: false, SortModal: false, loadingFilterModal: false,
      Statuses: Statuses, Status: "Under Review", SortProps: sortProps, FromDate: moment().startOf("week"), ToDate: moment(),
    };
  }

  componentWillMount() {
    var OrgId = roles.indexOf("SuperAdmin") != -1 ? null : orgId;

    MyFetch(ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + OrgId, "GET", null).then(data => {
      this.setState({ Clients: data["clients"] });
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

    this.GetStockRequests(this.state.currentPage, this.state.sizePerPage);

  }

  GetStockRequests(page, count) {
    this.setState({ IsDataAvailable: false });
    var url = ApiUrl + "/api/Stock/GetStockRequests?client=" + this.state.Client +
      "&project=" + this.state.Project +
      "&fromDate=" + moment(this.state.FromDate).format("YYYY-MM-DD") +
      "&toDate=" + moment(this.state.ToDate).format("YYYY-MM-DD") +
      "&status=" + this.state.Status +
      "&page=" + page + "&count=" + count;

    MyFetch(url, "GET", null)
      .then(data => {
        this.setState({
          StockRequestsList: [...this.state.StockRequestsList, ...data["stockRequests"]],
          IsDataAvailable: true,
          currentPage: page,
          sizePerPage: count
        });
      }).catch((error) => {
        this.setState({ IsDataAvailable: true });
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

  onEndReached() {
    if (this.state.StockRequestsList.length !== this.state.currentPage * this.state.sizePerPage) {
      return;
    }
    this.GetStockRequests(this.state.currentPage + 1, this.state.sizePerPage);
  }

  refreshTasks() {

    this.setState({ currentPage: 1, sizePerPage: 10, TasksOnMe: [] }, () => {
      this.GetStockRequests(1, this.state.sizePerPage);
    })

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
            <Title>Stock Requests</Title>
          </Body>
          <Right>
            <Button transparent
              onPress={() => this.refreshTasks()}>
              <Icon name='refresh' />
            </Button>
          </Right>
        </Header>

        <View style={{ flexGrow: 1 }}>
          {
            this.state.IsDataAvailable ?
              <View />
              :
              <Spinner color='#03a9f4' />
          }

          <FlatList
            data={this.state.StockRequestsList}
            onEndReachedThreshold={0.7}
            onEndReached={() => this.onEndReached()}
            keyExtractor={(item) => (Math.random() + item["Id"]).toString()}
            ListEmptyComponent={() => { return this.state.IsDataAvailable ? <Text style={{ textAlign: 'center' }}>No Requests Available</Text> : null }}
            ItemSeparatorComponent={() => { return <View style={{ borderColor: "#cecece", borderBottomWidth: 1 }}></View> }}
            renderItem={({ item }) =>
              <TouchableHighlight onPress={() => this.props.navigation.navigate('StockRequestView', { item })}
                style={[{ marginLeft: 0, padding: 10 }]}>
                <View>
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 18 }}>
                      Request-{item["Id"]}
                    </Text>
                    <Text style={[{ fontSize: 15 }, item["Status"] == "Approved" ? styles.approved : item["Status"] == "Dispatched" ? styles.dispatch : styles.review]} >
                      {item["Status"]}
                    </Text>
                    <Text style={{ fontSize: 15 }}>
                      {moment(item["RequestDate"]).format("DD-MMM-YYYY")}
                    </Text>
                  </View>
                  <Text note> {item["ProjectName"]}</Text>
                </View>
              </TouchableHighlight>
            }
          />

          <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: "#5067FF" }}
            position="bottomRight"
            onPress={() => this.setState({ active: !this.state.active })}
          >
            <Icon name="options" />
            <Button style={{ backgroundColor: "#34A34F" }}
              onPress={() => this.setState({ FilterModal: true })} >
              <Icon name="funnel" />
            </Button>
            {/* <Button style={{ backgroundColor: "#5067FF" }} onPress={() => this.setState({ SortModal: true })} >
              <Icon name="sort" type="FontAwesome" />
            </Button> */}
          </Fab>

          {/* <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.SortModal}
            onRequestClose={() => { }}
          >
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Header hasTabs>
                <View>
                  <Title>Sort Requests</Title>
                </View>
                <Right>
                  <Button
                    transparent
                    onPress={() => this.setState({ SortModal: false })}
                  >
                    <Icon name="close-circle" />
                  </Button>
                </Right>
              </Header>
              <View style={{ flexGrow: 1 }}>
                <List
                  dataSource={this.ds.cloneWithRows(this.state.SortProps)}
                  renderRow={data => (
                    <ListItem style={{ paddingLeft: 10 }}>
                      <Text> {data["label"]} </Text>
                    </ListItem>
                  )}
                  renderLeftHiddenRow={data => (
                    <Button
                      full
                      primary
                      onPress={() => this.sortAsc(data["value"])}
                    >
                      <Icon active name="arrow-round-up" />
                    </Button>
                  )}
                  renderRightHiddenRow={data => (
                    <Button
                      full
                      warning
                      onPress={() => this.sortDesc(data["value"])}
                    >
                      <Icon active name="arrow-round-down" />
                    </Button>
                  )}
                  leftOpenValue={75}
                  rightOpenValue={-75}
                />
              </View>
              <Button full danger onPress={() => this.setState({ SortModal: false })} >
                <Text>Cancel</Text>
              </Button>
            </View>
          </Modal> */}

          <Modal animationType="slide" transparent={false} visible={this.state.FilterModal}
            onRequestClose={() => { }} >
            <View style={{ flex: 1, flexDirection: "column" }}>
              <Header hasTabs>
                <Body>
                  <Title>Filter Requests</Title>
                </Body>
                <Right>
                  <Button transparent
                    onPress={() => this.setState({ FilterModal: false })}>
                    <Icon name='close-circle' />
                  </Button>
                </Right>
              </Header>

              <View style={{ flexGrow: 1 }}>

                <Loader loading={this.state.loadingFilterModal} />

                <View style={MasterStyles.inputContainer}>
                  <Text style={MasterStyles.label}>Client</Text>
                  <MyPicker options={this.state.Clients} placeholder="Select Client" iosHeader="Client"
                    value={this.state.Client} onChange={(itemValue) => this.onClientChange(itemValue)} />
                </View>

                <View style={MasterStyles.inputContainer}>
                  <Text style={MasterStyles.label}>Project</Text>
                  <MyPicker placeholder="Select project"
                    iosHeader="Project" options={this.state.Projects}
                    value={this.state.Project}
                    onChange={(itemValue) => { this.setState({ Project: itemValue }); }} />
                </View>

                <View style={MasterStyles.inputContainer} >
                  <Text style={MasterStyles.label}>From Date</Text>
                  <DateSelector placeholder="From Date" value={this.state.FromDate}
                    onChange={(date) => this.setState({ FromDate: date })}
                  />
                </View>

                <View style={MasterStyles.inputContainer} >
                  <Text style={MasterStyles.label}>To Date</Text>
                  <DateSelector placeholder="To Date" value={this.state.ToDate}
                    onChange={(date) => this.setState({ ToDate: date })}
                  />
                </View>

                <View style={MasterStyles.inputContainer}>
                  <Text style={MasterStyles.label}>Status</Text>
                  <MyPicker placeholder="Select status"
                    iosHeader="Status" options={this.state.Statuses}
                    value={this.state.Status}
                    onChange={(itemValue) => { this.setState({ Status: itemValue }); }} />
                </View>

              </View>
            </View>

            <Button full info onPress={() => {
              this.setState({ FilterModal: false, IsDataAvailable: false, StockRequestsList: [] }, () => {
                this.GetStockRequests(1, this.state.sizePerPage)
              });
            }}>
              <Text>Ok </Text>
            </Button>
          </Modal>

        </View>
      </Container >
    );
  }

  onClientChange(itemValue) {
    this.setState({ Client: itemValue, loadingFilterModal: true }, () => {
      if (itemValue !== null) {
        MyFetch(ApiUrl + "/api/Client/GetClientProjects?clientId=" +
          itemValue, "GET", null).then(data => {
            this.setState({ Projects: data["clientProjects"], loadingFilterModal: false });
          }).catch(error => {
            error.text().then(errorMessage => {
              Toast.show({
                text: errorMessage,
                buttonText: "Okay",
                position: "bottom",
                duration: 10000,
                type: "danger"
              });
            });
          });
      }
      else {
        this.setState({ Projects: [], Client: "" })
      }
    });
  }

  /* sort column in ascending order and refresh the list   */
  sortAsc(column) {
    var stockRequests = this.state.StockRequestsList;

    {
      /*sort the column in ascending order and return list */
    }

    if (stockRequests.length > 1) {
      if (column == "FromDate") {
        stockRequests.sort((a, b) => moment(a.RequestDate) - moment(b.RequestDate));
      }
      if (column == "Client") {
        stockRequests.sort((a, b) => a.ShortName.localeCompare(b.ShortName, undefined, { caseFirst: "upper" }));
      }
      if (column == "Project") {
        stockRequests.sort((a, b) =>
          a.ProjectName.localeCompare(b.ProjectName, undefined, {
            caseFirst: "upper"
          })
        );
      }
      if (column == "Status") {
        stockRequests.sort((a, b) =>
          a.Status.localeCompare(b.Status, undefined, { caseFirst: "upper" })
        );
      }
      this.setState({
        IsDataAvailable: true,
        currentPage: 1,
        SortModal: false,
        StockRequestsList: stockRequests
      });
    }
  }

  /* sort column in descending order and refresh the list   */
  sortDesc(column) {
    var stockRequests = this.state.StockRequestsList;

    if (stockRequests.length > 1) {
      if (column == "FromDate") {
        stockRequests.sort(
          (a, b) => moment(b.RequestDate) - moment(a.RequestDate)
        );
      }
      if (column == "Client") {
        stockRequests.sort((a, b) =>
          b.ShortName.localeCompare(a.ShortName, undefined, {
            caseFirst: "upper"
          })
        );
      }
      if (column == "Project") {
        stockRequests.sort((a, b) =>
          b.ProjectName.localeCompare(a.ProjectName, undefined, {
            caseFirst: "upper"
          })
        );
      }
      if (column == "Status") {
        stockRequests.sort((a, b) =>
          b.Status.localeCompare(a.Status, undefined, { caseFirst: "upper" })
        );
      }
      this.setState({
        IsDataAvailable: true,
        currentPage: 1,
        SortModal: false,
        StockRequestsList: stockRequests
      });
    }
  }
}

const styles = StyleSheet.create({
  approved: {
    color: "green"
  },
  dispatch: {
    color: "blue"
  },
  review: {
    color: "red"
  }
});

export default StockRequests;
