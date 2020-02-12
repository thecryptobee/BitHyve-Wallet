import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import CommonStyles from '../../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../../components/ContactList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import { UsNumberFormat } from '../../common/utilities';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import AsyncStorage from '@react-native-community/async-storage';

export default function TransactionDetails(props) {
  const txDetails = props.navigation.getParam('item');
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType')
    ? props.navigation.getParam('serviceType')
    : null;
  const [TransactionDetailsBottomSheet, setTransactionDetailsBottomSheet] = useState(
      React.createRef(),
    );
    const [isHelperDone, setIsHelperDone] = useState(true);

    const checkNShowHelperModal = async () => {
      let isSendHelperDone = await AsyncStorage.getItem('isTransactionHelperDone');
      if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
        await AsyncStorage.setItem('isTransactionHelperDone', 'true');
        setTimeout(() => {
          setIsHelperDone(true);
        }, 10);
  
        setTimeout(() => {
          TransactionDetailsBottomSheet.current.snapTo(2);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsHelperDone(false);
        }, 10);
      }
    };

    useEffect(() => {
      console.log("txDetails", txDetails);
  
      checkNShowHelperModal();
    }, []);

    const renderHelperContents = () => {
      return (
        <TestAccountHelperModalContents
          topButtonText={`Transaction Details`}
          helperInfo={`This is where you can see the details of your transaction\n\nThe number of confirmations tells you the surety of your transaction. Generally 3-6 confirmations is considered secure depending on the amount sent`}
          continueButtonText={'Ok, got it'}
          onPressContinue={() => {
            (TransactionDetailsBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    };
    const renderHelperHeader = () => {
      return (
        <SmallHeaderModal
          borderColor={Colors.blue}
          backgroundColor={Colors.blue}
          onPressHeader={() => {
            console.log('isHelperDone', isHelperDone);
            if (isHelperDone) {
              (TransactionDetailsBottomSheet as any).current.snapTo(2);
              setTimeout(() => {
                setIsHelperDone(false);
              }, 10);
            } else {
              (TransactionDetailsBottomSheet as any).current.snapTo(0);
            }
          }}
        />
      );
    };

  return (
    <TouchableWithoutFeedback onPress={() => {TransactionDetailsBottomSheet.current.snapTo(0)}}>
    <View style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex:1, flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                if (getServiceType && serviceType) {
                  getServiceType(serviceType);
                }
                props.navigation.goBack();
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitleText}>
              {'Transaction Details'}
            </Text>
            {serviceType == TEST_ACCOUNT ? (
                  <Text
                    onPress={() => {
                      AsyncStorage.setItem('isTransactionHelperDone', 'true');
                      TransactionDetailsBottomSheet.current.snapTo(2);
                    }}
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      marginLeft: 'auto',
                    }}
                  >
                    Know more
                  </Text>
                ) : null}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginLeft: hp('2%'),
            marginRight: hp('2%'),
            alignItems: 'center',
            paddingTop: hp('2%'),
            paddingBottom: hp('2%'),
          }}
        >
          <View>
            <Image
              source={require('../../assets/images/icons/icon_regular.png')}
              style={{ width: wp('12%'), height: wp('12%') }}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
            }}
          >
            <View>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(14),
                }}
              >
                {txDetails.accountType}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('1%'),
                }}
              >
                {moment(txDetails.date)
                  .utc()
                  .format('DD MMMM YYYY')}
                {/* <Entypo
                size={10}
                name={"dot-single"}
                color={Colors.textColorGrey}
              />{" "}
              11:00am */}
              </Text>
            </View>
            <FontAwesome
              style={{ marginLeft: 'auto' }}
              name="long-arrow-down"
              color={Colors.green}
              size={17}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Amount
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: hp('0.5%'),
              }}
            >
              <Image
                source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                style={{
                  width: wp('3%'),
                  height: wp('3%'),
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginLeft: 3,
                }}
              >
                {UsNumberFormat(txDetails.amount)}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginLeft: 3,
                }}
              >
                {txDetails.accountType == 'Test Account' ? ' t-sats' : ' sats'}
              </Text>
            </View>
          </View>
          {txDetails.recipientAddresses ? (
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                To Address
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {txDetails.recipientAddresses[0]}
              </Text>
            </View>
          ) : null}
          {txDetails.senderAddresses ? (
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                From Address
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {txDetails.senderAddresses[0]}
              </Text>
            </View>
          ) : null}
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Fees
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: hp('0.5%'),
              }}
            >
              {UsNumberFormat(txDetails.fee)}
            </Text>
          </View>
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Transaction ID
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: hp('0.5%'),
              }}
            >
              {txDetails.txid}
            </Text>
          </View>
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Confirmations
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: hp('0.5%'),
              }}
            >
              {txDetails.confirmations < 6 ? txDetails.confirmations : '6+'}
            </Text>
          </View>
        </View>
        
      </View>
      <BottomSheet
          enabledInnerScrolling={true}
          ref={TransactionDetailsBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
          ]}
          renderContent={renderHelperContents}
          renderHeader={renderHelperHeader}
        />   
    </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    width: '100%',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  infoCardView: {
    backgroundColor: Colors.white,
    marginLeft: hp('2%'),
    marginRight: hp('2%'),
    height: hp('8%'),
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: hp('2%'),
    paddingRight: hp('2%'),
    marginBottom: hp('0.5%'),
    marginTop: hp('0.5%'),
  },
});
