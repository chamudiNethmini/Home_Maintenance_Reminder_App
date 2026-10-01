import { Text, View } from 'react-native';
import { Badge, Button, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useProviderMutation } from '../../utils/useProviderData';
import { formatDate } from '../../utils/providerWorkflow';
import type { RequestStatus } from '../../types/provider';
import type { ProviderTabProps } from '../../navigation/providerTypes';
const statusColors: Record<RequestStatus, { background: string; border: string; badge: string; text: string }> = {
  Approved: { background: '#F3FAF6', border: '#BEDDCA', badge: '#E0F4EB', text: '#196342' },
  Rejected: { background: '#FFF5F6', border: '#E8BBC3', badge: '#FCEAED', text: '#A52F45' },
  'More Information Required': { background: '#FFFBF2', border: '#E9D6A4', badge: '#FFF2D6', text: '#805C14' },
  Pending: { background: '#F5F8FA', border: '#CEDCE3', badge: '#E8EFF4', text: '#425C6C' },
};

export default function ProviderNotificationsScreen({ navigation }: ProviderTabProps<'Notifications'>) {
  const { state, markRead, notificationsLoading, notificationsError, refreshNotifications } = useProviderModule();
  const mutation = useProviderMutation(), unread = state.notifications.filter(item => !item.isRead).length;
  const requestStatuses = new Map(state.requests.map(({ request }) => [request.id, request.status]));
  return <Page title="Notifications" subtitle={notificationsLoading ? 'Loading request updates…' : notificationsError ? 'Request updates unavailable' : unread + ' unread · Updates from your warranty requests'}>
    <View style={ui.between}><Text style={ui.caption}>REQUEST ACTIVITY</Text><View style={ui.row}><Button title="Refresh" kind="secondary" disabled={notificationsLoading || mutation.pending} onPress={() => { void refreshNotifications(); }} /><Button title="Mark all as read" kind="secondary" disabled={!unread || mutation.pending || notificationsLoading || !!notificationsError} onPress={() => { void mutation.run(() => markRead(), 'All notifications marked as read in Firestore.'); }} /></View></View>
    <MutationState {...mutation} />
    {notificationsLoading && <LoadingState />}
    {!!notificationsError && <ErrorState error={notificationsError} retry={refreshNotifications} />}
    {!notificationsLoading && !notificationsError && !state.notifications.length && <Notice text="You’re all caught up. Request updates will appear here." />}
    {!notificationsLoading && !notificationsError && state.notifications.map(item => {
      const status = requestStatuses.get(item.warrantyRequestId);
      // Missing request data must not be presented as a Pending decision.
      const palette = statusColors[status ?? 'Pending'];
      return <View key={item.id} style={[ui.card, { backgroundColor: palette.background, borderColor: palette.border }]} >
      <View style={ui.between}><View style={ui.row}><Icon name={status === 'Rejected' ? 'close-circle-outline' : status === 'Approved' ? 'checkmark-circle-outline' : status === 'More Information Required' ? 'information-circle-outline' : 'time-outline'} color={palette.text} /><View style={[ui.badge, { backgroundColor: palette.badge }]}><Text style={{ color: palette.text, fontSize: 12, fontWeight: '700' }}>{status ?? 'Status unavailable'}</Text></View></View><Badge status={item.isRead ? 'Read' : 'Unread'} /></View>
      <Text style={ui.sectionTitle}>{item.title}</Text><Text style={ui.caption}>{item.warrantyRequestId} · {item.customerName || 'Customer'}</Text><Text style={ui.body}>{item.message}</Text>
      <Text style={ui.subtitle}>{formatDate(item.createdAt)}{item.createdAt ? ' · ' + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      <View style={ui.row}>{!item.isRead && <Button title="Mark as read" kind="secondary" disabled={mutation.pending} onPress={() => { void mutation.run(() => markRead(item.id), 'Notification marked as read in Firestore.'); }} />}<Button title="View request" kind="secondary" disabled={!item.warrantyRequestId || mutation.pending} onPress={() => navigation.navigate('CustomerApplianceInfo', { warrantyRequestId: item.warrantyRequestId })} /></View>
    </View>; })}
  </Page>;
}
