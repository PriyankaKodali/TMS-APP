import React from "react";
import { MyFetch } from "../../MyAjax";
import { ApiUrl } from "../../Config";
import { ScrollView, View, TextInput, KeyboardAvoidingView } from "react-native";
import { Container, Button, Text, Header, Icon, Left, Right, Body, Toast, Title, H3 } from "native-base";
import MyPicker from "../UserDefined/MyPicker";
import MasterStyles from "../../MasterStyles";
import moment from "moment";
import DateSelector from '../UserDefined/DateSelector';
import AutoComplete from '../UserDefined/AutoComplete';
import { orgId, roles } from '../../Globals.js';
import Loader from '../../Loader';


class StockForProject extends React.Component {
  constructor(props) {
    super(props);
    var item = [{ Item: null, Description: "", Quantity: "", key: moment().toString() }];
    this.state = {
      Clients: [],
      Client: "",
      Projects: [],
      Project: null,
      Items: [],
      Item: null,
      ViewForm: false,
      StockReqDate: null,
      ItemsList: item,
      ItemModels: [],
      loading: true,
    };
  }

  componentWillMount() {
    var OrgId = roles.indexOf("SuperAdmin") != -1 ? null : orgId;

    MyFetch(ApiUrl + "/api/MasterData/GetItems", "GET", null)
      .then(data => {
        this.setState({ Items: data["items"], ItemModels: data["items"] });
      })
      .catch(error => {
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

    MyFetch(
      ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + OrgId, "GET", null).then(data => {
        this.setState({ Clients: data["clients"], loading: false });
      }).catch(error => {
        error.text().then(errorMessage => {
          Toast.show({
            text: errorMessage,
            buttonText: "Okay",
            position: "bottom",
            duration: 10000,
            type: "danger"
          });
          this.setState({ loading: false });
        });
      });;
  }

  onClientChange(itemValue) {
    this.setState({ Client: itemValue }, () => {
      if (itemValue !== "") {
        MyFetch(ApiUrl + "/api/Client/GetClientProjects?clientId=" + itemValue,
          "GET", null).then(data => {
            this.setState({ Projects: data["clientProjects"] });
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
        this.state.Client = "";
      }
    });
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Material request</Title>
          </Body>
          <Right />
        </Header>

        <ScrollView >
          <Loader loading={this.state.loading} />
          <View style={MasterStyles.inputContainer}>
            <Text style={MasterStyles.label}>Client</Text>
            <MyPicker
              key={this.state.Client}
              mode="dropdown"
              placeholder="Select client"
              iosHeader="Client"
              options={this.state.Clients}
              value={this.state.Client}
              onChange={(itemValue) => this.onClientChange(itemValue)}
            />
            <Text style={MasterStyles.errorText}>{this.state.ClientError}</Text>
          </View>

          <View style={MasterStyles.inputContainer}>
            <Text style={MasterStyles.label}>Project</Text>
            <MyPicker
              key={this.state.Projects}
              mode="dropdown"
              placeholder="Select project"
              iosHeader="Project"
              options={this.state.Projects}
              value={this.state.Project}
              onChange={(itemValue) => {
                this.setState({ Project: itemValue });
              }}
            />
            <Text style={MasterStyles.errorText}>{this.state.ProjectError}</Text>
          </View>

          <View style={MasterStyles.inputContainer}>
            <Text style={MasterStyles.label}>Stock Required on or before</Text>
            <DateSelector placeholder="Required Date" value={this.state.StockReqDate} onChange={(date) => this.setState({ StockReqDate: date })} />
            <Text style={MasterStyles.errorText}>{this.state.RequiredDateError}</Text>
          </View>

          <View style={{ margin: 5, borderColor: "#cecece", borderWidth: 1 }}>
            <View style={{ padding: 5, backgroundColor: "#81abbf", }}>
              <H3 style={{ textAlign: 'center', color: "#fff" }}>Items Required</H3>
            </View>
            {
              this.state.ItemsList.map((item, i) => {
                return (
                  <View key={"item_" + i} style={{ width: '100%', display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 2, marginBottom: 2 }}>

                    <View style={[{ flexGrow: 1, flexShrink: 1, margin: 1, }, MasterStyles.inputContainer]}>
                      <AutoComplete placeholder="Select Item" value={item.Item} label="Item"
                        options={
                          this.state.Items.filter((option) => {
                            return this.state.ItemsList.filter((selectedItem) => { return selectedItem.Item === option; }).length === 0;
                          })
                        } onSelect={(item) => { this.onItemChange(item, i) }}
                      />
                    </View>

                    <View style={{ width: 80, margin: 1 }}>
                      <TextInput style={MasterStyles.textInput}
                        placeholder="Quantity"
                        keyboardType="numeric"
                        value={this.state.ItemsList[i]["Quantity"]}
                        onChangeText={text => {
                          var items = this.state.ItemsList;
                          items[i]["Quantity"] = text.replace(/[^0-9]/g, '');
                          this.setState({ ItemsList: items });
                        }}
                      />
                    </View>

                    <View>
                      <Button transparent style={{ padding: 0 }} onPress={() => this.removeItem(i)}>
                        <Icon style={{ color: "red", padding: 0 }}
                          active name="trash" />
                      </Button>
                    </View>
                  </View>
                );
              })
            }

            <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
              <Button bordered info onPress={this.AddNewItemClick.bind(this)}>
                <Text style={{ color: "#91c0f7" }}>+ Add Item</Text>
              </Button>
            </View>

            <Text style={MasterStyles.errorText}>{this.state.ItemsError}</Text>

          </View>


          <View style={MasterStyles.inputContainer}>
            <Text style={MasterStyles.label}>Notes</Text>
            <TextInput
              style={MasterStyles.multiLineTextInput}
              ref="description"
              placeholder="Brief Description"
              multiline={true}
            />
            <Text style={MasterStyles.errorText}>{this.state.NotesError}</Text>
          </View>

          <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
            <Button primary onPress={this.SubmitClick.bind(this)}><Text> Submit </Text></Button>
          </View>
        </ScrollView>

      </Container>
    );
  }

  removeItem(i) {
    if (this.state.ItemsList.length > 1) {
      var itemlist = this.state.ItemsList
      itemlist.splice(i, 1);
      this.setState({ ItemsList: itemlist });
    }
    else {
      Toast.show({
        text: "Request should contain atleast one item",
        buttonText: "Okay",
        position: "bottom",
        duration: 10000,
        type: "danger"
      });
    }
    return;
  }

  AddNewItemClick() {
    var items = this.state.ItemsList;
    items.push({
      Item: null,
      Description: "",
      Quantity: "",
      key: moment().toString()
    });
    this.setState({ ItemsList: items });
  }

  onItemChange(item, index) {
    var items = this.state.ItemsList;
    items[index].Item = item;
    this.setState({ ItemsList: items });
  }

  SubmitClick() {
    if (!this.validate()) {
      return;
    }
    this.setState({ loading: true });
    var data = new FormData();

    var selectedItemsList = this.state.ItemsList.map((item) => {
      return {
        ModelId: item["Item"]["value"],
        Quantity: item["Quantity"]
      }
    });

    data.append("client", this.state.Client);
    data.append("project", this.state.Project);
    data.append("expectedDate", moment(this.state.StockReqDate).format("YYYY-MM-DD"));
    data.append("items", JSON.stringify(selectedItemsList));
    data.append("notes", this.refs.description._lastNativeText);

    MyFetch(ApiUrl + "/api/Stock/AddMaterialRequest", "POST", data)
      .then(() => {
        Toast.show({
          text: "Stock request for project is successfull!",
          buttonText: "Okay",
          position: "bottom",
          duration: 10000,
          type: "success"
        });
        this.props.navigation.navigate('StockRequests');
      })
      .catch(error => {
        this.setState({ loading: false });
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

  validate() {
    var success = true;
    var items = this.state.ItemsList;
    var exists = items.findIndex(
      i => i.Item == null || i.Quantity == "" || i.Quantity == 0
    );

    //  var invalidItem=items.findIndex((item)=>item.Item == null || item.Quantity == "" || item.Quantity ==0);

    var notes = this.refs.description._lastNativeText;

    if (!this.state.Client) {
      success = false;
      this.setState({ ClientError: "Please select client" });
    } else {
      this.setState({ ClientError: "" });
    }

    if (!this.state.Project) {
      success = false;
      this.setState({ ProjectError: "Please select Project" });
    } else {
      this.setState({ ProjectError: "" });
    }

    if (!this.state.StockReqDate) {
      success = false;
      this.setState({ RequiredDateError: "Please enter stock required data" });
    } else {
      this.setState({ RequiredDateError: "" });
    }

    if (exists !== -1) {
      success = false;
      Toast.show({
        text: "List of items required is incomplete",
        buttonText: "Okay",
        position: "bottom",
        duration: 10000,
        type: "danger"
      });
      this.setState({
        //  ItemsError: "Please enter List of items required along with quantity"
      });
    }

    if (!notes || notes.trim().length === 0) {
      success = false;
      this.setState({ NotesError: "Please a few details about stock request" });
    } else {
      this.setState({ NotesError: "" });
    }

    return success;
  }
}


export default StockForProject;

