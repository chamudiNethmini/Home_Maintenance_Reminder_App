import { Text, View } from 'react-native';
import { Badge, Button, Card, Icon, ui } from './ProviderUI';
import type { RequestSummary } from '../../types/provider';
import { formatDate } from '../../utils/providerWorkflow';
export function RequestCard({ item, onView }: { item: RequestSummary; onView: () => void }) {
  return <Card><View style={ui.between}><Text style={[ui.caption, { fontSize: 12 }]}>{item.request.id}</Text><Badge status={item.request.status} /></View>
    <View style={ui.row}><Icon name="cube-outline" size={28} /><View style={{ flex: 1 }}><Text style={ui.sectionTitle}>{item.applianceName}</Text><Text style={ui.subtitle}>{item.customerName}{item.applianceBrand ? ' · ' + item.applianceBrand : ''}</Text></View></View>
    <View style={ui.between}><Text style={ui.subtitle}>{formatDate(item.request.createdAt)}</Text><Button title="View" kind="secondary" icon="arrow-forward" onPress={onView} /></View>
  </Card>;
}
