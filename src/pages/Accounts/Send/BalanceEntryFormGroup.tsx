import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Input } from 'react-native-elements'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../../components/MaterialCurrencyCodeIcon'
import useCurrencyCode from '../../../utils/hooks/state-selectors/UseCurrencyCode'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { getCurrencyImageByRegion } from '../../../common/CommonFunctions'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import CurrencyKindToggleSwitch from '../../../components/CurrencyKindToggleSwitch'
import useExchangeRates from '../../../utils/hooks/state-selectors/UseExchangeRates'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'

export type Props = {
  subAccountKind: SubAccountKind;
  onAmountChanged: ( amount: Satoshis ) => void;
};


function useBTCAmountConvertedFromFiat( amount: number ) {
  const exchangeRates = useExchangeRates()
  const currencyCode = useCurrencyCode()

  return useMemo( () => {
    return exchangeRates && exchangeRates[ currencyCode ]
      ? (
        ( amount / SATOSHIS_IN_BTC ) *
        exchangeRates[ currencyCode ].last
      )
      : 0
  }, [ exchangeRates, currencyCode, amount ] )
}

function useFiatAmountConvertedFromSatoshis( amount: Satoshis ) {
  const exchangeRates = useExchangeRates()
  const currencyCode = useCurrencyCode()

  return useMemo( () => {
    const convertedAmount = exchangeRates && exchangeRates[ currencyCode ]
      ? amount / exchangeRates[ currencyCode ].last
      : 0

    return convertedAmount < 1 ? convertedAmount * SATOSHIS_IN_BTC : convertedAmount
  }, [ exchangeRates, currencyCode, amount ] )
}


