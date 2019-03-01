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

class StockRequestView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            IsDataAvailable: false, StockRequest: null, StockRequestId: null
        };
    }

    componentWillMount() {
        var stockRequestId = this.props.navigation.state.params.item.Id;

        MyFetch(ApiUrl + "/api/Stock/GetStockRequest?stockReqId=" + stockRequestId, "GET", null)
            .then((data) => {
                this.setState({ StockRequest: stockRequestData, StockRequestId: stockRequestId })
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
                        <Button
                            transparent
                            onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Request - {this.state.StockRequestId}</Title>
                    </Body>
                    <Right />
                </Header>
                <ScrollView>
                    
                </ScrollView>
            </Container>
        );
    }
}

export default StockRequestView;
