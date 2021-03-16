import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  Alert,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorSending, uploadSMShareKeeper } from '../../store/actions/health';
import { checkMSharesHealth, updatedKeeperInfo, updateMSharesHealth, secondaryShareDownloaded } from '../../store/actions/health';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import HistoryPageComponent from './HistoryPageComponent';
import SecondaryDevice from './SecondaryDeviceNewBHR';
import moment from 'moment';
import _ from 'underscore';
import ErrorModalContents from '../../components/ErrorModalContents';
import DeviceInfo from 'react-native-device-info';
import KnowMoreButton from '../../components/KnowMoreButton';
import { uploadEncMShareKeeper } from '../../store/actions/health';
import {
  EphemeralDataElements,
  LevelHealthInterface,
  TrustedContactDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import {
  updateEphemeralChannel,
  updateTrustedContactsInfoLocally,
} from '../../store/actions/trustedContacts'
import config from '../../bitcoin/HexaConfig'
import QRModal from '../Accounts/QRModal'
import S3Service from '../../bitcoin/services/sss/S3Service'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import KeeperDeviceHelpContents from '../../components/Helper/KeeperDeviceHelpContents';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import HistoryHeaderComponent from './HistoryHeaderComponent';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import ApproveSetup from './ApproveSetup';

const SecondaryDeviceHistoryNewBHR = (props) => {
  const [ErrorBottomSheet] = useState(React.createRef());
  const [HelpBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector((state) => state.health.errorSending);
  const [QrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [blockReshare, setBlockReshare] = useState('');
  const [selectedKeeperType, setSelectedKeeperType] = useState('');
  const [selectedKeeperName, setSelectedKeeperName] = useState('');
  const [keeperTypeBottomSheet, setkeeperTypeBottomSheet] = useState(React.createRef());
  const [ApprovePrimaryKeeperBottomSheet, setApprovePrimaryKeeperBottomSheet] = useState(React.createRef());
  const keeperInfo = useSelector((state) => state.health.keeperInfo);
  const pdfInfo = useSelector((state) => state.health.pdfInfo);
  const [index, setIndex] = useState(props.navigation.state.params.index);

  const SHARES_TRANSFER_DETAILS = useSelector(
    ( state ) =>
      state.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  )
  const fcmTokenValue = useSelector( ( state ) => state.preferences.fcmTokenValue )

  const WALLET_SETUP = useSelector(
    ( state ) => state.storage.database.WALLET_SETUP,
  )

  const trustedContactsInfo = useSelector(
    ( state ) => state.trustedContacts.trustedContactsInfo,
  )

  const dispatch = useDispatch()
  const [ secondaryQR, setSecondaryQR ] = useState( '' )
  const s3Service: S3Service = useSelector( ( state ) => state.health.service )
  const secureAccount: SecureAccount = useSelector(
    ( state ) => state.accounts[ SECURE_ACCOUNT ].service,
  )

  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )
  const regularAccount: RegularAccount = useSelector(
    ( state ) => state.accounts[ REGULAR_ACCOUNT ].service,
  )
  const testAccount: TestAccount = useSelector(
    ( state ) => state.accounts[ TEST_ACCOUNT ].service,
  )
  const [ ReshareBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ChangeBottomSheet ] = useState( React.createRef() )
  const [ guardianExists, setGuardianExists ] = useState( false )

  const [ secondaryDeviceHistory, setSecondaryDeviceHistory ] = useState( [
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    // {
    //   id: 5,
    //   title: 'Recovery Secret In-Transit',
    //   date: '20 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
    // {
    //   id: 6,
    //   title: 'Recovery Secret Not Accessible',
    //   date: '19 May ‘19, 11:00am',
    //   info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    // },
  ]);
  const levelHealth:LevelHealthInterface[] = useSelector((state) => state.health.levelHealth);
  const currentLevel = useSelector((state) => state.health.currentLevel);
  
  const [selectedTime, setSelectedTime] = useState(
    props.navigation.getParam('selectedTime'),
  );
  const [selectedStatus, setSelectedStatus] = useState(
    props.navigation.getParam('selectedStatus'),
  );
  const [selectedTitle, setSelectedTitle] = useState(
    props.navigation.getParam('selectedTitle'),
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    props.navigation.state.params.selectedLevelId,
  )
  const [ selectedKeeper, setSelectedKeeper ] = useState(
    props.navigation.state.params.selectedKeeper,
  )
  console.log( 'props.navigation.getParam(\'selectedTime\'', props.navigation.state.params.selectedKeeper )
  console.log( 'RESHARE', props.navigation.state.params.selectedKeeper.updatedAt == 0
    ? false
    : true )
  const [ isReshare, setIsReshare ] = useState( props.navigation.state.params.selectedKeeper.updatedAt == 0
    ? false
    : true )
  const [ selectedShareId, setSelectedShareId ] = useState( props.navigation.state.params.selectedKeeper.shareId ? props.navigation.state.params.selectedKeeper.shareId : '' )
  const [ isChange, setIsChange ] = useState( false )
  useEffect( () => {
    setSelectedLevelId( props.navigation.state.params.selectedLevelId )
    setSelectedKeeper( props.navigation.state.params.selectedKeeper )
    setIsReshare(
      props.navigation.state.params.selectedKeeper.updatedAt == 0
        ? false
        : true
    )
    setIndex( props.navigation.state.params.index )
    setSelectedTime( props.navigation.state.params.selectedTime )
    setSelectedStatus( props.navigation.state.params.selectedStatus )
    setSelectedTitle( props.navigation.state.params.selectedTitle )
    const shareId = !props.navigation.state.params.selectedKeeper.shareId && selectedLevelId == 3 ? levelHealth[ 2 ].levelInfo[ 4 ].shareId : props.navigation.state.params.selectedKeeper.shareId ? props.navigation.state.params.selectedKeeper.shareId : ''
    setSelectedShareId( shareId )
    setIsChange(
      props.navigation.state.params.isChangeKeeperType
        ? props.navigation.state.params.isChangeKeeperType
        : false
    )
  }, [
    props.navigation.state.params.selectedLevelId,
    props.navigation.state.params.selectedKeeper,
    props.navigation.state.params.selectedStatus,
  ] )
  const [ secondaryDeviceBottomSheet ] = useState(
    React.createRef(),
  )
  const [
    secondaryDeviceMessageBottomSheet,
  ] = useState( React.createRef() )
  const uploadMetaShare = useSelector(
    ( state ) => state.health.loading.uploadMetaShare,
  )
  const updateEphemeralChannelLoader = useSelector(
    ( state ) => state.trustedContacts.loading.updateEphemeralChannel,
  )

  const next = props.navigation.getParam( 'next' )

  const saveInTransitHistory = async () => {
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      updateHistory( updatedShareHistory )
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }

  const updateTrustedContactsInfo = useCallback(
    async ( contact ) => {
      console.log( 'contact_________', contact )
      let tcInfo = trustedContactsInfo ? [ ...trustedContactsInfo ] : null

      if ( tcInfo ) {
        tcInfo[ 0 ] = contact
      } else {
        tcInfo = []
        tcInfo[ 2 ] = undefined // securing initial 3 positions for Guardians
        tcInfo[ 0 ] = contact
      }
      await AsyncStorage.setItem( 'TrustedContactsInfo', JSON.stringify( tcInfo ) )
      dispatch( updateTrustedContactsInfoLocally( tcInfo ) )
      const contactName = contact.firstName + ' ' + contact.lastName
      const shareArray = [
        {
          walletId: s3Service.getWalletId().data.walletId,
          shareId: selectedShareId,
          reshareVersion: 0,
          updatedAt: moment( new Date() ).valueOf(),
          name: contactName,
          shareType: 'device',
          status: 'notAccessible',
        },
      ]
      dispatch( updateMSharesHealth( shareArray ) )
    },
    [ trustedContactsInfo ],
  )

  const createGuardian = useCallback(
    async ( changeKeeper?: boolean ) => {
      const walletID = await AsyncStorage.getItem( 'walletID' )
      const FCM = fcmTokenValue
      //await AsyncStorage.getItem('fcmToken');

      const firstName = 'Secondary'
      const lastName = 'Device'
      const contactName = `${firstName} ${lastName ? lastName : ''}`
        .toLowerCase()
        .trim()

      let accountNumber =
        regularAccount.hdWallet.trustedContactToDA[ contactName ]
      if ( !accountNumber ) {
        // initialize a trusted derivative account against the following account
        const res = regularAccount.setupDerivativeAccount(
          TRUSTED_CONTACTS,
          null,
          contactName,
        )
        if ( res.status !== 200 ) {
          console.log( 'Err occurred while generating derivative account' )
        } else {
          // refresh the account number
          accountNumber =
            regularAccount.hdWallet.trustedContactToDA[ contactName ]
        }
      }

      const trustedReceivingAddress = ( regularAccount.hdWallet
        .derivativeAccounts[ TRUSTED_CONTACTS ][
          accountNumber
        ] as TrustedContactDerivativeAccountElements ).receivingAddress

      const data: EphemeralDataElements = {
        walletID,
        FCM,
        trustedAddress: trustedReceivingAddress,
        trustedTestAddress: testAccount.hdWallet.receivingAddress,
      }
      const trustedContact = trustedContacts.tc.trustedContacts[ contactName ]

      let info = null
      if ( trustedContact && trustedContact.secondaryKey ) {
        info = trustedContact.secondaryKey
      }

      const contactInfo = {
        contactName,
        info,
      }

      const obj = {
        shareId: selectedShareId,
        name: contactName,
        uuid: '',
        publicKey: '',
        ephemeralAddress: '',
        type: 'device',
        data: {
          name: contactName, index
        }
      }
      dispatch( updatedKeeperInfo( obj ) )

      if ( changeKeeper ) {
        setSecondaryQR( '' )
        dispatch( uploadEncMShareKeeper( index, selectedShareId, contactInfo, data, changeKeeper ) )
        updateTrustedContactsInfo( {
          firstName, lastName
        } )
      } else {
        if (
          !SHARES_TRANSFER_DETAILS[ index ] ||
          Date.now() - SHARES_TRANSFER_DETAILS[ index ].UPLOADED_AT >
          config.TC_REQUEST_EXPIRY
        ) {
          console.log( '!SHARES_TRANSFER_DETAILS[index]', SHARES_TRANSFER_DETAILS )
          setSecondaryQR( '' )
          dispatch( uploadEncMShareKeeper( index, selectedShareId, contactInfo, data ) )
          updateTrustedContactsInfo( {
            firstName, lastName
          } )
        } else if (
          trustedContact &&
          !trustedContact.symmetricKey &&
          trustedContact.ephemeralChannel &&
          trustedContact.ephemeralChannel.initiatedAt &&
          Date.now() - trustedContact.ephemeralChannel.initiatedAt >
          config.TC_REQUEST_EXPIRY
        ) {
          setSecondaryQR( '' )
          dispatch(
            updateEphemeralChannel(
              contactInfo,
              trustedContact.ephemeralChannel.data[ index ],
            ),
          )
        }
      }
    },
    [ SHARES_TRANSFER_DETAILS, trustedContacts ],
  )

  useEffect( () => {
    if ( uploadMetaShare || updateEphemeralChannelLoader ) {
      if ( secondaryQR ) setSecondaryQR( '' )
      return
    }

    const firstName = 'Secondary'
    const lastName = 'Device'
    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim()

    if (
      trustedContacts.tc.trustedContacts[ contactName ] &&
      trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
    ) {
      const { publicKey, secondaryKey } = trustedContacts.tc.trustedContacts[
        contactName
      ]

      setSecondaryQR(
        JSON.stringify( {
          isGuardian: true,
          requester: WALLET_SETUP.walletName,
          publicKey,
          info: secondaryKey,
          uploadedAt:
            trustedContacts.tc.trustedContacts[ contactName ].ephemeralChannel
              .initiatedAt,
          type: 'secondaryDeviceGuardian',
          ver: DeviceInfo.getVersion(),
          isFromKeeper: true,
        } ),
      )
    }
  }, [
    SHARES_TRANSFER_DETAILS,
    trustedContacts,
    uploadMetaShare,
    updateEphemeralChannelLoader,
  ] )

  useEffect( () => {
    const firstName = 'Secondary'
    const lastName = 'Device'
    const contactName = `${firstName} ${lastName ? lastName : ''}`
      .toLowerCase()
      .trim()
    const tcInstance = trustedContacts.tc.trustedContacts[ contactName ]
    console.log( {
      tcInstance
    } )
    if ( tcInstance ) {
      if ( tcInstance.symmetricKey ) {
        setGuardianExists( true )
      }
    }
  }, [ trustedContacts ] )

  useEffect( () => {
    ( async () => {
      // blocking keeper reshare till 100% health
      const blockPCShare = await AsyncStorage.getItem( 'blockPCShare' )
      if ( blockPCShare ) {
        setBlockReshare( blockPCShare )
      }
      // else if (!secureAccount.secureHDWallet.secondaryMnemonic) {
      //   AsyncStorage.setItem('blockPCShare', 'true');
      //   setBlockReshare(blockPCShare);
      // }
    } )()
  }, [] )

  const renderSecondaryDeviceContents = useCallback( () => {
    console.log( secondaryQR )
    return (
      <SecondaryDevice
        secondaryQR={secondaryQR}
        onPressOk={async () => {
          saveInTransitHistory();
          // dispatch(checkMSharesHealth());
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
          if ( next ) {
            props.navigation.goBack()
          }
          setTimeout( () => {
            setIsReshare( true )
          }, 2 )
        }}
        onPressBack={() => {
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [ secondaryQR ] )

  const renderSecondaryDeviceHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( secondaryDeviceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )
  const renderSecondaryDeviceMessageContents = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={secondaryDeviceMessageBottomSheet}
        title={'Keeper Device'}
        note={
          'For confirming your Recovery Key on the Keeper Device, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressIgnore={() => {
          if ( secondaryDeviceMessageBottomSheet.current )
            ( secondaryDeviceMessageBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderSecondaryDeviceMessageHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (secondaryDeviceMessageBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  useEffect( () => {
    if ( next ) ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
  }, [ next ] )

  const sortedHistory = ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )

    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )

    return sortedHistory
  }

  const updateHistory = ( shareHistory ) => {
    const updatedSecondaryHistory = [ ...secondaryDeviceHistory ]
    if ( shareHistory[ index ].createdAt )
      updatedSecondaryHistory[ 0 ].date = shareHistory[ index ].createdAt
    if ( shareHistory[ index ].inTransit )
      updatedSecondaryHistory[ 1 ].date = shareHistory[ index ].inTransit

    if ( shareHistory[ index ].accessible )
      updatedSecondaryHistory[ 2 ].date = shareHistory[ index ].accessible

    if ( shareHistory[ index ].notAccessible )
      updatedSecondaryHistory[ 3 ].date = shareHistory[ index ].notAccessible
    setSecondaryDeviceHistory( updatedSecondaryHistory )
  }

  useEffect( () => {
    ( async () => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem( 'shareHistory' ),
      )
      if ( shareHistory[ index ].inTransit || shareHistory[ index ].accessible ) {
        setIsReshare( true )
      }
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
  }, [] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  const renderErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  useEffect( () => {
    if ( isErrorSendingFailed ) {
      setTimeout( () => {
        setErrorMessageHeader( 'Error sending Recovery Key' )
        setErrorMessage(
          'There was an error while sending your Recovery Key, please try again in a little while',
        )
      }, 2 );
      ( ErrorBottomSheet as any ).current.snapTo( 1 )
      dispatch( ErrorSending( null ) )
    }
  }, [ isErrorSendingFailed ] )

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const renderReshareContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare with the same device?'}
        info={
          'Proceed if you want to reshare the link/ QR with the same device'
        }
        note={
          'For a different device, please go back and choose ‘Change device'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 )

          if ( blockReshare ) {
            ( QrBottomSheet.current as any ).snapTo( 1 )
          } else {
            createGuardian();
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
          }
        }}
        onPressIgnore={() => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderReshareHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ReshareBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderChangeContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )

          if ( blockReshare ) {
            ( QrBottomSheet.current as any ).snapTo( 1 )
          } else {
            const changeKeeper = true
            createGuardian( changeKeeper );
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
          }
        }}
        onPressIgnore={() => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderChangeHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ChangeBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderHelpContent = () => {
    return (
      <KeeperDeviceHelpContents
        titleClicked={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  if ( isErrorSendingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error sending Recovery Key' )
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      )
    }, 2 );
    ( ErrorBottomSheet as any ).current.snapTo( 1 )
    dispatch( ErrorSending( null ) )
  }

  const sendApprovalRequestToPK = (type) => {
    setQrBottomSheetsFlag(true);
    (QrBottomSheet as any).snapTo(1);
    (keeperTypeBottomSheet as any).current.snapTo(0);
  };

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={true}
        QRModalHeader={"QR scanner ddfds"}
        title={"Note"}
        infoText={
          "Lorem ipsum dolor sit amet consetetur sadipscing elitr, sed diam nonumy eirmod"
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async(qrData) => {
          try {
            if (qrData) {
              console.log('qrData', qrData)
              const res = await S3Service.downloadSMShare(qrData.publicKey);
              console.log("Keeper Shares", res);
              if (res.status === 200) {
                console.log("SHARES DOWNLOAD", res.data);
                dispatch(secondaryShareDownloaded(res.data.metaShare));
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(1);
                (QrBottomSheet as any).current.snapTo(0);
              }
            }
          } catch (err) {
            console.log({ err });
          }
          setQrBottomSheetsFlag(false);
          (QrBottomSheet as any).current.snapTo(0);
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag(false);
          if (QrBottomSheet) (QrBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={async() => {
          let qrScannedData = '{"requester":"ShivaniH","publicKey":"XCi8FEPHHE8mqVJxRuZQNCrJ","uploadedAt":1615528421395,"type":"ReverseRecoveryQR","ver":"1.4.6"}';
          try {
            if (qrScannedData) {
              let qrData = JSON.parse(qrScannedData);
              console.log('qrData', qrData);
              const res = await S3Service.downloadSMShare(qrData.publicKey);
              console.log("Keeper Shares", res);
              if (res.status === 200) {
                console.log("SHARES DOWNLOAD", res.data);
                dispatch(secondaryShareDownloaded(res.data.metaShare));
                (ApprovePrimaryKeeperBottomSheet as any).snapTo(1);
                (QrBottomSheet as any).current.snapTo(0);
              }
            }
          } catch (err) {
            console.log({ err });
          }
          setQrBottomSheetsFlag(false);
          (QrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }

  const renderQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setQrBottomSheetsFlag(false);
          (QrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }

  const onPressChangeKeeperType = (type, name) => {
    let levelhealth: LevelHealthInterface[] = [];
    if (levelHealth[1] && levelHealth[1].levelInfo.findIndex((v) => v.updatedAt > 0) > -1)
      levelhealth = [levelHealth[1]];
    if (levelHealth[2] && levelHealth[2].levelInfo.findIndex((v) => v.updatedAt > 0) > -1)
      levelhealth = [levelHealth[1], levelHealth[2]];
    if (currentLevel == 3 && levelHealth[2])
      levelhealth = [levelHealth[2]];
    let changeIndex = 1;
    let contactCount = 0;
    let deviceCount = 0;
    for (let i = 0; i < levelhealth.length; i++) {
      const element = levelhealth[i];
      for (let j = 2; j < element.levelInfo.length; j++) {
        const element2 = element.levelInfo[j];
        if (
          element2.shareType == "contact" &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[i] &&
          selectedKeeper.shareType == "contact"
        ) {
          contactCount++;
        }
        if (
          element2.shareType == "device" &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[i] &&
          selectedKeeper.shareType == "device"
        ) {
          deviceCount++;
        }
        let kpInfoContactIndex = keeperInfo.findIndex((value) => value.shareId == element2.shareId && value.type == "contact");
        if (type == 'contact' && element2.shareType == "contact" && contactCount < 2) {
          if (kpInfoContactIndex > -1 && keeperInfo[kpInfoContactIndex].data.index == 1) {
            changeIndex = 2;
          } else changeIndex = 1;
        }
        if(type == 'device'){
          if (element2.shareType == "device" && deviceCount == 1) {
            changeIndex = 3;
          } else if(element2.shareType == "device" && deviceCount == 2){
            changeIndex = 4;
          }
        }
      }
    }
    if (type == "contact") {
      props.navigation.navigate("TrustedContactHistoryKeeper", {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      });
    }
    if (type == "device") {
      (ChangeBottomSheet as any).current.snapTo(1);
    }
    if (type == "pdf") {
      props.navigation.navigate("PersonalCopyHistoryNewBHR", {
        ...props.navigation.state.params,
        selectedTitle: name,
        isChangeKeeperType: true,
      });
    }
  };

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView style={{
        flex: 0, backgroundColor: Colors.backgroundColor
      }}/>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={props.navigation.state.params.selectedTitle}
        selectedTime={props.navigation.state.params.selectedTime}
        selectedStatus={props.navigation.state.params.selectedStatus}
        moreInfo={props.navigation.state.params.selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'secondaryDevice'}
          IsReshare={isReshare}
          data={sortedHistory( secondaryDeviceHistory )}
          confirmButtonText={'Confirm'}
          onPressConfirm={() => {
            // (secondaryDeviceMessageBottomSheet as any).current.snapTo(1);
            createGuardian();
            ( secondaryDeviceBottomSheet as any ).current.snapTo( 1 )
          }}
          reshareButtonText={'Reshare Keeper'}
          onPressReshare={async () => {
            ( ReshareBottomSheet as any ).current.snapTo( 1 )
          }}
          changeButtonText={'Change Keeper'}
          onPressChange={() => {
            (keeperTypeBottomSheet as any).snapTo(1);
            // (ChangeBottomSheet as any).current.snapTo(1);
          }}
        />
      </View>
      <BottomSheet
        onCloseStart={() => {
          (secondaryDeviceBottomSheet as any).current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={secondaryDeviceBottomSheet as any}
        snapPoints={[ -30, hp( '85%' ) ]}
        renderContent={renderSecondaryDeviceContents}
        renderHeader={renderSecondaryDeviceHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          (secondaryDeviceMessageBottomSheet.current as any).current.snapTo(0);
        }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={secondaryDeviceMessageBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderSecondaryDeviceMessageContents}
        renderHeader={renderSecondaryDeviceMessageHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag( true )
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onCloseStart={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '92%' ) : hp( '91%' ),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '87%' ) : hp( '89%' ),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderReshareContent}
        renderHeader={renderReshareHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ]}
        renderContent={renderChangeContent}
        renderHeader={renderChangeHeader}
      />
      <BottomSheet
          enabledInnerScrolling={true}
          ref={keeperTypeBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch()
              ? hp("75%")
              : hp("75%"),
          ]}
          renderContent={() => (
            <KeeperTypeModalContents
              onPressSetup={async (type, name) => {
                  setSelectedKeeperType(type)
                  setSelectedKeeperName(name)
                  sendApprovalRequestToPK(type);
              }}
              onPressBack={() =>
                (keeperTypeBottomSheet as any).current.snapTo(0)
              }
              selectedLevelId={selectedLevelId}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                (keeperTypeBottomSheet as any).current.snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ApprovePrimaryKeeperBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("60%") : hp("70"),
          ]}
          renderContent={() => (
            <ApproveSetup
              isContinueDisabled={false}
              onPressContinue={() => {
                onPressChangeKeeperType(selectedKeeperType, selectedKeeperName);
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() => {
                (keeperTypeBottomSheet as any).current.snapTo(1);
                (ApprovePrimaryKeeperBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
        />
    </View>
  )
}

export default SecondaryDeviceHistoryNewBHR