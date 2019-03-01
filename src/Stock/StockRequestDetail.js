import React from "react";
import moment from "moment";
import { ApiUrl } from "../../Config";
import { MyFetch } from "../../MyAjax";
import { ScrollView, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard } from "react-native";
import { Container, Button, Text, Header, Icon, Left, ListItem, Right, Toast, List, Title, Body } from "native-base";
import { orgId, empId, roles } from "../../Globals.js";
import MasterStyles from "../../MasterStyles";
import MyPicker from "../UserDefined/MyPicker";
import { DatePickerDialog } from "react-native-datepicker-dialog";
import ItemsPicker from "../UserDefined/ItemsPicker";
import Loader from "../../Loader";

class StockRequestDetail extends React.Component {
  constructor(props) {
    super(props);

    MyFetch(ApiUrl + "/api/MasterData/GetItems", "GET", null)
      .then(data => {
        this.setState({ Items: data["items"], ItemModels: data["items"] });
      }).catch((error) => {
        Toast.show({
          text: error,
          buttonText: 'Okay',
          position: "bottom",
          duration: 10000,
          type: "danger"
        })
      });

    var items = [{ Item: null, Description: "", Quantity: "", Id: "", NoOfItemsAvailable: "", key: moment().toString() }];
    this.state = {
      Client: null, Project: null, StockReqDate: "", ItemsList: items, RequestedItems: [], StockRequestDetails: [],
      AllowItemsForEdit: true, IsStockManager: false, StockManagers: [], AllowUserForStockEdit: true, Status: "", Items: [],
      Item: null, Clients: [], Projects: [], StockReqDate: null, StockReqDateText: "", StockAvailability: true, loading: false
    };
  }

