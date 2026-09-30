import { Text, View } from 'react-native';
import { Badge, Button, Card, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { formatDate } from '../../utils/providerWorkflow';
import type { ProviderTabProps } from '../../navigation/providerTypes';
export default function ProviderNotificationsScreen({ navigation }: ProviderTabProps<'Notifications'>) {
  const { state, markRead } = useProviderModule(), unread = state.notifications.filter(item => !item.isRead).length;
  return <Page title="Notifications" subtitle={unread + ' unread · Updates from your warranty requests'}>
    <View style={ui.between}><Text style={ui.caption}>REQUEST ACTIVITY</Text><Button title="Mark all as read" kind="secondary" disabled={!unread} onPress={() => markRead()} /></View>
    {state.notifications.length === 0 && <Notice text="You’re all caught up. Request updates will appear here." />}
    {[...state.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(item => <Card key={item.id}>
      <View style={ui.between}><Icon name={item.isRead ? 'notifications-outline' : 'notifications'} /><Badge status={item.isRead ? 'Read' : 'Unread'} /></View>
      <Text style={ui.sectionTitle}>{item.title}</Text><Text style={ui.caption}>{item.warrantyRequestId} · {item.customerName}</Text><Text style={ui.body}>{item.message}</Text>
      <Text style={ui.subtitle}>{formatDate(item.createdAt)} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      <View style={ui.row}>{!item.isRead && <Button title="Mark as read" kind="secondary" onPress={() => markRead(item.id)} />}<Button title="View request" kind="secondary" onPress={() => { markRead(item.id); navigation.navigate('CustomerApplianceInfo', { requestId: item.warrantyRequestId }); }} /></View>
    </Card>)}
  </Page>;
}
