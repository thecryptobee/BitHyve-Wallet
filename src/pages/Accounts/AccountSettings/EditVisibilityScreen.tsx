import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import { useDispatch } from 'react-redux'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import ListStyles from '../../../common/Styles/ListStyles'

import VisibilityOptionsList from '../../../components/account-settings/visibility/VisibilityOptionsList'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import { updateSubAccountSettings } from '../../../store/actions/accounts'
import ButtonBlue from '../../../components/ButtonBlue'

const SELECTABLE_VISIBILITY_OPTIONS = [
  AccountVisibility.DEFAULT,
  AccountVisibility.HIDDEN,
  AccountVisibility.DURESS,
]

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = () => {
  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>Choose a visibility setting</Text>
    </View>
  )
}

const AccountSettingsEditVisibilityScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const accountShell = useAccountShellFromNavigation( navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  const [ selectedVisibility, setSelectedVisibility ] = useState( primarySubAccount.visibility )

  function handleSelection( visibilityOption: AccountVisibility ) {
    setSelectedVisibility( visibilityOption )
  }

  function handleSaveButtonPress() {
    dispatch( updateSubAccountSettings( {
      ...primarySubAccount,
      visibility: selectedVisibility,
    } ) )

    navigation.goBack()
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection />

      <View>
        <VisibilityOptionsList
          selectableOptions={SELECTABLE_VISIBILITY_OPTIONS}
          selectedOption={selectedVisibility}
          onOptionSelected={handleSelection}
        />
      </View>

      <View style={styles.proceedButtonContainer}>
        <ButtonBlue
          buttonText="Confirm"
          handleButtonPress={handleSaveButtonPress}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
} )

export default AccountSettingsEditVisibilityScreen