  componentWillMount() {
    var stockRequestId = this.props.navigation.state.params.item.Id;
    var OrgId = roles.indexOf("SuperAdmin") != -1 ? null : orgId;

    MyFetch(ApiUrl + "/api/MasterData/GetClientsWithAspNetUserId?orgId=" + OrgId,
      "GET", null).then((data) => {
        this.setState({ Clients: data["clients"] });
      }).catch((error) => {
        Toast.show({
          text: error,
          buttonText: 'Okay',
          position: "bottom",
          duration: 10000,
          type: "danger"
        })
      });



    MyFetch(ApiUrl + "/api/Stock/GetStockManagers", "GET", null)
      .then(data => {
        this.setState({ StockManagers: data["stockManagers"] }, () => {
          var stockManagers = data["stockManagers"];
          var user = empId;
          var isManager = stockManagers.findIndex(i => i.AspNetUserId == user);
          if (isManager != -1) {
            this.setState({ IsStockManager: true });
          }
        });
      }).catch((error) => {
        Toast.show({
          text: error,
          buttonText: 'Okay',
          position: "bottom",
          duration: 10000,
          type: "danger"
        })
      });


    MyFetch(ApiUrl + "/api/Stock/GetStockRequest?stockReqId=" + stockRequestId, "GET", null)
      .then((data) => {
        this.setState({
          StockRequestDetails: data["stockRequest"], RequestedItems: data["stockRequestItems"]
        }, () => {
          var reqItems = data["stockRequestItems"];
          var status = data["stockRequest"]["Status"];

          var items = [];
          reqItems.map((ele, i) => {
            var item = {
              Item: { value: ele["ModelId"], label: ele["ItemName"] },
              // Item: ele["ModelId"],
              Description: ele["Description"],
              Quantity: ele["Quantity"].toString(),
              Id: ele["StockReqMappingId"],
              NoOfItemsAvailable: ele["NoOfItemsAvailable"].toString()
            };
            items.push(item);
          });

          var Exists = items.findIndex(i => parseInt(i.Quantity) > parseInt(i.NoOfItemsAvailable));
          if (Exists !== -1) {
            this.setState({ StockAvailability: false });
          }
          if (status == "Approved" || status == "Declined" || status == "Dispatched") {
            this.setState({ AllowUserForStockEdit: false });
          }
          this.refs.description._lastNativeText = data["stockRequest"]["Notes"];

          this.setState({
            ItemsList: items,
            Client: data["stockRequest"]["Client"],
            Project: data["stockRequest"]["opportunityId"],
            StockReqDate: moment(data["stockRequest"]["ExpectedStockDate"]).format("YYYY-MM-DD"),
            StockReqDateText: moment(data["stockRequest"]["ExpectedStockDate"]).format("DD-MMM-YYYY")
          }, () => {
            if (data["stockRequest"]["Client"]) {
              MyFetch(ApiUrl + "/api/Client/GetClientProjects?clientId=" + data["stockRequest"]["Client"],
                "GET", null).then((data) => {
                  this.setState({ Projects: data["clientProjects"] });
                })
            }
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


  }

  Render_FlatList_Sticky_header() {
    return (
      <View style={{ height: 25, width: "100%", flexDirection: "row" }}>
        <Text style={{ fontWeight: "bold", width: 120, textAlign: 'left' }}>
          {" "}
          Item{" "}
        </Text>
        <Text style={{ fontWeight: "bold", width: 55 }}> Quantity </Text>
        {roles.indexOf("SuperAdmin") != -1 ? (
          <Text style={{ fontWeight: "bold", width: 65 }}>
            {" "}
            Availability{" "}
          </Text>
        ) : (
            <Text style={{ width: "25%" }} />
          )}
      </View>
    );
  }

  backClick() {
    this.props.navigation.navigate("StockRequests");
  }

  render() {
    return (
      <Container key={this.state.ItemsList}>
        <Header hastabs>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()} >
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Edit request</Title>
          </Body>
          <Right>
            <Button transparent onPress={this.backClick.bind(this)}>
              <Icon name="arrow-back" />
            </Button>
          </Right>
        </Header>

        <ScrollView>
          <Loader loading={this.state.loading} />
          <List noBorder >
            <ListItem >
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Status</Text>
                <Text
                  style={this.state.StockRequestDetails["Status"] == "Approved"
                    ? styles.approved
                    : this.state.StockRequestDetails["Status"] == "Dispatched"
                      ? styles.dispatch
                      : styles.review
                  }
                >
                  {" "}
                  <Text> {this.state.StockRequestDetails["Status"]} </Text>
                </Text>
              </View>
            </ListItem>
            <ListItem>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <Text>Stock Requested By</Text>
                {/* <Text style={styles.lightText}>{this.state.TaskInfo["TaskDate"]}</Text> */}
                <Text style={{ color: "black", fontSize: 16 }}>
                  {" "}
                  {this.state.StockRequestDetails["Employee"]}
                </Text>
              </View>
            </ListItem>
          </List>
          <View style={styles.inputContainer}>
            <Text style={styles.label}> Client </Text>
            <MyPicker
              key={this.state.Client}
              mode="dropdown"
              placeholder="Select client"
              iosHeader="Client"
              options={this.state.Clients}
              value={this.state.Client}
              onChange={(itemValue, itemIndex) => {
                this.setState({ Client: itemValue }, () => {
                  MyFetch(
                    ApiUrl +
                    "/api/Client/GetClientProjects?clientId=" +
                    itemValue,
                    "GET",
                    null
                  ).then(data => {
                    this.setState({
                      Projects: data["clientProjects"],
                      Client: itemValue
                    });
                  });
                });
              }}
            />
            <Text style={MasterStyles.errorText}>{this.state.ClientError}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}> Project</Text>
            <MyPicker
              key={this.state.Projects}
              mode="dropdown"
              placeholder="Select project"
              iosHeader="Project"
              options={this.state.Projects}
              value={this.state.Project}
              onChange={(itemValue, itemIndex) => {
                this.setState({ Project: itemValue });
              }}
            />
            <Text style={MasterStyles.errorText}>
              {" "}
              {this.state.ProjectError}{" "}
            </Text>
          </View>

          <View style={styles.inputContainer} key={this.state.StockReqDate}>
            <View style={{ flex: 1, marginTop: 3 }}>
              <Text style={styles.label}>Stock Required on or before</Text>
              <TouchableOpacity onPress={this.onStockReqDatePress.bind(this)}>
                <View style={styles.datePickerBox}>
                  <Text style={styles.datePickerText}>
                    {this.state.StockReqDateText}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <DatePickerDialog
              ref="stockRequiredDate"
              onDatePicked={this.DatePicked.bind(this)}
            />
            <Text style={MasterStyles.errorText}>
              {this.state.RequiredDateError}
            </Text>
            <Text style={MasterStyles.errorText}>
              {this.state.RequiredDateError}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}> Items Required : </Text>
            <FlatList
              contentContainerStyle={{
                flexDirection: "column",
                alignItems: "center",
                paddingLeft: 10,
                paddingBottom: 10,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10
              }}
              data={this.state.ItemsList}
              keyExtractor={(item, index) => item.Id.toString()}
              horizontal={true}
              ListHeaderComponent={this.Render_FlatList_Sticky_header.bind(this)}
              renderItem={({ item, index }) => {
                return (
                  <ListItem icon noBorder>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingBottom: 5,
                        paddingTop: 5
                      }}
                    >
                      <View style={{ width: 140, height: 40, borderColor: 0, paddingLeft: 0 }} >
                        <ItemsPicker
                          placeholder="Select Item"
                          iosHeader="item"
                          options={this.state.Items}
                          SelectedItems={this.state.ItemsList}
                          selectedValue={this.state.ItemsList[index]["Item"]}
                          onChange={(itemValue, itemIndex) => {
                            var items = this.state.ItemsList;
                            var previouslySelected = items.findIndex(it => it.Item == itemValue);
                            var Models = this.state.Items;
                            var modelAvailability = ""
                            var modelIndex = this.state.Items.findIndex(it => it.value == itemValue);
                            var model = Models[modelIndex];

                            if (model["Availability"] !== undefined) {
                              modelAvailability = model["Availability"];
                            }

                            if (previouslySelected == -1) {
                              var item = items[index];
                              item.Item = itemValue;
                              item.NoOfItemsAvailable = modelAvailability.toString();
                              items[index] = item;
                              this.setState({ ItemsList: items });
                            } else {
                              var items = this.state.ItemsList;
                              var item = items[index];
                              item.Item = null;

                              this.setState({ ItemsList: items });
                              Toast.show({
                                text:
                                  "Item already selected, please check list",
                                buttonText: "Okay",
                                position: "bottom",
                                duration: 10000,
                                type: "warning"
                              });
                            }
                          }}
                        />
                      </View>

                      <View style={{ paddingLeft: 10 }}>
                        <TextInput style={{ width: 30, height: 45, borderColor: 0, borderWidth: 0, paddingLeft: 5 }}
                          defaultValue={item["Quantity"]}
                          placeholder="Quantity"
                          keyboardType="numeric"
                          onChangeText={text => {
                            var items = this.state.ItemsList;
                            var availableQuantity =
                              items[index]["NoOfItemsAvailable"];
                            items[index]["Quantity"] = text;

                            if (items[index]["Quantity"] > items[index]["NoOfItemsAvailable"]) {
                              this.setState({ StockAvailability: false });
                            } else {
                              this.setState({ StockAvailability: true });
                            }

                            this.setState({ ItemsList: items });
                          }}
                        />
                      </View>

                      {roles.indexOf("SuperAdmin") != -1 ? (
                        <View>
                          <TextInput style={{ width: 32, height: 40, borderColor: 0, borderWidth: 0, paddingLeft: 20 }}
                            value={item["NoOfItemsAvailable"] !== "" ? item["NoOfItemsAvailable"] : ""}
                          />
                        </View>
                      ) : (
                          <View style={{ width: 32, height: 40 }} />
                        )}

                      <Right>
                        {this.state.AllowUserForStockEdit == true ? (
                          <Button style={{ textAlign: 'right', paddingLeft: 20 }}
                            transparent
                            style={{ color: "red" }}
                            onPress={() => {
                              var items = this.state.ItemsList;
                              if (items.length > 1) {
                                items.splice(index, 1);
                              }
                              this.setState({ ItemsList: items });
                            }}
                          >
                            <Icon
                              style={{ color: "red", textAlign: 'right' }}
                              active
                              name="trash"
                            />
                          </Button>
                        ) : (
                            <Right>
                              <View style={{ textAlign: 'right', paddingLeft: 20 }}></View>
                            </Right>
                          )}
                      </Right>
                    </View>
                  </ListItem>
                );
              }}

            />

            {this.state.AllowUserForStockEdit == true ? (
              <View style={{ paddingLeft: 4, paddingRight: 4 }}>
                <Button
                  bordered
                  danger
                  onPress={this.AddNewItemClick.bind(this)}
                >
                  <Text style={{ color: "#E4011A" }}> + Add Another Item</Text>
                </Button>
              </View>
            ) : (
                <View />
              )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={MasterStyles.multiLineTextInput}
                ref="description"
                defaultValue={this.state.StockRequestDetails["Notes"]}
                placeholder="Brief Description"
                multiline={true}
              />
              <Text style={MasterStyles.errorText}>
                {this.state.NotesError}
              </Text>
            </View>

            {this.state.AllowUserForStockEdit == true &&
              this.state.IsStockManager == false ? (
                roles.indexOf("SuperAdmin") !== -1 ? (
                  <View style={{ flexDirection: "row", flex: 1, justifyContent: "center" }}
                    key={this.state.StockAvailability}
                  >
                    <Button
                      success
                      style={styles.buttonStyle}
                      disabled={!this.state.StockAvailability}
                      onPress={this.ApproveClick.bind(this)}
                    >
                      <Text>Approve</Text>
                    </Button>
                    <View style={{ paddingLeft: 10 }}>
                      <Button
                        danger
                        style={styles.buttonStyle}
                        disabled={!this.state.StockAvailability}
                        onPress={this.DeclineClick.bind(this)}
                      >
                        <Text>Decline</Text>
                      </Button>
                    </View>
                  </View>
                ) : (
                    <Button
                      info
                      style={styles.buttonStyle}
                      onPress={this.handleSubmitClick.bind(this)}
                    >
                      <Text> Submit </Text>
                    </Button>
                  )
              ) : this.state.IsStockManager == true &&
                this.state.StockRequestDetails["Status"] == "Approved" &&
                this.state.StockRequestDetails["Status"] !== "Declined" ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      flexDirection: "row",
                      paddingTop: 4,
                      borderRadius: 10
                    }}
                  >
                    <Button
                      info
                      style={styles.buttonStyle}
                      onPress={this.DispatchClick.bind(this)}
                    >
                      <Text>Dispatch</Text>
                    </Button>
                  </View>
                ) : (
                  <View />
                )}
          </View>
        </ScrollView>
      </Container>
    );
  }

  onStockReqDatePress() {
    let StockReqDate = this.state.StockReqDate;

    if (!StockReqDate || StockReqDate == null) {
      StockReqDate = new Date();
      this.setState({
        StockReqDate: StockReqDate
      });
    }

    //To open the dialog
    this.refs.stockRequiredDate.open({
      date: StockReqDate,
      minDate: new Date() //To restirct past date
    });
  }

  DatePicked(date) {
    this.setState({
      StockReqDate: date,
      StockReqDateText: moment(date).format("DD-MMM-YYYY")
    });
  }

  AddNewItemClick() {
    var items = this.state.ItemsList;
    items.push({
      Item: null,
      Description: "",
      Quantity: "",
      Id: "",
      key: moment().toString()
    });
    this.setState({ ItemsList: items });
  }

  ApproveClick() {
    this.setState({ Status: "Approved" }, () => {
      this.handleSubmitClick();
    });
  }

  DeclineClick() {
    this.setState({ Status: "Declined" }, () => {
      this.handleSubmitClick();
    });
  }

  DispatchClick() {
    this.setState({ Status: "Dispatched" }, () => {
      this.handleSubmitClick();
    });
  }

  handleSubmitClick() {
    Keyboard.dismiss();
    if (!this.validate()) {
      return;
    }
    this.setState({ loading: true });

    var items = this.state.ItemsList;

    var selectedList = [];
    items.map((ele, i) => {
      var model = "";
      if (ele["Id"] !== null) {
        model = ele["Item"];
      } else {
        model = ele["Item"];
      }
      var item = {
        ModelId: model,
        Quantity: ele["Quantity"]
      };
      selectedList.push(item);
    });

    var data = new FormData();

    data.append("status", this.state.Status);
    data.append("Client", this.state.Client);
    data.append("project", this.state.Project);
    data.append(
      "expectedDate",
      moment(this.state.StockReqDate).format("YYYY-MM-DD")
    );
    data.append("items", JSON.stringify(selectedList));
    data.append("notes", this.refs.description._lastNativeText);
    data.append("taskId", this.state.StockRequestDetails["TaskId"]);

    var url = ApiUrl + "/api/Stock/EditStockRequest?StockId=" + this.props.navigation.state.params.item.Id;

    MyFetch(url, "POST", data)
      .then(data => {
        Toast.show({
          text: "Stock request " + this.state.Status + " successfully",
          buttonText: "Okay",
          duration: 10000,
          type: "success"
        });
        this.props.navigation.navigate("StockRequests");
      }).catch(error => {
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

const styles = StyleSheet.create({
  element: {
    padding: 5,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1
  },
  lightText: {
    color: "#737373"
  },
  buttonStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 4
  },
  label: {
    marginLeft: 5,
    marginBottom: 3,
    color: "#666",
    fontSize: 18
  },
  datePickerBox: {
    marginTop: 9,
    borderColor: "#ABABAB",
    borderWidth: 0.5,
    padding: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 38,
    justifyContent: "center"
  },
  datePickerText: {
    fontSize: 14,
    marginLeft: 5,
    borderWidth: 0,
    color: "#121212"
  },
  multiLineTextInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    width: "100%",
    minHeight: 100,
    borderRadius: 5,
    paddingTop: 1,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5
  },
  buttonSubmit: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 1
  },
  approved: {
    fontSize: 16,
    color: "green"
  },
  dispatch: {
    fontSize: 16,
    color: "blue"
  },
  review: {
    fontSize: 16,
    color: "red"
  }
});

