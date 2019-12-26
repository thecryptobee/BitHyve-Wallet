import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { downloadMShare } from "../../store/actions/sss";
import { useDispatch, useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CommonStyle from "../../common/Styles";

export default function CustodianRequestOTP(props) {
  const custodyRequest = props.navigation.getParam("custodyRequest");
  const { requester, ek } = custodyRequest;
  const [passcode, setPasscode] = useState("");
  const inputRef = useRef(null);
  const [
    CustodianRequestRejectedBottomSheet,
    setCustodianRequestRejectedBottomSheet
  ] = useState(React.createRef());
  const [
    CustodianRequestAcceptBottomSheet,
    setCustodianRequestAcceptBottomSheet
  ] = useState(React.createRef());

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    if (passcode.length < 6) {
      tmpPasscode += text;
      setPasscode(tmpPasscode);
    }
  }

  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.sss);

  const onOTPSubmit = () => {
    if (passcode.length !== 6 || !ek) return;
    dispatch(downloadMShare(passcode, ek));
  };

  const { UNDER_CUSTODY } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );

  useEffect(() => {
    if (UNDER_CUSTODY[requester]) {
      passcode.length === 6
        ? props.navigation.navigate("CustodianRequestAccepted", { requester })
        : Alert.alert(
            "Failed to store",
            "You cannot custody multiple shares of the same user."
          );
    }
  }, [UNDER_CUSTODY]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyle.headerContainer}>
        <TouchableOpacity
          style={CommonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={CommonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
    <View style={styles.modalContentContainer}>
      <View
        style={{
          marginRight: wp("8%"),
          marginLeft: wp("8%")
        }}
      >
        <View style={{ ...styles.otpRequestHeaderView }}>
          <Text style={styles.modalTitleText}>
            Enter OTP to{"\n"}accept request
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: hp("1.5%") }}>
            Please enter the 6 digit OTP the owner{"\n"}of secret shared with
            you
          </Text>
        </View>
        <View style={{ marginBottom: hp("2%") }}>
          <View style={styles.passcodeTextInputView}>
            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput = input;
              }}
              style={[
                this.textInput && this.textInput.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) 
                {
                  setTimeout(() => {
                    this.textInput2.focus();
                  },10);
                }
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput.focus();
                }
              }}
            />

            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput2 = input;
              }}
              style={[
                this.textInput2 && this.textInput2.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) 
                {
                  setTimeout(() => {
                    this.textInput3.focus();
                  }, 10);
                }
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput.focus();
                }
              }}
            />

            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput3 = input;
              }}
              style={[
                this.textInput3 && this.textInput3.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) 
                {
                  setTimeout(() => {
                  this.textInput4.focus();
                }, 10);
                }
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput2.focus();
                }
              }}
            />

            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput4 = input;
              }}
              style={[
                this.textInput4 && this.textInput4.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) 
                {
                  setTimeout(() => {
                    this.textInput5.focus();
                  }, 10);
                }
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput3.focus();
                }
              }}
            />

            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput5 = input;
              }}
              style={[
                this.textInput5 && this.textInput5.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
                if (value) 
                {
                  setTimeout(() => {
                    this.textInput6.focus();
                  }, 10);
                }
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput4.focus();
                }
              }}
            />
            <TextInput
              maxLength={1}
              autoCorrect={false}
              autoFocus={false}
              keyboardType="email-address"
              ref={input => {
                this.textInput6 = input;
              }}
              style={[
                this.textInput6 && this.textInput6.isFocused()
                  ? styles.textBoxActive
                  : styles.textBoxStyles
              ]}
              onChangeText={value => {
                onPressNumber(value);
              }}
              onKeyPress={e => {
                if (e.nativeEvent.key === "Backspace") {
                  this.textInput5.focus();
                }
              }}
            />
          </View>
        </View>
        <View
          style={{
            marginBottom: hp("8%"),
            marginLeft: wp("2%"),
            marginRight: wp("2%")
          }}
        >
          <Text style={{ ...styles.modalInfoText }}>
            The OTP is time sensitive, please be sure to enter the OTP {"\n"}
            shared within 10 minutes
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: "auto" }}>
          <TouchableOpacity
            onPress={onOTPSubmit}
            style={{ ...styles.confirmModalButtonView }}
          >
            {loading.downloadMetaShare ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: "bold",
    fontSize: RFValue(13, 812)
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  otpRequestHeaderView: {
    marginTop: hp("2%"),
    marginBottom: hp("2%")
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  confirmModalButtonView: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue,
    alignSelf: "center"
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  passcodeTextInputView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp("2.5%"),
    marginBottom: hp("2.5%")
  }
});
