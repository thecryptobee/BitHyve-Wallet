import React from 'react'
import { ListItem } from 'react-native-elements'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import TransactionsFlatListItemContent from '../transactions/TransactionsFlatListItemContent'

export type Props = {
  transaction: TransactionDescribing;
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ( { transaction, }: Props ) => {
  return (
    <ListItem bottomDivider pad={4}>
      <TransactionsFlatListItemContent transaction={transaction} />
      <ListItem.Chevron />
    </ListItem>
  )
}

export default AccountDetailsTransactionsListItem