export default StockRequestDetail;



   // MyFetch(url, "GET", null).then((data) => {
    //   this.setState({ StockRequestDetails: data["stockRequest"], RequestedItems: data["stockRequestItems"]
    //     },() => {
    //       var reqItems = data["stockRequestItems"];
    //       var items = [];
    //       reqItems.map((ele, i) => {
    //         var item = {
    //           // Item: { value: ele["ModelId"], label: ele["ItemName"] },
    //           Item: ele["ModelId"],
    //           Description: ele["Description"],
    //           Quantity: ele["Quantity"].toString(),
    //           Id: ele["StockReqMappingId"],
    //           NoOfItemsAvailable: ele["NoOfItemsAvailable"].toString()
    //         };
    //         items.push(item);
    //       });

    //       var Exists = items.findIndex(i => parseInt(i.Quantity) > parseInt(i.NoOfItemsAvailable));
    //       if (Exists !== -1) {
    //         this.setState({ StockAvailability: false });
    //       }
    //       var status = data["stockRequest"]["Status"];
    //       if (status == "Approved" || status == "Declined" || status == "Dispatched") 
    //       {
    //         this.setState({ AllowUserForStockEdit: false });
    //       }

    //       this.refs.description._lastNativeText = data["stockRequest"]["Notes"];

    //       this.setState({
    //           ItemsList: items,
    //           // Client: { value: data["stockRequest"]["Client"], label: data["stockRequest"]["ShortName"] },
    //           Client: data["stockRequest"]["Client"],
    //           // Project: { value: data["stockRequest"]["opportunityId"],label: data["stockRequest"]["ProjectLocation"]  },
    //           Project: data["stockRequest"]["opportunityId"],
    //           StockReqDate: moment(data["stockRequest"]["ExpectedStockDate"]).format("YYYY-MM-DD"),
    //           StockReqDateText: moment(data["stockRequest"]["ExpectedStockDate"] ).format("DD-MMM-YYYY")
    //         },() => {
    //           if(data["stockRequest"]["Client"] !==null) {
    //             MyFetch( ApiUrl + "/api/Client/GetClientProjects?clientId=" + data["stockRequest"]["Client"],
    //             "GET",  null ).then(projects => {
    //               this.setState({ Projects: projects["clientProjects"] });
    //             }).catch((error) => {
    //               Toast.show({
    //                   text: error,
    //                   buttonText: 'Okay',
    //                   position: "bottom",
    //                   duration: 10000,
    //                   type: "danger"
    //               })
    //            });
    //           }
    //         });
    //     }).catch((error) => {
    //     Toast.show({
    //         text: error,
    //         buttonText: 'Okay',
    //         position: "bottom",
    //         duration: 10000,
    //         type: "danger"
    //     })
    //  });
    // });