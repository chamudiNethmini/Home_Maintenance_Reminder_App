import { Text, View } from 'react-native';
import { Badge, Button, Card, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useProviderMutation } from '../../utils/useProviderData';
import { formatDate } from '../../utils/providerWorkflow';
import type { ProviderTabProps } from '../../navigation/providerTypes';
export default function ProviderNotificationsScreen({ navigation }: ProviderTabProps<'Notifications'>) {
  const { state, markRead, notificationsLoading, notificationsError, refreshNotifications } = useProviderModule();
  const mutation = useProviderMutation(), unread = state.notifications.filter(item => !item.isRead).length;
  return <Page title="Notifications" subtitle={notificationsLoading ? 'Loading request updates…' : notificationsError ? 'Request updates unavailable' : unread + ' unread · Updates from your warranty requests'}>
    <View style={ui.between}><Text style={ui.caption}>REQUEST ACTIVITY</Text><View style={ui.row}><Button title="Refresh" kind="secondary" disabled={notificationsLoading || mutation.pending} onPress={() => { void refreshNotifications(); }} /><Button title="Mark all as read" kind="secondary" disabled={!unread || mutation.pending || notificationsLoading || !!notificationsError} onPress={() => { void mutation.run(() => markRead(), 'All notifications marked as read in Firestore.'); }} /></View></View>
    <MutationState {...mutation} />
    {notificationsLoading && <LoadingState />}
    {!!notificationsError && <ErrorState error={notificationsError} retry={refreshNotifications} />}
    {!notificationsLoading && !notificationsError && !state.notifications.length && <Notice text="You’re all caught up. Request updates will appear here." />}
    {!notificationsLoading && !notificationsError && state.notifications.map(item => <Card key={item.id}>
      <View style={ui.between}><Icon name={item.isRead ? 'notifications-outline' : 'notifications'} /><Badge status={item.isRead ? 'Read' : 'Unread'} /></View>
      <Text style={ui.sectionTitle}>{item.title}</Text><Text style={ui.caption}>{item.warrantyRequestId} · {item.customerName || 'Customer'}</Text><Text style={ui.body}>{item.message}</Text>
      <Text style={ui.subtitle}>{formatDate(item.createdAt)}{item.createdAt ? ' · ' + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      <View style={ui.row}>{!item.isRead && <Button title="Mark as read" kind="secondary" disabled={mutation.pending} onPress={() => { void mutation.run(() => markRead(item.id), 'Notification marked as read in Firestore.'); }} />}<Button title="View request" kind="secondary" disabled={!item.warrantyRequestId || mutation.pending} onPress={() => navigation.navigate('CustomerApplianceInfo', { warrantyRequestId: item.warrantyRequestId })} /></View>
    </Card>)}
  </Page>;
}
