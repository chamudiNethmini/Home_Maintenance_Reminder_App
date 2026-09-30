import { Text } from 'react-native';
import { Badge, Card, Detail, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
export default function ProviderProfileScreen() {
  return <Page title="Provider Profile" subtitle="Your FixMate workspace"><Card><Icon name="person-circle-outline" size={64} /><Text style={ui.heading}>Mr. Sadhu</Text><Badge status="Warranty Provider" /><Detail label="Workspace" value="FixMate" /><Detail label="Mode" value="Local preview" /></Card><Notice text="This is a sample provider profile. Account details will come from the shared authentication module." /></Page>;
}