const BalanceEntryFormGroup: React.FC<Props> = ( {
  subAccountKind,
  onAmountChanged,
}: Props ) => {
  const currencyCode = useCurrencyCode()
  const currencyKind = useCurrencyKind()

  const [ isSendingMax, setIsSendingMax ] = useState( false )
  const [ isAmountInvalid, setIsAmountInvalid ] = useState( false )
  const [ currentBTCAmountTextValue, setCurrentBTCAmountTextValue ] = useState( '' )
  const [ currentFiatAmountTextValue, setCurrentFiatAmountTextValue ] = useState( '' )

  const currentBTCAmountFormValue = useMemo( () => {
    return Number( currentBTCAmountTextValue )
  }, [ currentBTCAmountTextValue ] )

  const currentFiatAmountFormValue = useMemo( () => {
    return Number( currentFiatAmountTextValue )
  }, [ currentFiatAmountTextValue ] )

  // const currentAmount = useMemo( () => {
  //   return Number( currentBTCAmountText ) / SATOSHIS_IN_BTC
  // }, [ currentBTCAmountTextValue ] )

  const exchangeRates = useExchangeRates()
  const [ currencyKindForEntry, setCurrencyKindForEntry ] = useState( currencyKind )
  const currentBTCAmount = useBTCAmountConvertedFromFiat( currentFiatAmountFormValue )
  const currentFiatAmount = useFiatAmountConvertedFromSatoshis( currentBTCAmountFormValue )


  const FiatAmountInputLeftIcon: React.FC = () => {
    return (
      <View style={styles.amountInputImage}>
        {materialIconCurrencyCodes.includes( currencyCode ) ? (
          <View style={styles.currencyImageView}>
            <MaterialCurrencyCodeIcon
              currencyCode={currencyCode}
              color={Colors.currencyGray}
              size={widthPercentageToDP( 6 )}
            />
          </View>
        ) : (
          <Image
            style={{
              ...styles.textBoxImage,
            }}
            source={getCurrencyImageByRegion(
              currencyCode,
              'gray',
            )}
          />
        )}
      </View>
    )
  }

  return (
    <View style={styles.rootContainer}>

      {/* Text-input column */}
      <View>

        {/* Fiat Amount */}
        <TouchableOpacity
          style={{
            ...styles.textInputFieldWrapper,
            backgroundColor: currencyKindForEntry == CurrencyKind.FIAT
              ? Colors.white
              : Colors.backgroundColor,
          }}
        >
          <FiatAmountInputLeftIcon />

          <View style={styles.textInputImageDivider} />

          <Input
            containerStyle={styles.textInputContainer}
            inputContainerStyle={{
              height: '100%',
              padding: 0,
              borderBottomColor: 'transparent',
            }}
            inputStyle={styles.textInputContent}
            editable={currencyKindForEntry == CurrencyKind.FIAT}
            placeholder={currencyKindForEntry == CurrencyKind.BITCOIN
              ? 'Converted amount in ' + currencyCode
              : 'Enter amount in ' + currencyCode
            }
            placeholderTextColor={FormStyles.placeholderText.color}
            value={currentFiatAmountTextValue}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={( value ) => {
              setIsSendingMax( false )
              setCurrentFiatAmountTextValue( value )
              onAmountChanged( currentBTCAmount )
            }}
            onFocus={() => {
              // this.setState({
              //   InputStyle1: styles.inputBoxFocused
              // })
            }}
            onBlur={() => {
              // this.setState({
              //   InputStyle1: styles.textBoxView
              // })
            }}
            onKeyPress={( event ) => {
              if ( event.nativeEvent.key === 'Backspace' ) {
                setIsAmountInvalid( false )
              }
            }}
            autoCorrect={false}
            autoCompleteType="off"
          />

          {currencyKindForEntry == CurrencyKind.FIAT && (
            <Text
              style={{
                color: Colors.blue,
                textAlign: 'center',
                paddingHorizontal: 10,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansItalic,
              }}
            >
              Send Max
            </Text>
          )}
        </TouchableOpacity>


        {/* BTC Amount */}
        <TouchableOpacity
          style={{
            ...styles.textInputFieldWrapper,
            backgroundColor: currencyKindForEntry == CurrencyKind.BITCOIN
              ? Colors.white
              : Colors.backgroundColor,
          }}
        >
          <View style={styles.amountInputImage}>
            <Image
              style={styles.textBoxImage}
              source={require( '../../../assets/images/icons/icon_bitcoin_gray.png' )}
            />
          </View>

          <View style={styles.textInputImageDivider} />

          <Input
            containerStyle={styles.textInputContainer}
            inputContainerStyle={{
              height: '100%',
              padding: 0,
              borderBottomColor: 'transparent',
            }}
            inputStyle={styles.textInputContent}
            editable={currencyKindForEntry == CurrencyKind.BITCOIN}
            placeholder={
              currencyKindForEntry == CurrencyKind.BITCOIN
                ? subAccountKind == SubAccountKind.TEST_ACCOUNT
                  ? 'Enter amount in t-sats'
                  : 'Enter amount in sats'
                : subAccountKind == SubAccountKind.TEST_ACCOUNT
                  ? 'Converted amount in t-sats'
                  : 'Converted amount in sats'
            }
            placeholderTextColor={FormStyles.placeholderText.color}
            value={currentBTCAmountTextValue}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={( value ) => {
              setIsSendingMax( false )
              setCurrentBTCAmountTextValue( value )
              onAmountChanged( currentBTCAmount )
            }}
            onFocus={() => {
              // this.setState({
              //   InputStyle1: styles.inputBoxFocused
              // })
            }}
            onBlur={() => {
              // this.setState({
              //   InputStyle1: styles.textBoxView
              // })
            }}
            onKeyPress={( event ) => {
              if ( event.nativeEvent.key === 'Backspace' ) {
                setIsAmountInvalid( false )
              }
            }}
            autoCorrect={false}
            autoCompleteType="off"
          />

          {currencyKindForEntry == CurrencyKind.BITCOIN && (
            <Text
              style={{
                color: Colors.blue,
                textAlign: 'center',
                paddingHorizontal: 10,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansItalic,
              }}
            >
              Send Max
            </Text>
          )}
        </TouchableOpacity>


        {isAmountInvalid && (
          <View style={{
            marginLeft: 'auto'
          }}>
            <Text style={FormStyles.errorText}>Insufficient balance</Text>
          </View>
        )}

        {/*
        {this.getIsMinimumAllowedStatus() ? (
          <View style={{
            marginLeft: 'auto'
          }}>
            <Text style={styles.errorText}>
            Enter more than 550 sats (min allowed)
            </Text>
          </View>
        ) : null} */}
      </View>

      <View style={styles.toggleSwitchView}>
        <CurrencyKindToggleSwitch
          fiatCurrencyCode={currencyCode}
          onpress={() => setCurrencyKindForEntry(
            currencyKindForEntry == CurrencyKind.BITCOIN ?
              CurrencyKind.FIAT
              : CurrencyKind.BITCOIN
          )}
          isOn={currencyKindForEntry == CurrencyKind.BITCOIN}
          isVertical={true}
          disabled={exchangeRates ? false : true}
        />
      </View>
    </View >
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },

  textInputFieldWrapper: {
    ...FormStyles.textInputContainer,
    marginBottom: widthPercentageToDP( '1.5%' ),
    width: widthPercentageToDP( '70%' ),
    height: widthPercentageToDP( '13%' ),
    alignItems: 'center',
  },

  textInputContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },

  textInputContent: {
    height: '100%',
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },

  textBoxImage: {
    width: widthPercentageToDP( 6 ),
    height: widthPercentageToDP( 6 ),
    resizeMode: 'contain',
  },

  amountInputImage: {
    width: 40,
    height: widthPercentageToDP( 13 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  currencyImageView: {
    width: widthPercentageToDP( 6 ),
    height: widthPercentageToDP( 6 ),
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInputImageDivider: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },

  toggleSwitchView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
  },
} )

export default BalanceEntryFormGroup
